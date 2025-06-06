// Simple test to verify Jest is working
const { test, expect } = require('@jest/globals');

console.log('Verifying Jest is working...');

test('1 + 1 equals 2', () => {
  console.log('Running test...');
  expect(1 + 1).toBe(2);
  console.log('Test completed');
});
