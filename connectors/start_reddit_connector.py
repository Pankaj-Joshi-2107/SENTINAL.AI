"""
start_reddit_connector.py — CLI entry point for Sentinel-AI Reddit Connector.

SECURITY:
  - REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are read from env only.
  - Never printed, logged, or displayed anywhere.
  - If missing, a clear setup guide is shown and the script exits safely.

Usage:
  python connectors/start_reddit_connector.py

  # With custom relay URL:
  RELAY_URL=http://localhost:3000/api/stream-events python connectors/start_reddit_connector.py
"""

import json
import os
import sys


def _load_dotenv():
    """Minimal .env loader — does NOT log any values read."""
    env_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".env"))
    if not os.path.isfile(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


_load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))
from reddit_connector import RedditConnector  # noqa: E402


def main():
    relay_url = os.environ.get("RELAY_URL", "http://localhost:3000/api/x-events")

    # Load subreddits config
    subreddits_path = os.path.join(os.path.dirname(__file__), "reddit_subreddits.json")
    if not os.path.isfile(subreddits_path):
        print(f"[SENTINEL-REDDIT] ERROR: Subreddits config not found: {subreddits_path}")
        sys.exit(1)

    with open(subreddits_path, "r", encoding="utf-8") as f:
        subreddits = json.load(f)

    if not subreddits:
        print("[SENTINEL-REDDIT] WARNING: No subreddits configured in reddit_subreddits.json")

    # Check credentials without printing them
    has_id = bool(os.environ.get("REDDIT_CLIENT_ID", "").strip())
    has_secret = bool(os.environ.get("REDDIT_CLIENT_SECRET", "").strip())

    if not has_id or not has_secret:
        print("")
        print("=" * 60)
        print(" SENTINEL-AI Reddit Connector — Configuration Required")
        print("=" * 60)
        print("")
        if not has_id:
            print("  REDDIT_CLIENT_ID is not configured.")
        if not has_secret:
            print("  REDDIT_CLIENT_SECRET is not configured.")
        print("")
        print("  To enable live Reddit streaming (100% FREE):")
        print("")
        print("  Step 1: Create a Reddit Script App")
        print("    → Go to: https://www.reddit.com/prefs/apps")
        print("    → Click 'Create App' or 'Create Another App'")
        print("    → Name: Sentinel-AI (or anything)")
        print("    → Type: Select 'script'  ← IMPORTANT")
        print("    → Redirect URI: http://localhost:8080")
        print("    → Click 'Create app'")
        print("")
        print("  Step 2: Get your credentials from the app page:")
        print("    → client_id:     The short string under your app name")
        print("    → client_secret: The 'secret' field")
        print("")
        print("  Step 3: Add to your .env file:")
        print("    REDDIT_CLIENT_ID=your_client_id_here")
        print("    REDDIT_CLIENT_SECRET=your_client_secret_here")
        print("")
        print("  Step 4: Run this connector again:")
        print("    python connectors/start_reddit_connector.py")
        print("")
        print("  The Sentinel-AI dashboard works with simulated data")
        print("  while the connector is offline.")
        print("")
        sys.exit(0)

    connector = RedditConnector(relay_url=relay_url, subreddits=subreddits)
    try:
        connector.run()
    except KeyboardInterrupt:
        connector.disconnect()
        print("")
        print("[SENTINEL-REDDIT] Connector stopped by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
