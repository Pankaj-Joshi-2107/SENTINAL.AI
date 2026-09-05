"""
start_x_connector.py — CLI entry point for the Sentinel-AI X Stream Connector.

This script:
  1. Loads .env (if present) — so you can set X_BEARER_TOKEN there
  2. Loads filter rules from connectors/filter_rules.json
  3. Starts the XConnector which streams matching tweets to the Express backend

SECURITY:
  - The token is read from X_BEARER_TOKEN environment variable only.
  - It is never printed, logged, or displayed anywhere by this script.
  - If the token is missing, a clear safe message is shown and the script exits.

Usage:
  # From the project root (e.g. SENTINAL.AI/)
  python connectors/start_x_connector.py

  # Or with custom relay URL and rules file:
  RELAY_URL=http://localhost:3000/api/x-events python connectors/start_x_connector.py
"""

import json
import os
import sys

# ── Load .env file if present (before any imports that read env vars) ──────────
def _load_dotenv():
    """
    Minimal .env loader — reads KEY=VALUE lines and sets os.environ.
    Avoids requiring python-dotenv as a dependency.
    Does NOT log any values read from .env.
    """
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    env_path = os.path.normpath(env_path)
    if not os.path.isfile(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value

_load_dotenv()

# ── Now import the connector (after env is loaded) ─────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))
from x_connector import XConnector  # noqa: E402


def main():
    # Relay URL (where the Express backend is listening)
    relay_url = os.environ.get("RELAY_URL", "http://localhost:3000/api/x-events")

    # Load filter rules from JSON file
    rules_path = os.path.join(os.path.dirname(__file__), "filter_rules.json")
    if not os.path.isfile(rules_path):
        print(f"[SENTINEL-X] ERROR: Filter rules file not found: {rules_path}")
        sys.exit(1)

    with open(rules_path, "r", encoding="utf-8") as f:
        rules = json.load(f)

    if not rules:
        print("[SENTINEL-X] WARNING: No filter rules configured. "
              "Edit connectors/filter_rules.json to add rules.")

    # Security check — confirm token is present without printing its value
    has_token = bool(os.environ.get("X_BEARER_TOKEN", "").strip())
    if not has_token:
        print("")
        print("=" * 60)
        print(" SENTINEL-AI X Connector — Configuration Required")
        print("=" * 60)
        print("")
        print("  X_BEARER_TOKEN is not configured.")
        print("")
        print("  To enable live X (Twitter) streaming:")
        print("  1. Create an X Developer App at developer.twitter.com")
        print("  2. Ensure your app has Basic plan access or higher")
        print("     (Filtered Stream requires Basic plan, ~$100/mo)")
        print("  3. Copy your Bearer Token")
        print("  4. Add it to your .env file:")
        print("     X_BEARER_TOKEN=<your-token-here>")
        print("  5. Restart the connector")
        print("")
        print("  The Sentinel-AI dashboard remains fully functional")
        print("  with simulated data while the connector is offline.")
        print("")
        print("  To test the pipeline without a real token, inject a")
        print("  test event via curl:")
        print('  curl -X POST http://localhost:3000/api/x-events \\')
        print('    -H "Content-Type: application/json" \\')
        print('    -d @connectors/test_event.json')
        print("")
        sys.exit(0)

    # Start the connector
    connector = XConnector(relay_url=relay_url, rules=rules)
    try:
        connector.run()
    except KeyboardInterrupt:
        connector.disconnect()
        print("")
        print("[SENTINEL-X] Connector stopped by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
