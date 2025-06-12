import { SentimentAnalyzerConfig } from "../sentimentAnalyzer";
import { OpenAI } from "openai";

export function createTestConfig(overrides?: Partial<SentimentAnalyzerConfig>): SentimentAnalyzerConfig {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY || "test-api-key",
    useLocalModel: false,
    confidenceThreshold: 0.7,
    maxCacheSize: 1000,
    cacheTtlMs: 24 * 60 * 60 * 1000, // 24 hours
    costTrackingEnabled: true,
    ...overrides,
  };
}

export function createMockOpenAI(): jest.Mocked<OpenAI> {
  return {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  } as unknown as jest.Mocked<OpenAI>;
} 