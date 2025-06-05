import { Mock } from 'jest-mock';

/**
 * Creates a mock analyzer with the specified methods
 */
export const createMockAnalyzer = <T extends Record<string, any>>(methods: T) => {
  return methods as unknown as {
    [K in keyof T]: Mock<ReturnType<T[K]>, Parameters<T[K]>>;
  };
};

/**
 * Creates a mock for the OpenAI client
 */
export const createMockOpenAI = () => ({
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
});

/**
 * Creates a test configuration
 */
export const createTestConfig = (overrides = {}) => ({
  useLocalModel: false,
  openaiApiKey: 'test-key',
  confidenceThreshold: 0.7,
  maxCacheSize: 100,
  cacheTtlMs: 60000,
  costTrackingEnabled: true,
  ...overrides,
});

/**
 * Helper to wait for all pending promises to resolve
 */
export const flushPromises = () => new Promise(setImmediate);
