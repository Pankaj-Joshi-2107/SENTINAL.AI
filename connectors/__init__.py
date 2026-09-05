# Sentinel-AI — Social Media Platform Connectors
# Each connector is a self-contained module that:
#   1. Connects to a platform's real-time data stream
#   2. Normalizes events into the SentinelEvent format
#   3. POSTs events to the Express backend relay endpoint
#
# Available connectors:
#   - x_connector.py    → X (Twitter) Filtered Stream v2
#   - (future) reddit_connector.py  → Reddit PushShift / PRAW
#   - (future) telegram_connector.py → Telegram MTProto channels
