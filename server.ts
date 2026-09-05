import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini initialization with lazy/safe handling
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    aiAvailable: hasKey,
    mode: "SIMULATED_SOCIAL_STREAM",
    version: "2.4.0",
  });
});

// Post analysis endpoint with Gemini + fallback safety
app.post("/api/analyze-post", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Return flag indicating offline fallback should be used
    res.json({
      success: false,
      fallback: true,
      reason: "No active Gemini API key configured",
    });
    return;
  }

  try {
    const prompt = `Analyze this social media post for social sentiment, intent, cyberbullying, harassment, and threat indicators:
"""
${text.slice(0, 1000)}
"""

Provide an honest, objective intelligence evaluation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are SENTINEL-AI's social media and cyber threat intelligence assistant for Team Syntrix. You assist human moderation. Evaluate sentiment (-1.0 to 1.0), dominant emotion (joy, anger, sadness, fear, disgust, neutral), intent, toxicityScore (0 to 100), cyberbullyingRisk (0 to 100), threatIndicators (list of strings), extractedTopics (list of strings), plainExplanation (clear 2-sentence summary), and recommendedAction (one of: 'NO ACTION', 'MONITOR', 'FLAG FOR REVIEW', 'ESCALATE'). Return valid JSON matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: "Positive, Neutral, or Negative" },
            sentimentScore: { type: Type.NUMBER, description: "From -1.0 to 1.0" },
            confidence: { type: Type.NUMBER, description: "Confidence percentage 0 to 100" },
            emotion: { type: Type.STRING, description: "Dominant emotion" },
            intent: { type: Type.STRING, description: "Author intent (e.g. Advocacy, Harassment, Discussion, Spam, Threat)" },
            toxicityScore: { type: Type.NUMBER, description: "Toxicity/Harassment score 0 to 100" },
            cyberbullyingRisk: { type: Type.NUMBER, description: "Cyberbullying risk score 0 to 100" },
            threatIndicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific threat or behavioral red flags detected",
            },
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Extracted topics and entities",
            },
            explanation: { type: Type.STRING, description: "Plain-English 2-sentence explanation of findings" },
            recommendedAction: {
              type: Type.STRING,
              description: "Recommended human moderator action: NO ACTION, MONITOR, FLAG FOR REVIEW, or ESCALATE",
            },
          },
          required: [
            "sentiment",
            "sentimentScore",
            "confidence",
            "emotion",
            "intent",
            "toxicityScore",
            "cyberbullyingRisk",
            "threatIndicators",
            "topics",
            "explanation",
            "recommendedAction",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(resultText);
    res.json({
      success: true,
      fallback: false,
      analysis: parsed,
      source: "Gemini 3.8 Flash",
    });
  } catch (error: any) {
    console.warn("Gemini API call failed, flagging for client deterministic fallback:", error?.message);
    res.json({
      success: false,
      fallback: true,
      reason: error?.message || "Gemini processing error",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// X (Twitter) Real-Time Stream Relay
//
// Architecture:
//   Python x_connector.py  →  POST /api/x-events  →  SSE fan-out → browser
//
// Security contract:
//   - X_BEARER_TOKEN is consumed ONLY by the Python connector process.
//   - This Node.js server never reads, stores, or transmits the Bearer Token.
//   - The /api/x-stream/status response intentionally excludes any credential.
// ─────────────────────────────────────────────────────────────────────────────

/** Active SSE response streams keyed by a per-connection ID */
const xSseClients = new Map<string, import("express").Response>();

/** Running event count and last-event metadata (safe — no token) */
let xEventCount = 0;
let xLastEventTime: string | null = null;
let xConnectorStatus = "disconnected";
let xConnectorMessage = "Waiting for connector...";
let xActiveRuleCount = 0;
let xRuleSummaries: { tag: string; description: string }[] = [];

/** Ring buffer of recent events so newly opened tabs or reconnecting clients see recent posts */
const recentEventsBuffer: any[] = [];

/**
 * POST /api/x-events
 * Receives a normalized SentinelEvent JSON from the Python connector.
 * Fans the event out to all active SSE browser clients.
 * Internal endpoint — not intended for browser direct use.
 */
app.post("/api/x-events", (req, res) => {
  const event = req.body;
  if (!event || typeof event !== "object" || !event.post_id) {
    res.status(400).json({ error: "Invalid event payload" });
    return;
  }

  // Sanitize: ensure no token-like fields are forwarded
  const safe = {
    platform: String(event.platform || "x"),
    post_id: String(event.post_id || ""),
    author_id: String(event.author_id || ""),
    username: String(event.username || ""),
    display_name: String(event.display_name || ""),
    text: String(event.text || "").slice(0, 1000),
    timestamp: String(event.timestamp || new Date().toISOString()),
    urls: Array.isArray(event.urls) ? event.urls.slice(0, 10) : [],
    hashtags: Array.isArray(event.hashtags) ? event.hashtags.slice(0, 20) : [],
    mentions: Array.isArray(event.mentions) ? event.mentions.slice(0, 20) : [],
    likes: Number(event.likes) || 0,
    retweets: Number(event.retweets) || 0,
    replies: Number(event.replies) || 0,
    follower_count: Number(event.follower_count) || 0,
  };

  xEventCount++;
  xLastEventTime = new Date().toISOString();
  xConnectorStatus = "connected";

  // Store in ring buffer (keep last 50)
  recentEventsBuffer.unshift(safe);
  if (recentEventsBuffer.length > 50) recentEventsBuffer.pop();

  // Fan out to all SSE clients
  const payload = `data: ${JSON.stringify(safe)}\n\n`;
  for (const [id, client] of xSseClients.entries()) {
    try {
      client.write(payload);
    } catch {
      xSseClients.delete(id);
    }
  }

  res.json({ ok: true, delivered: xSseClients.size });
});

/**
 * GET /api/x-events/recent
 * Returns recent buffered events for a specific platform or all platforms.
 */
app.get("/api/x-events/recent", (req, res) => {
  const platform = req.query.platform as string | undefined;
  const filtered = platform
    ? recentEventsBuffer.filter((e) => e.platform === platform)
    : recentEventsBuffer;
  res.json({ events: filtered });
});

/**
 * POST /api/x-events/simulate
 * Injects a realistic test event directly from the dashboard UI with 1-click.
 * Dynamically synthesizes varied threat scenarios and subreddits so posts do not repeat.
 */
app.post("/api/x-events/simulate", (req, res) => {
  const platform = (req.body?.platform === "reddit" ? "reddit" : "x") as string;
  const randNum = Math.floor(Math.random() * 900) + 100;
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const redditScenarios = [
    {
      subreddit: "r/cybersecurity",
      role: "Security Researcher",
      user: `sec_analyst_${randNum}`,
      text: `[ALERT] New zero-day vulnerability actively exploited in the wild targeting popular SSO gateways. Patch advisory CVE-2026-${randNum} issued. Check firewall logs immediately.`,
      urls: [`https://threatintel.cve-radar.io/advisory-2026-${randNum}`],
      hashtags: ["#ZeroDay", "#CyberSecurity", "#PatchNow"],
      likes: Math.floor(Math.random() * 200) + 30,
      replies: Math.floor(Math.random() * 40) + 5,
    },
    {
      subreddit: "r/CryptoCurrency",
      role: "Phishing Bot",
      user: `airdrop_bot_${randNum}`,
      text: `🚨 URGENT: Solana foundation is distributing $5,000 compensation airdrop to all active wallet addresses. Connect and sign verification transaction at sol-claim-${randNum}.finance now!`,
      urls: [`https://sol-claim-${randNum}.finance`],
      hashtags: ["#Solana", "#AirdropAlert", "#CryptoScam"],
      likes: 3,
      replies: Math.floor(Math.random() * 15) + 8,
    },
    {
      subreddit: "r/privacy",
      role: "Whistleblower",
      user: `anon_leak_${randNum}`,
      text: `Exposing coordinated data brokers selling real-time geolocation telemetry of university students. Full investigative dataset linked below.`,
      urls: [`https://privacywatch.org/reports/data-broker-leak-${randNum}`],
      hashtags: ["#Privacy", "#DataLeak", "#Surveillance"],
      likes: Math.floor(Math.random() * 150) + 50,
      replies: Math.floor(Math.random() * 30) + 10,
    },
    {
      subreddit: "r/teenagers",
      role: "Harassment Swarm",
      user: `target_caller_${randNum}`,
      text: `Everyone brigade this user's profile and mass-downvote all their uploads until they delete their account. Don't let them post here again.`,
      urls: [],
      hashtags: ["#Brigading", "#MassReport", "#Harassment"],
      likes: 1,
      replies: Math.floor(Math.random() * 25) + 4,
    },
    {
      subreddit: "r/scams",
      role: "Victim Report",
      user: `scam_victim_${randNum}`,
      text: `Warning: Received an SMS claiming my banking app was locked with a link to secure-login-bank-auth.com. Do not enter credentials, it steals 2FA tokens!`,
      urls: ["https://secure-login-bank-auth.com/verify"],
      hashtags: ["#Smishing", "#BankScam", "#PhishingWarning"],
      likes: Math.floor(Math.random() * 80) + 20,
      replies: Math.floor(Math.random() * 18) + 2,
    },
    {
      subreddit: "r/technology",
      role: "Tech Reporter",
      user: `byte_dispatch_${randNum}`,
      text: `AI-generated audio deepfakes used in $25M CEO impersonation wire fraud attack against multinational firm, authorities confirm.`,
      urls: [`https://technews.io/articles/ai-deepfake-fraud-${randNum}`],
      hashtags: ["#ArtificialIntelligence", "#Deepfake", "#CyberCrime"],
      likes: Math.floor(Math.random() * 300) + 100,
      replies: Math.floor(Math.random() * 60) + 20,
    },
    {
      subreddit: "r/conspiracy",
      role: "Disinformation Swarm",
      user: `truth_seeker_${randNum}`,
      text: `Leaked internal documents prove government weather control satellites caused the recent storm surge. Mainstream media is covering it up. Share before censored!`,
      urls: [`https://unfiltered-truth-leaks-${randNum}.net`],
      hashtags: ["#CoverUp", "#Conspiracy", "#FakeNews"],
      likes: Math.floor(Math.random() * 60) + 10,
      replies: Math.floor(Math.random() * 50) + 15,
    },
    {
      subreddit: "r/netsec",
      role: "Threat Hunter",
      user: `infosec_sentinel_${randNum}`,
      text: `New Infostealer campaign distributing Lumma Stealer disguised as cracked video editing software via Discord and YouTube descriptions. IOCs attached.`,
      urls: [`https://github.com/ioc-feed/lumma-indicators-${randNum}`],
      hashtags: ["#Malware", "#InfoStealer", "#ThreatIntel"],
      likes: Math.floor(Math.random() * 120) + 40,
      replies: Math.floor(Math.random() * 12) + 3,
    }
  ];

  const xScenarios = [
    {
      role: "Crypto Phishing",
      user: `claim_eth_${randNum}`,
      name: `Vitalik Support Agent ${randNum}`,
      text: `Breaking: Ethereum 2.0 staking rewards bonus is now claimable for the next 2 hours only. Verify your signature at eth-rewards-portal-${randNum}.org!`,
      urls: [`https://eth-rewards-portal-${randNum}.org`],
      hashtags: ["#Ethereum", "#Airdrop", "#CryptoGiveaway"],
      likes: Math.floor(Math.random() * 400) + 50,
      retweets: Math.floor(Math.random() * 100) + 10,
      replies: Math.floor(Math.random() * 30) + 5,
    },
    {
      role: "Doxxing / Harassment",
      user: `doxx_strike_${randNum}`,
      name: `Anon Watcher ${randNum}`,
      text: `Found your home address and employer details. Keep talking and see what gets mailed to your HR department on Monday morning.`,
      urls: [],
      hashtags: ["#Doxx", "#TargetAcquired"],
      likes: 0,
      retweets: 1,
      replies: Math.floor(Math.random() * 8) + 2,
    },
    {
      role: "Brand Impersonation",
      user: `support_helpdesk_${randNum}`,
      name: `Official Bank Customer Care`,
      text: `Your account was temporarily suspended due to unusual activity. Click here to verify identity within 24 hours: https://bank-verify-portal-${randNum}.net`,
      urls: [`https://bank-verify-portal-${randNum}.net`],
      hashtags: ["#CustomerSupport", "#SecurityAlert"],
      likes: 2,
      retweets: 0,
      replies: Math.floor(Math.random() * 14) + 3,
    }
  ];

  let postPayload: any;

  if (platform === "reddit") {
    const s = redditScenarios[Math.floor(Math.random() * redditScenarios.length)];
    postPayload = {
      platform: "reddit",
      post_id: `t3_${uniqueId}`,
      author_id: `u_${s.user}`,
      username: s.user,
      display_name: `${s.subreddit} · ${s.role}`,
      text: s.text,
      urls: s.urls,
      hashtags: s.hashtags,
      mentions: [],
      likes: s.likes,
      retweets: 0,
      replies: s.replies,
      follower_count: Math.floor(Math.random() * 8000) + 50,
      timestamp: new Date().toISOString(),
    };
  } else {
    const s = xScenarios[Math.floor(Math.random() * xScenarios.length)];
    postPayload = {
      platform: "x",
      post_id: `tw_${uniqueId}`,
      author_id: `tw_${s.user}`,
      username: s.user,
      display_name: s.name,
      text: s.text,
      urls: s.urls,
      hashtags: s.hashtags,
      mentions: [],
      likes: s.likes,
      retweets: s.retweets,
      replies: s.replies,
      follower_count: Math.floor(Math.random() * 3000) + 10,
      timestamp: new Date().toISOString(),
    };
  }

  xEventCount++;
  xLastEventTime = new Date().toISOString();
  xConnectorStatus = "connected";

  recentEventsBuffer.unshift(postPayload);
  if (recentEventsBuffer.length > 50) recentEventsBuffer.pop();

  const payload = `data: ${JSON.stringify(postPayload)}\n\n`;
  for (const [id, client] of xSseClients.entries()) {
    try {
      client.write(payload);
    } catch {
      xSseClients.delete(id);
    }
  }

  res.json({ ok: true, event: postPayload, delivered: xSseClients.size });
});

