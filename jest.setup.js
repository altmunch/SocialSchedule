// Global test setup
const { TextEncoder, TextDecoder } = require('util');

// Add missing globals for Node.js test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock global fetch if not available
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Mock console methods to keep test output clean
const originalConsole = { ...console };

beforeEach(() => {
  // Mock console methods
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    // Don't log expected errors in tests
    const errorMessage = args[0];
    if (errorMessage && 
        (errorMessage.includes('Error: connect ECONNREFUSED') || 
         errorMessage.includes('Error: getaddrinfo ENOTFOUND'))) {
      return;
    }
    originalConsole.error(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    // Suppress expected warnings
    const warningMessage = args[0];
    if (warningMessage && warningMessage.includes('React does not recognize')) {
      return;
    }
    originalConsole.warn(...args);
  });
});

afterEach(() => {
  // Restore original console methods
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(30000);
