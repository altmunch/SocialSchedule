// Simple test to verify Jest setup
const { test, expect } = require('@jest/globals');

console.log('Verifying Jest setup...');

test('Jest is working correctly', () => {
  console.log('Running test...');
  expect(1 + 1).toBe(2);
  console.log('Test completed');
});