/**
 * POST /api/x-events/clear
 * Clears the event buffer so the user can wipe the live feed.
 */
app.post("/api/x-events/clear", (req, res) => {
  const platform = req.body?.platform;
  if (platform) {
    for (let i = recentEventsBuffer.length - 1; i >= 0; i--) {
      if (recentEventsBuffer[i].platform === platform) {
        recentEventsBuffer.splice(i, 1);
      }
    }
  } else {
    recentEventsBuffer.length = 0;
  }
  res.json({ ok: true, remaining: recentEventsBuffer.length });
});

/**
 * POST /api/x-stream/connector-status
 * Called by the Python connector to report its own status (connected/error/etc).
 * Safe: only accepts status string and message — never credentials.
 */
app.post("/api/x-stream/connector-status", (req, res) => {
  const { status, message, activeRuleCount, rules } = req.body;
  if (status) xConnectorStatus = String(status).slice(0, 50);
  if (message) xConnectorMessage = String(message).slice(0, 200);
  if (typeof activeRuleCount === "number") xActiveRuleCount = activeRuleCount;
  if (Array.isArray(rules)) xRuleSummaries = rules.slice(0, 20);
  res.json({ ok: true });
});

/**
 * GET /api/x-events  (SSE)
 * Browser subscribes here to receive live events pushed in real time.
 * Uses Server-Sent Events (EventSource protocol).
 */
