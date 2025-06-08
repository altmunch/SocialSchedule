// Jest configuration for TypeScript with ES modules support

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'], // Keep this fix
  
  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/'],
  
  // Module handling
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
  // Transform settings
  transform: {
    '^.+\.[tj]s$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }], // Reverted to simpler ts-jest config
  },
  
  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Force exit
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Show individual test results
  // testResultsProcessor: 'jest-sonar-reporter', // Keep this commented
  
  // Collect coverage
  collectCoverage: false
};
