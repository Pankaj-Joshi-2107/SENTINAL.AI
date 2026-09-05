export type Platform = "twitter" | "x" | "reddit" | "instagram" | "facebook" | "linkedin" | "threads";

export type SentimentType = "positive" | "neutral" | "negative";
export type EmotionType = "Joy" | "Anger" | "Sadness" | "Fear" | "Disgust" | "Neutral";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RecommendedAction = "NO ACTION" | "MONITOR" | "FLAG FOR REVIEW" | "ESCALATE";

export interface Post {
  id: string;
  username: string;
  displayName: string;
  platform: Platform;
  timestamp: string;
  text: string;
  hashtags: string[];
  url?: string;
  likes: number;
  comments: number;
  shares: number;
  followerCount: number;
  campaignId?: string;
  scenario: "normal" | "cyberbullying" | "coordinated";
  sentiment?: SentimentType;
  sentimentScore?: number; // -1.0 to 1.0
  toxicityScore?: number; // 0 to 100
  cyberbullyingRisk?: number; // 0 to 100
  topic?: string;
}

export interface Account {
  id?: string;
  username: string;
  displayName: string;
  avatar: string;
  followerCount: number;
  followingCount: number;
  accountAgeDays: number;
  verified: boolean;
  totalPosts: number;
  behaviorScore: number; // 0 - 100
  riskLevel: RiskLevel;
  campaignIds: string[];
  botProbability: number; // 0 - 100
  burstActivity: boolean;
  repeatedContentRate: number;
  sharedHashtags: string[];
  bio?: string;
}

export interface CoordinationBreakdown {
  temporalProximity: number;
  contentSimilarity: number;
  sharedHashtags: number;
  sharedUrls: number;
  activityBurst: number;
}

export interface ThreatBreakdown {
  nlpRisk: number; // 30%
  coordinationScore: number; // 20%
  accountBehavior: number; // 20%
  contentSimilarity: number; // 15%
  historicalSimilarity: number; // 15%
}

export interface HistoricalMatch {
  campaignName: string;
  similarity: number;
  matchPercentage?: number;
  matchingPhrases: string[];
  historicalRisk: RiskLevel;
  characteristics: string[];
  patternSimilarity?: string;
}

export interface Campaign {
  id: string;
  name: string;
  scenario: "normal" | "cyberbullying" | "coordinated";
  timeWindow: string;
  burstWindow?: string;
  postCount: number;
  accountCount: number;
  coordinationScore: number; // 0 - 100
  coordinationBreakdown: CoordinationBreakdown;
  coordinationSignals?: {
    timeSynchronicity: number;
    contentSimilarity: number;
    hashtagOverlap: number;
    accountAgeDistribution: number;
    urlCooccurrence: number;
  };
  threatScore: number; // 0 - 100
  threatBreakdown: ThreatBreakdown;
  threatLevel: RiskLevel;
  sharedHashtags: string[];
  repeatedPhrases: string[];
  sharedUrls: string[];
  accounts: string[];
  accountsInvolved?: string[];
  historicalMatch?: HistoricalMatch;
  summary: string;
  description?: string;
  targetNarrative?: string;
  posts?: string[];
}

export interface HistoricalCampaign {
  id: string;
  name: string;
  representativeText: string;
  hashtags: string[];
  characteristics: string[];
  historicalRiskLevel: RiskLevel;
  knownTactics: string[];
}

export interface ThreatAlert {
  id: string;
  severity: RiskLevel;
  title: string;
  description: string;
  timestamp: string;
  targetRoute: "campaigns" | "cyber-safety" | "trends" | "network";
  targetId?: string;
}

export interface AnalysisResult {
  sentiment: "Positive" | "Neutral" | "Negative";
  sentimentScore: number; // -1.0 to 1.0
  confidence: number; // 0 to 100
  emotion: EmotionType;
  intent: string;
  toxicityScore: number; // 0 to 100
  cyberbullyingRisk: number; // 0 to 100
  threatIndicators: string[];
  topics: string[];
  explanation: string;
  recommendedAction: RecommendedAction;
  isFallback: boolean;
  source: string;
}

export interface SimulationStep {
  step: number;
  title: string;
  message: string;
  status: "pending" | "active" | "completed";
}

export type ActiveTab =
  | "overview"
  | "social-analytics"
  | "post-analyzer"
  | "trends"
  | "audience"
  | "campaigns"
  | "network"
  | "cyber-safety"
  | "threat-center"
  | "settings"
  | "x-stream"
  | "reddit-stream";

/**
 * Normalized event received from the Python X connector via SSE.
 * Mirrors the SentinelEvent.to_dict() output from base_connector.py.
 */
export interface XStreamEvent {
  platform: "x" | "reddit";
  post_id: string;
  author_id: string;
  username: string;
  display_name: string;
  text: string;
  timestamp: string;       // ISO-8601 UTC
  urls: string[];
  hashtags: string[];
  mentions: string[];
  likes: number;
  retweets: number;
  replies: number;
  follower_count: number;
}

/**
 * Status payload returned by GET /api/x-stream/status.
 * Never contains the Bearer Token value.
 */
export interface XStreamStatus {
  tokenConfigured: boolean;
  connectorStatus: "connected" | "disconnected" | "error";
  message: string;
  eventCount: number;
  lastEventTime: string | null;
  activeClients: number;
  activeRuleCount: number;
  rules: { tag: string; description: string }[];
  xApiNote: string | null;
}
