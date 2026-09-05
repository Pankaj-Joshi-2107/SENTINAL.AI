"""
x_connector.py — X (Twitter) API v2 Filtered Stream Connector for Sentinel-AI.

SECURITY CONTRACT:
  - The Bearer Token is read ONLY from the X_BEARER_TOKEN environment variable.
  - The token is NEVER logged, printed, included in error messages,
    or transmitted to the frontend in any form.
  - If the token is missing or invalid, a safe human-readable message is shown.
  - No credentials are hardcoded anywhere in this file.

Requirements:
  pip install -r connectors/requirements.txt

Usage:
  python connectors/start_x_connector.py

X API Access:
  The Filtered Stream endpoint requires X API Basic plan (~$100/mo) or higher.
  Free/Essential tier returns HTTP 403. The connector handles this gracefully.

Architecture:
  1. Reads filter rules from connectors/filter_rules.json
  2. Connects to stream.twitter.com/2/tweets/search/stream with expansions
  3. Normalizes each tweet into SentinelEvent (see base_connector.py)
  4. POSTs the normalized event to http://localhost:3000/api/x-events
  5. The Express relay fans the event out to all SSE-subscribed browser clients
"""

import json
import os
import sys
import time
import threading
from datetime import datetime, timezone
from typing import Optional, Iterator

import requests

from base_connector import BaseConnector, SentinelEvent

# ──────────────────────────────────────────────────────────────────────────────
# Constants — never put a real token here
# ──────────────────────────────────────────────────────────────────────────────

X_STREAM_URL = "https://api.twitter.com/2/tweets/search/stream"
X_RULES_URL = "https://api.twitter.com/2/tweets/search/stream/rules"

# Request expansions and fields to receive with each tweet
TWEET_FIELDS = "created_at,author_id,public_metrics,entities,lang"
EXPANSIONS = "author_id"
USER_FIELDS = "username,name,public_metrics"

# Retry backoff settings
RECONNECT_DELAY_INITIAL_SECS = 5
RECONNECT_DELAY_MAX_SECS = 300
RECONNECT_BACKOFF_FACTOR = 2

# Maximum text length to send downstream (safety truncation)
MAX_TEXT_LENGTH = 1000

# Rules file path (relative to project root)
RULES_FILE = os.path.join(os.path.dirname(__file__), "filter_rules.json")


