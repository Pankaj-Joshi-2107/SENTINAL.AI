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
