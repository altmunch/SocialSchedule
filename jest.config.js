// difficult: Jest configuration for TypeScript with ES modules support

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  
  // Test file patterns
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s',
    '**/__tests__/**/*.spec.[jt]s',
    '**/__tests__/**/*.test.[jt]sx',
    '**/__tests__/**/*.spec.[jt]sx',
    '**/?(*.)+(spec|test).[jt]s',
    '**/?(*.)+(spec|test).[jt]sx'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Module handling
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Transform settings
  transform: {
    '^.+\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json'
      },
    ],
  },
  
  // Module name mapper
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Test timeout
  testTimeout: 10000,
};