app.get("/api/x-events", (req, res) => {
  const clientId = `sse-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send a connection acknowledgment event
  res.write(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`);

  // Immediately replay recent buffered events so new tab/reconnecting clients have instant feed
  for (const ev of [...recentEventsBuffer].reverse()) {
    res.write(`data: ${JSON.stringify(ev)}\n\n`);
  }

  xSseClients.set(clientId, res);

  // Heartbeat every 25s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeat);
      xSseClients.delete(clientId);
    }
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    xSseClients.delete(clientId);
  });
});

/**
 * GET /api/x-stream/status
 * Returns connector health for the dashboard status card.
 * SECURITY: Never returns X_BEARER_TOKEN or any credential.
 */
app.get("/api/x-stream/status", (_req, res) => {
  const hasToken = Boolean(
    process.env.X_BEARER_TOKEN && process.env.X_BEARER_TOKEN.trim() !== ""
  );

  res.json({
    // Token presence only — never the value
    tokenConfigured: hasToken,
    connectorStatus: xConnectorStatus,
    message: hasToken
      ? xConnectorMessage
      : "X_BEARER_TOKEN is not configured. Set it in your .env file.",
    eventCount: xEventCount,
    lastEventTime: xLastEventTime,
    activeClients: xSseClients.size,
    activeRuleCount: xActiveRuleCount || 0,
    rules: xRuleSummaries,
    xApiNote: hasToken
      ? null
      : "Filtered Stream requires X API Basic plan (~$100/mo) or higher.",
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SENTINEL-AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
