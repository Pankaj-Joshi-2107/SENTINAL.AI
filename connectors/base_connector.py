"""
base_connector.py — Abstract base class for all Sentinel-AI platform connectors.

Defines the standard interface every connector must implement so that the
AI pipeline never needs to change when a new platform is added.

Usage:
    class MyConnector(BaseConnector):
        def connect(self): ...
        def stream(self): ...
        def normalize(self, raw_event): ...
        def disconnect(self): ...
"""

from abc import ABC, abstractmethod
from typing import Optional


class SentinelEvent:
    """
    Normalized event format shared across all platform connectors.
    Maps directly to the TypeScript Post type in the frontend.
    """
    def __init__(
        self,
        platform: str,
        post_id: str,
        author_id: str,
        username: str,
        display_name: str,
        text: str,
        timestamp: str,           # ISO-8601 UTC string
        urls: list[str],
        hashtags: list[str],
        mentions: list[str],
        likes: int = 0,
        retweets: int = 0,
        replies: int = 0,
        follower_count: int = 0,
        raw: Optional[dict] = None,
    ):
        self.platform = platform
        self.post_id = post_id
        self.author_id = author_id
        self.username = username
        self.display_name = display_name
        self.text = text
        self.timestamp = timestamp
        self.urls = urls
        self.hashtags = hashtags
        self.mentions = mentions
        self.likes = likes
        self.retweets = retweets
        self.replies = replies
        self.follower_count = follower_count
        self.raw = raw  # Original platform payload, for audit only

    def to_dict(self) -> dict:
        """Serialize to dict for JSON transmission to Express backend."""
        return {
            "platform": self.platform,
            "post_id": self.post_id,
            "author_id": self.author_id,
            "username": self.username,
            "display_name": self.display_name,
            "text": self.text,
            "timestamp": self.timestamp,
            "urls": self.urls,
            "hashtags": self.hashtags,
            "mentions": self.mentions,
            "likes": self.likes,
            "retweets": self.retweets,
            "replies": self.replies,
            "follower_count": self.follower_count,
            # NOTE: raw payload is intentionally excluded from transmission
            # to minimize data exposure and payload size.
        }


class BaseConnector(ABC):
    """
    Abstract base class for all Sentinel-AI platform stream connectors.

    Subclass this to add new platform connectors (Reddit, Telegram, etc.)
    without modifying the pipeline or backend.
    """

    def __init__(self, relay_url: str, rules: list[dict]):
        """
        Args:
            relay_url: The Express backend URL to POST normalized events to.
                       e.g. "http://localhost:3000/api/x-events"
            rules: Platform-specific filter rules loaded from filter_rules.json
        """
        self.relay_url = relay_url
        self.rules = rules
        self._running = False

    @abstractmethod
    def connect(self) -> bool:
        """
        Establish connection to the platform stream.
        Returns True on success, False on failure (e.g. invalid credentials).
        Must NEVER log credentials.
        """
        ...

    @abstractmethod
    def stream(self):
        """
        Generator that yields SentinelEvent objects from the platform stream.
        Runs indefinitely until disconnect() is called or a fatal error occurs.
        """
        ...

    @abstractmethod
    def normalize(self, raw_event: dict) -> Optional[SentinelEvent]:
        """
        Convert a raw platform-specific event dict into a SentinelEvent.
        Returns None if the event should be skipped.
        """
        ...

    @abstractmethod
    def disconnect(self):
        """Gracefully close the platform connection."""
        ...

    def is_running(self) -> bool:
        return self._running
