// Simple Jest test
const { test, expect } = require('@jest/globals');

test('simple test', () => {
  console.log('Running simple Jest test...');
  expect(true).toBe(true);
});
