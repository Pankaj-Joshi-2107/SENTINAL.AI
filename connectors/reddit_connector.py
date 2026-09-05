"""
reddit_connector.py — Reddit API Connector for Sentinel-AI.

Uses PRAW (Python Reddit API Wrapper) to stream public posts and comments
from configured subreddits in real time and relay them into the Sentinel-AI
analysis pipeline.

SECURITY CONTRACT:
  - REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are read ONLY from environment
    variables. They are NEVER logged, printed, or transmitted to the frontend.
  - If credentials are missing, a safe message is printed and the connector exits.
  - Do NOT hardcode credentials here.

API Access:
  The Reddit API is 100% FREE with rate limits:
  - OAuth2 apps: 100 requests per minute
  - Streaming posts: no additional cost
  - Get credentials at: https://www.reddit.com/prefs/apps
  - App type: "script"

Setup:
  1. Go to https://www.reddit.com/prefs/apps → Create App → Script
  2. Note the client_id (under app name) and client_secret
  3. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in your .env file
  4. Run: python connectors/start_reddit_connector.py

Subreddits:
  Configured via connectors/reddit_subreddits.json — edit to add/remove subreddits.
"""

import os
import sys
import time
import threading
from datetime import datetime, timezone
from typing import Optional, Iterator

import requests

# PRAW import with friendly error if not installed
try:
    import praw
    import praw.models
    from prawcore.exceptions import (
        PrawcoreException,
        ServerError,
        ResponseException,
        RequestException,
    )
except ImportError:
    print("[SENTINEL-REDDIT] ERROR: praw is not installed.")
    print("[SENTINEL-REDDIT] Run: pip install -r connectors/requirements.txt")
    sys.exit(1)

sys.path.insert(0, os.path.dirname(__file__))
from base_connector import BaseConnector, SentinelEvent  # noqa: E402

# ──────────────────────────────────────────────────────────────────────────────
# Threat keyword filter — only relay posts that contain at least one match.
# This reduces noise from benign subreddit traffic.
# ──────────────────────────────────────────────────────────────────────────────
THREAT_KEYWORDS = [
    # Cyberbullying / harassment
    "kill yourself", "kys", "you deserve to die", "nobody likes you",
    "delete your account", "worthless", "ugly", "fat", "loser",
    "harass", "harassment", "bully", "bullying", "doxx", "doxing",
    # Threats
    "threat", "threatening", "going to hurt", "watch your back",
    "coming for you", "make you pay", "hunt you down",
    # Phishing / scams
    "free crypto", "free tokens", "airdrop", "claim now", "limited offer",
    "click here", "verify your account", "account suspended",
    "phishing", "scam", "fraud", "giveaway", "win free",
    # Coordinated activity
    "mass report", "flood", "brigade", "raid", "botnet", "astroturf",
    "coordinated", "spam campaign", "fake accounts",
    # Disinformation
    "fake news", "hoax", "conspiracy", "they don't want you to know",
    "deep state", "mainstream media lies",
]

# Max text length to relay downstream
MAX_TEXT_LENGTH = 1000

# Reconnect backoff settings
RECONNECT_DELAY_INITIAL_SECS = 5
RECONNECT_DELAY_MAX_SECS = 300
RECONNECT_BACKOFF_FACTOR = 2


def _passes_keyword_filter(text: str) -> bool:
    """Return True if text contains at least one threat keyword."""
    lower = text.lower()
    return any(kw in lower for kw in THREAT_KEYWORDS)


