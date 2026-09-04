import React from "react";

export const XLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" aria-label="X" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const TelegramLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" aria-label="Telegram" className={className} fill="none">
    <circle cx="12" cy="12" r="12" fill="#24A1DE" />
    <path
      d="M17.7 7.1c.14.05.28.16.33.32.07.21.03.45-.06.65-.58 2.76-2.01 9.49-2.38 11.23-.15.7-.54 1-.95 1.02-.87.05-1.53-.6-2.38-1.15-1.32-.86-2.07-1.4-3.35-2.24-1.48-.97-.52-1.51.32-2.39.22-.23 4.07-3.73 4.15-4.06.01-.04.02-.19-.07-.27-.09-.08-.22-.05-.32-.03-.14.03-2.35 1.49-6.64 4.39-.63.43-1.2.64-1.71.63-.56-.01-1.64-.32-2.44-.58-.98-.32-1.76-.49-1.69-1.03.04-.28.43-.57 1.17-.86 4.58-1.99 7.64-3.3 9.17-3.94 4.36-1.81 5.27-2.13 5.86-2.14.13 0 .42.03.55.17z"
      fill="#FFFFFF"
    />
  </svg>
);

export const InstagramLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" aria-label="Instagram" className={className} fill="none">
    <defs>
      <radialGradient id="ig-rad-logo" cx="20%" cy="110%" r="130%">
        <stop offset="0%" stopColor="#ffdb55" />
        <stop offset="20%" stopColor="#f58529" />
        <stop offset="40%" stopColor="#dd2a7b" />
        <stop offset="60%" stopColor="#8134af" />
        <stop offset="100%" stopColor="#515bd4" />
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="6.5" fill="url(#ig-rad-logo)" />
    <rect x="4.5" y="4.5" width="15" height="15" rx="4.2" stroke="#ffffff" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3.7" stroke="#ffffff" strokeWidth="1.7" />
    <circle cx="16.4" cy="7.6" r="1.1" fill="#ffffff" />
  </svg>
);

export const FacebookLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" aria-label="Facebook" className={className} fill="none">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      d="M15.5 12h-2.5v7h-3v-7h-2v-2.5h2V7.7c0-2.3 1.2-3.6 3.5-3.6 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.1 0-1.4.7-1.4 1.4v1.7h2.6l-.2 2.2z"
      fill="#ffffff"
    />
  </svg>
);

export const RedditLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" aria-label="Reddit" className={className} fill="none">
    <circle cx="12" cy="12" r="12" fill="#FF4500" />
    <path
      d="M18.5 12c0-.7-.6-1.3-1.3-1.3-.4 0-.7.2-.9.4-1-.7-2.3-1.2-3.8-1.2l.7-3.3 2.3.5c0 .6.5 1 1.1 1 .6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1 .8l-2.6-.5c-.1 0-.3.1-.3.2l-.8 3.7c-1.5 0-2.8.5-3.8 1.2-.2-.2-.5-.4-.9-.4-.7 0-1.3.6-1.3 1.3 0 .5.3.9.7 1.1-.1.3-.1.5-.1.8 0 2.2 2.6 4 5.8 4s5.8-1.8 5.8-4c0-.3 0-.5-.1-.8.4-.2.7-.6.7-1.1zM9.5 13.2c0-.5.4-.9.9-.9s.9.4.9.9-.4.9-.9.9-.9-.4-.9-.9zm5.5 0c0-.5.4-.9.9-.9s.9.4.9.9-.4.9-.9.9-.9-.4-.9-.9zm-5.7 3.3c.3.5 1.3 1 2.5 1s2.2-.5 2.5-1c.1-.1 0-.3-.1-.4-.1-.1-.3 0-.4.1-.3.3-1.1.7-2 .7-.9 0-1.7-.4-2-.7-.1-.1-.3-.2-.4-.1-.1.1-.1.3 0 .4z"
      fill="#ffffff"
    />
  </svg>
);

export const YouTubeLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" aria-label="YouTube" className={className} fill="none">
    <rect x="1.5" y="4" width="21" height="16" rx="4.8" fill="#FF0000" />
    <path d="M10 8.5l5.5 3.5-5.5 3.5V8.5z" fill="#ffffff" />
  </svg>
);
