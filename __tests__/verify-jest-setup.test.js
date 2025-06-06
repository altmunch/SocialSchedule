// Simple test to verify Jest setup
const { test, expect } = require('@jest/globals');

console.log('Running Jest setup verification...');

test('Jest is working', () => {
  console.log('Running test...');
  expect(true).toBe(true);
  console.log('Test completed');
});
