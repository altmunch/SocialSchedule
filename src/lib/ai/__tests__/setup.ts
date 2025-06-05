// Global test setup
import { TextEncoder, TextDecoder } from 'util';

// Mock global objects
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder as any;

// Mock fetch if needed
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;
}

// Mock console methods to keep test output clean
const originalConsole = { ...console };
const consoleMocks = ['log', 'warn', 'error', 'debug'] as const;

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Mock console methods
  consoleMocks.forEach(method => {
    jest.spyOn(console, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  // Restore original console methods
  consoleMocks.forEach(method => {
    (console[method] as jest.Mock).mockRestore();
  });
});

// Set test environment variables
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    NODE_ENV: 'test',
    OPENAI_API_KEY: 'test-api-key',
    REDIS_URL: 'redis://localhost:6379',
  },
  configurable: true,
  writable: false,
});

// Mock Redis client
jest.mock('ioredis', () => {
  const mRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  };
  return jest.fn(() => mRedis);
});

// Mock OpenAI client
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  sentiment: 'neutral',
                  score: 0,
                  confidence: 0.9
                })
              }
            }],
            usage: { total_tokens: 10 }
          })
        }
      }
    }))
  };
});
