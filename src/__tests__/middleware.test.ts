import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Basic unit test for redirect logic

describe('middleware', () => {
  it('redirects non-team user from /team-dashboard', async () => {
    // Mock request
    const req = {
      nextUrl: new URL('http://localhost:3000/team-dashboard'),
      cookies: {},
    } as unknown as NextRequest;

    const res = await middleware(req as any);
    expect(res.headers.get('location')).toBe('/dashboard');
  });
}); 