class RedditConnector(BaseConnector):
    """
    Real-time Reddit stream connector for Sentinel-AI.

    Monitors multiple subreddits simultaneously for new posts and comments,
    filters by threat keywords, normalizes to SentinelEvent format,
    and relays to the Express backend.
    """

    def __init__(self, relay_url: str, subreddits: list[str]):
        # Pass empty rules list — Reddit uses keyword filtering instead
        super().__init__(relay_url, rules=[])
        self._subreddits = subreddits
        self._reddit: Optional[praw.Reddit] = None
        self._event_count = 0
        self._last_event_time: Optional[str] = None
        self._status_lock = threading.Lock()
        self._connection_status = "disconnected"
        self._status_message = "Not started"

        # Check credential presence without storing values
        self._has_credentials = bool(
            os.environ.get("REDDIT_CLIENT_ID", "").strip()
            and os.environ.get("REDDIT_CLIENT_SECRET", "").strip()
        )

    # ──────────────────────────────────────────────────────────────────────
    # BaseConnector Implementation
    # ──────────────────────────────────────────────────────────────────────

    def connect(self) -> bool:
        """
        Initialise the PRAW Reddit client.
        Credentials are read from env — NEVER logged or stored as named attrs.
        """
        if not self._has_credentials:
            self._set_status("error",
                "REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET is not configured. "
                "Set them in your .env file.")
            print("[SENTINEL-REDDIT] Credentials not configured.")
            return False

        try:
            self._reddit = praw.Reddit(
                client_id=os.environ["REDDIT_CLIENT_ID"],
                client_secret=os.environ["REDDIT_CLIENT_SECRET"],
                user_agent=os.environ.get(
                    "REDDIT_USER_AGENT",
                    "SentinelAI:threat-monitor:v1.0 (by /u/sentinel_ai_bot)"
                ),
                # Read-only mode — no account login needed
                ratelimit_seconds=1,
            )
            # Validate credentials with a lightweight call
            _ = self._reddit.subreddit("announcements").id
            print(f"[SENTINEL-REDDIT] Connected to Reddit API (read-only mode)")
            print(f"[SENTINEL-REDDIT] Monitoring {len(self._subreddits)} subreddits: "
                  f"{', '.join(self._subreddits[:5])}{'...' if len(self._subreddits) > 5 else ''}")
            self._set_status("connected", "Ready to stream")
            return True
        except ResponseException as e:
            # HTTP 401/403 — bad credentials
            code = getattr(e.response, "status_code", "?")
            if code == 401:
                self._set_status("error",
                    "Invalid Reddit credentials (HTTP 401). "
                    "Check REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.")
                print("[SENTINEL-REDDIT] Invalid credentials (HTTP 401). Check your .env file.")
            elif code == 403:
                self._set_status("error",
                    "Reddit API access denied (HTTP 403). "
                    "Ensure your app type is 'script' on reddit.com/prefs/apps.")
                print("[SENTINEL-REDDIT] Access denied (HTTP 403). App type must be 'script'.")
            else:
                self._set_status("error", f"Reddit API error (HTTP {code})")
                print(f"[SENTINEL-REDDIT] Reddit API error: HTTP {code}")
            return False
        except Exception as e:
            self._set_status("error", f"Connection error: {type(e).__name__}")
            print(f"[SENTINEL-REDDIT] Connection error: {type(e).__name__}")
            return False

    def stream(self) -> Iterator[SentinelEvent]:
        """
        Stream new submissions and comments from all configured subreddits.
        Uses PRAW's stream generator which handles reconnection automatically.
        Falls back to manual reconnect loop on fatal errors.
        """
        self._running = True
        delay = RECONNECT_DELAY_INITIAL_SECS

        subreddit_str = "+".join(self._subreddits)

        while self._running:
            try:
                multi_sub = self._reddit.subreddit(subreddit_str)
                self._set_status("connected", f"Streaming {len(self._subreddits)} subreddits")
                print(f"[SENTINEL-REDDIT] Streaming r/{subreddit_str[:80]}...")

                # Stream both submissions (posts) and comments simultaneously
                # We interleave by iterating submissions stream primarily
                submission_stream = multi_sub.stream.submissions(
                    skip_existing=True,
                    pause_after=0,
                )
                comment_stream = multi_sub.stream.comments(
                    skip_existing=True,
                    pause_after=0,
                )

                delay = RECONNECT_DELAY_INITIAL_SECS  # Reset on success

                while self._running:
                    # Poll submissions
                    for submission in submission_stream:
                        if not self._running:
                            break
                        if submission is None:
                            break
                        event = self._normalize_submission(submission)
                        if event:
                            with self._status_lock:
                                self._event_count += 1
                                self._last_event_time = datetime.now(timezone.utc).isoformat()
                            yield event

                    # Poll comments
                    for comment in comment_stream:
                        if not self._running:
                            break
                        if comment is None:
                            break
                        event = self._normalize_comment(comment)
                        if event:
                            with self._status_lock:
                                self._event_count += 1
                                self._last_event_time = datetime.now(timezone.utc).isoformat()
                            yield event

            except (ServerError, RequestException):
                print(f"[SENTINEL-REDDIT] Connection lost. Reconnecting in {delay}s...")
                self._set_status("disconnected", f"Reconnecting in {delay}s")
                time.sleep(delay)
                delay = min(delay * RECONNECT_BACKOFF_FACTOR, RECONNECT_DELAY_MAX_SECS)
            except Exception as e:
                print(f"[SENTINEL-REDDIT] Stream error: {type(e).__name__}. Reconnecting in {delay}s...")
                self._set_status("error", f"Error: {type(e).__name__}. Reconnecting...")
                time.sleep(delay)
                delay = min(delay * RECONNECT_BACKOFF_FACTOR, RECONNECT_DELAY_MAX_SECS)

    def normalize(self, raw_event: dict) -> Optional[SentinelEvent]:
        """Not used directly — normalization is split into _normalize_submission and _normalize_comment."""
        return None

    def disconnect(self):
        """Stop streaming."""
        self._running = False
        self._set_status("disconnected", "Stopped by user")
        print("[SENTINEL-REDDIT] Connector stopped.")

    # ──────────────────────────────────────────────────────────────────────
    # Normalization helpers
    # ──────────────────────────────────────────────────────────────────────

    def _normalize_submission(self, submission: "praw.models.Submission") -> Optional[SentinelEvent]:
        """Normalize a Reddit post (submission) to SentinelEvent."""
        try:
            text = f"{submission.title or ''} {submission.selftext or ''}".strip()
            text = text[:MAX_TEXT_LENGTH]

            if not text:
                return None

            # Apply keyword filter to reduce noise
            if not _passes_keyword_filter(text):
                return None

            created_utc = datetime.fromtimestamp(
                submission.created_utc, tz=timezone.utc
            ).isoformat()

            # Extract author safely — deleted posts have None author
            try:
                username = str(submission.author) if submission.author else "[deleted]"
                display_name = username
                follower_count = 0
                try:
                    # Redditor karma as a proxy for account weight
                    follower_count = submission.author.link_karma + submission.author.comment_karma
                except Exception:
                    pass
            except Exception:
                username = "[deleted]"
                display_name = "[deleted]"
                follower_count = 0

            # Extract URL if it's a link post
            urls = []
            if submission.url and not submission.is_self:
                if not submission.url.startswith("https://www.reddit.com"):
                    urls = [submission.url]

            hashtags = [f"#{submission.subreddit.display_name}"]
            mentions = []

            return SentinelEvent(
                platform="reddit",
                post_id=f"t3_{submission.id}",
                author_id=str(submission.author_fullname) if hasattr(submission, "author_fullname") else username,
                username=username,
                display_name=display_name,
                text=text,
                timestamp=created_utc,
                urls=urls,
                hashtags=hashtags,
                mentions=mentions,
                likes=submission.score,
                retweets=0,
                replies=submission.num_comments,
                follower_count=follower_count,
            )
        except Exception:
            return None

    def _normalize_comment(self, comment: "praw.models.Comment") -> Optional[SentinelEvent]:
        """Normalize a Reddit comment to SentinelEvent."""
        try:
            text = (comment.body or "").strip()[:MAX_TEXT_LENGTH]
            if not text or text in ("[deleted]", "[removed]"):
                return None

            # Apply keyword filter
            if not _passes_keyword_filter(text):
                return None

            created_utc = datetime.fromtimestamp(
                comment.created_utc, tz=timezone.utc
            ).isoformat()

            try:
                username = str(comment.author) if comment.author else "[deleted]"
                display_name = username
                follower_count = 0
                try:
                    follower_count = comment.author.link_karma + comment.author.comment_karma
                except Exception:
                    pass
            except Exception:
                username = "[deleted]"
                display_name = "[deleted]"
                follower_count = 0

            hashtags = []
            try:
                hashtags = [f"#{comment.subreddit.display_name}"]
            except Exception:
                pass

            return SentinelEvent(
                platform="reddit",
                post_id=f"t1_{comment.id}",
                author_id=str(comment.author_fullname) if hasattr(comment, "author_fullname") else username,
                username=username,
                display_name=display_name,
                text=text,
                timestamp=created_utc,
                urls=[],
                hashtags=hashtags,
                mentions=[],
                likes=comment.score,
                retweets=0,
                replies=0,
                follower_count=follower_count,
            )
        except Exception:
            return None

    # ──────────────────────────────────────────────────────────────────────
    # Status reporting (safe — never exposes credentials)
    # ──────────────────────────────────────────────────────────────────────

    def _set_status(self, status: str, message: str):
        with self._status_lock:
            self._connection_status = status
            self._status_message = message

    def get_status(self) -> dict:
        with self._status_lock:
            return {
                "status": self._connection_status,
                "message": self._status_message,
                "eventCount": self._event_count,
                "lastEventTime": self._last_event_time,
                "subreddits": self._subreddits,
                "keywordFilterCount": len(THREAT_KEYWORDS),
            }

    # ──────────────────────────────────────────────────────────────────────
    # Relay to Express backend
    # ──────────────────────────────────────────────────────────────────────

    def relay_event(self, event: SentinelEvent):
        """POST normalized event to Sentinel-AI Express backend."""
        try:
            resp = requests.post(
                self.relay_url,
                json=event.to_dict(),
                timeout=5,
            )
            if resp.status_code not in (200, 201):
                print(f"[SENTINEL-REDDIT] Relay failed: HTTP {resp.status_code}")
        except requests.exceptions.ConnectionError:
            print("[SENTINEL-REDDIT] Cannot reach Express backend. Is the dev server running?")
        except Exception as e:
            print(f"[SENTINEL-REDDIT] Relay error: {type(e).__name__}")

    def run(self):
        """Main entry point."""
        print("[SENTINEL-REDDIT] Starting Sentinel-AI Reddit Connector...")
        print(f"[SENTINEL-REDDIT] Relay target: {self.relay_url}")
        print(f"[SENTINEL-REDDIT] Subreddits: {len(self._subreddits)}")
        print(f"[SENTINEL-REDDIT] Keyword filters: {len(THREAT_KEYWORDS)}")

        if not self.connect():
            print("[SENTINEL-REDDIT] Connector exiting due to connection failure.")
            sys.exit(1)

        print("[SENTINEL-REDDIT] Streaming Reddit events to Sentinel-AI pipeline...")

        for event in self.stream():
            self.relay_event(event)
