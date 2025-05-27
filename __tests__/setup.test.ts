// Simple test to verify Jest is working correctly
describe('Jest Setup Test', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle async code', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should test basic math', () => {
    expect(2 + 2).toBe(4);
  });
});