class XConnector(BaseConnector):
    """
    Real-time X (Twitter) Filtered Stream connector.

    Streams matching public tweets, normalizes them, and relays them
    to the Sentinel-AI Express backend via HTTP POST.
    """

    def __init__(self, relay_url: str, rules: list[dict]):
        super().__init__(relay_url, rules)
        self._session: Optional[requests.Session] = None
        self._stream_response: Optional[requests.Response] = None
        self._event_count = 0
        self._last_event_time: Optional[str] = None
        self._status_lock = threading.Lock()
        self._connection_status = "disconnected"  # "connected" | "disconnected" | "error"
        self._status_message = "Not started"

        # Token is loaded here — NEVER stored as a class attribute or logged
        self._has_token = bool(
            os.environ.get("X_BEARER_TOKEN", "").strip()
        )

    # ──────────────────────────────────────────────────────────────────────
    # Internal helper: returns auth headers without ever logging the token
    # ──────────────────────────────────────────────────────────────────────

    def _get_auth_headers(self) -> Optional[dict]:
        """
        Build Bearer Token auth headers.
        Returns None if the token is not configured.
        The token value is intentionally never stored in a named variable
        that could be accidentally printed or logged.
        """
        token = os.environ.get("X_BEARER_TOKEN", "").strip()
        if not token:
            return None
        return {"Authorization": f"Bearer {token}"}

    # ──────────────────────────────────────────────────────────────────────
    # Rule Management
    # ──────────────────────────────────────────────────────────────────────

    def _get_existing_rules(self) -> list[dict]:
        headers = self._get_auth_headers()
        if not headers:
            return []
        try:
            resp = requests.get(X_RULES_URL, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("data", []) or []
        except Exception:
            pass
        return []

    def _delete_rules(self, rule_ids: list[str]) -> bool:
        if not rule_ids:
            return True
        headers = self._get_auth_headers()
        if not headers:
            return False
        try:
            resp = requests.post(
                X_RULES_URL,
                headers={**headers, "Content-Type": "application/json"},
                json={"delete": {"ids": rule_ids}},
                timeout=10,
            )
            return resp.status_code == 200
        except Exception:
            return False

    def _add_rules(self, rules: list[dict]) -> bool:
        headers = self._get_auth_headers()
        if not headers:
            return False
        payload = {"add": [{"value": r["value"], "tag": r["tag"]} for r in rules]}
        try:
            resp = requests.post(
                X_RULES_URL,
                headers={**headers, "Content-Type": "application/json"},
                json=payload,
                timeout=10,
            )
            if resp.status_code in (200, 201):
                data = resp.json()
                errors = data.get("errors", [])
                if errors:
                    print(f"[SENTINEL-X] Rule add errors: {len(errors)} rule(s) rejected by X API")
                return True
            else:
                # Do NOT print resp.text as it could contain token-related details
                print(f"[SENTINEL-X] Rule add failed: HTTP {resp.status_code}")
                return False
        except Exception as e:
            print(f"[SENTINEL-X] Rule add exception: {type(e).__name__}")
            return False

    def _sync_rules(self) -> bool:
        """Delete all existing rules and add the configured ones."""
        print("[SENTINEL-X] Syncing filter rules to X API...")
        existing = self._get_existing_rules()
        if existing:
            ids = [r["id"] for r in existing]
            self._delete_rules(ids)
            print(f"[SENTINEL-X] Removed {len(ids)} existing rule(s)")
        success = self._add_rules(self.rules)
        if success:
            print(f"[SENTINEL-X] Applied {len(self.rules)} Sentinel filter rule(s)")
        return success

    # ──────────────────────────────────────────────────────────────────────
    # BaseConnector Implementation
    # ──────────────────────────────────────────────────────────────────────

    def connect(self) -> bool:
        """
        Validate credentials and sync filter rules to X API.
        Returns False (with safe message) if the token is missing or invalid.
        """
        if not self._has_token:
            self._set_status("error", "X_BEARER_TOKEN is not configured. "
                             "Set it in your .env file to enable the live stream.")
            print("[SENTINEL-X] X_BEARER_TOKEN is not configured.")
            return False

        headers = self._get_auth_headers()
        # Validate token by checking existing rules (lightweight call)
        try:
            resp = requests.get(X_RULES_URL, headers=headers, timeout=10)
        except requests.exceptions.ConnectionError:
            self._set_status("error", "Cannot reach X API. Check your internet connection.")
            print("[SENTINEL-X] Cannot reach X API. Check your internet connection.")
            return False
        except Exception as e:
            self._set_status("error", f"Connection error: {type(e).__name__}")
            print(f"[SENTINEL-X] Connection error: {type(e).__name__}")
            return False

        if resp.status_code == 401:
            self._set_status("error", "X Bearer Token is invalid or revoked. "
                             "Check your X Developer Portal.")
            # Safe: we report the HTTP status, not the token value
            print("[SENTINEL-X] X Bearer Token is invalid or revoked (HTTP 401).")
            return False

        if resp.status_code == 403:
            self._set_status("error",
                "X API Filtered Stream requires Basic plan or higher (~$100/mo). "
                "Your current X API access level does not include this endpoint. "
                "Upgrade at developer.twitter.com to enable live streaming.")
            print("[SENTINEL-X] Filtered Stream not available on your X API plan (HTTP 403).")
            print("[SENTINEL-X] Upgrade to Basic or higher at developer.twitter.com")
            return False

        if resp.status_code not in (200, 201):
            self._set_status("error", f"X API returned HTTP {resp.status_code}. Check your developer app settings.")
            print(f"[SENTINEL-X] Unexpected HTTP {resp.status_code} from X API rules endpoint.")
            return False

        # Sync rules
        if not self._sync_rules():
            self._set_status("error", "Failed to sync filter rules. Check your X app permissions.")
            return False

        self._set_status("connected", "Ready to stream")
        return True

    def stream(self) -> Iterator[SentinelEvent]:
        """
        Generator that yields SentinelEvent objects from the X Filtered Stream.
        Handles reconnection with exponential backoff automatically.
        Runs until self._running is False.
        """
        self._running = True
        delay = RECONNECT_DELAY_INITIAL_SECS

        while self._running:
            headers = self._get_auth_headers()
            if not headers:
                self._set_status("error", "X_BEARER_TOKEN is not configured.")
                break

            params = {
                "tweet.fields": TWEET_FIELDS,
                "expansions": EXPANSIONS,
                "user.fields": USER_FIELDS,
            }

            try:
                self._set_status("connected", "Streaming")
                print("[SENTINEL-X] Connecting to X Filtered Stream...")
                with requests.get(
                    X_STREAM_URL,
                    headers=headers,
                    params=params,
                    stream=True,
                    timeout=(10, None),  # 10s connect, no read timeout
                ) as resp:
                    if resp.status_code != 200:
                        self._set_status("error", f"Stream returned HTTP {resp.status_code}")
                        print(f"[SENTINEL-X] Stream error: HTTP {resp.status_code}")
                        time.sleep(delay)
                        delay = min(delay * RECONNECT_BACKOFF_FACTOR, RECONNECT_DELAY_MAX_SECS)
                        continue

                    print("[SENTINEL-X] Stream connected. Waiting for matching tweets...")
                    delay = RECONNECT_DELAY_INITIAL_SECS  # Reset on success

                    for line in resp.iter_lines():
                        if not self._running:
                            break
                        if not line:
                            continue  # Heartbeat empty line
                        try:
                            payload = json.loads(line.decode("utf-8"))
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            continue

                        event = self.normalize(payload)
                        if event:
                            with self._status_lock:
                                self._event_count += 1
                                self._last_event_time = datetime.now(timezone.utc).isoformat()
                            yield event

            except requests.exceptions.ChunkedEncodingError:
                print(f"[SENTINEL-X] Stream disconnected. Reconnecting in {delay}s...")
                self._set_status("disconnected", f"Reconnecting in {delay}s")
                time.sleep(delay)
                delay = min(delay * RECONNECT_BACKOFF_FACTOR, RECONNECT_DELAY_MAX_SECS)
            except requests.exceptions.ConnectionError:
                print(f"[SENTINEL-X] Connection lost. Reconnecting in {delay}s...")
                self._set_status("disconnected", f"Reconnecting in {delay}s")
                time.sleep(delay)
                delay = min(delay * RECONNECT_BACKOFF_FACTOR, RECONNECT_DELAY_MAX_SECS)
            except Exception as e:
                # Log exception type only, never the exception message which might contain token
                print(f"[SENTINEL-X] Unexpected error: {type(e).__name__}. Reconnecting in {delay}s...")
                self._set_status("error", f"Error: {type(e).__name__}. Reconnecting...")
                time.sleep(delay)
                delay = min(delay * RECONNECT_BACKOFF_FACTOR, RECONNECT_DELAY_MAX_SECS)

    def normalize(self, raw: dict) -> Optional[SentinelEvent]:
        """
        Convert a raw X API v2 tweet payload into a SentinelEvent.
        Returns None if the tweet cannot be parsed or should be skipped.
        """
        try:
            tweet = raw.get("data", {})
            if not tweet:
                return None

            tweet_id = tweet.get("id", "")
            text = tweet.get("text", "").strip()
            if not text:
                return None

            # Truncate to max safe length
            text = text[:MAX_TEXT_LENGTH]

            author_id = tweet.get("author_id", "")
            created_at = tweet.get("created_at", datetime.now(timezone.utc).isoformat())

            # Extract user info from expansions
            includes = raw.get("includes", {})
            users = {u["id"]: u for u in includes.get("users", [])}
            user = users.get(author_id, {})
            username = user.get("username", f"user_{author_id[:8]}")
            display_name = user.get("name", username)
            follower_count = user.get("public_metrics", {}).get("followers_count", 0)

            # Public metrics
            metrics = tweet.get("public_metrics", {})
            likes = metrics.get("like_count", 0)
            retweets = metrics.get("retweet_count", 0)
            replies = metrics.get("reply_count", 0)

            # Entities
            entities = tweet.get("entities", {})
            urls = [u.get("expanded_url", u.get("url", "")) for u in entities.get("urls", [])
                    if u.get("expanded_url", "") and "twitter.com" not in u.get("expanded_url", "")]
            hashtags = [f"#{h['tag']}" for h in entities.get("hashtags", [])]
            mentions = [f"@{m['username']}" for m in entities.get("mentions", [])]

            return SentinelEvent(
                platform="x",
                post_id=tweet_id,
                author_id=author_id,
                username=username,
                display_name=display_name,
                text=text,
                timestamp=created_at,
                urls=urls,
                hashtags=hashtags,
                mentions=mentions,
                likes=likes,
                retweets=retweets,
                replies=replies,
                follower_count=follower_count,
                raw=None,  # Raw payload deliberately excluded
            )
        except Exception:
            # Swallow parse errors — never crash the stream for a single bad tweet
            return None

    def disconnect(self):
        """Gracefully stop the stream."""
        self._running = False
        self._set_status("disconnected", "Stopped by user")
        print("[SENTINEL-X] Connector stopped.")

    # ──────────────────────────────────────────────────────────────────────
    # Status reporting (safe — never exposes the token)
    # ──────────────────────────────────────────────────────────────────────

    def _set_status(self, status: str, message: str):
        with self._status_lock:
            self._connection_status = status
            self._status_message = message

    def get_status(self) -> dict:
        """Return safe status dict for the /api/x-stream/status endpoint."""
        with self._status_lock:
            return {
                "status": self._connection_status,
                "message": self._status_message,
                "eventCount": self._event_count,
                "lastEventTime": self._last_event_time,
                "activeRuleCount": len(self.rules),
                "rules": [
                    {"tag": r["tag"], "description": r.get("description", "")}
                    for r in self.rules
                ],
                # token is intentionally absent from this dict
            }

    # ──────────────────────────────────────────────────────────────────────
    # Relay to Express backend
    # ──────────────────────────────────────────────────────────────────────

    def relay_event(self, event: SentinelEvent):
        """POST a normalized event to the Sentinel-AI Express backend."""
        try:
            resp = requests.post(
                self.relay_url,
                json=event.to_dict(),
                timeout=5,
            )
            if resp.status_code not in (200, 201):
                print(f"[SENTINEL-X] Relay failed: HTTP {resp.status_code}")
        except requests.exceptions.ConnectionError:
            print("[SENTINEL-X] Cannot reach Express backend. Is the dev server running?")
        except Exception as e:
            print(f"[SENTINEL-X] Relay error: {type(e).__name__}")

    def run(self):
        """
        Main entry point: connect, then stream and relay events.
        Call this from start_x_connector.py.
        """
        print("[SENTINEL-X] Starting Sentinel-AI X Connector...")
        print(f"[SENTINEL-X] Relay target: {self.relay_url}")
        print(f"[SENTINEL-X] Filter rules loaded: {len(self.rules)}")

        if not self.connect():
            print("[SENTINEL-X] Connector exiting due to connection failure.")
            sys.exit(1)

        print("[SENTINEL-X] Connection established. Streaming events to Sentinel-AI...")

        for event in self.stream():
            self.relay_event(event)
