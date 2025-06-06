// Import Jest's globals
import { describe, it, expect } from '@jest/globals';

// Simple test to verify Jest is working
describe('Minimal Jest Test', () => {
  it('should pass a basic test', () => {
    console.log('Running minimal Jest test...');
    expect(1 + 1).toBe(2);
  });
});
