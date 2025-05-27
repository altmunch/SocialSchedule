// Simple test to verify Jest is working
test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});

test('async test', async () => {
  const value = await Promise.resolve(true);
  expect(value).toBe(true);
});
