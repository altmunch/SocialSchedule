import { SecureCredentialsStore } from '../SecureCredentials';

describe('SecureCredentialsStore', () => {
  let store: SecureCredentialsStore;
  const cred = {
    platform: 'tiktok' as const,
    userId: 'user1',
    accessToken: 'token',
    refreshToken: 'refresh',
    expiresAt: Date.now() + 10000,
  };

  beforeEach(() => {
    store = new SecureCredentialsStore();
  });

  it('stores and retrieves credentials', () => {
    store.setCredential(cred);
    expect(store.getCredential('tiktok', 'user1')).toEqual(cred);
  });

  it('removes credentials', () => {
    store.setCredential(cred);
    store.removeCredential('tiktok', 'user1');
    expect(store.getCredential('tiktok', 'user1')).toBeUndefined();
  });

  it('logs audit entries', () => {
    store.setCredential(cred);
    store.getCredential('tiktok', 'user1');
    store.removeCredential('tiktok', 'user1');
    expect(store.getAuditLog().length).toBe(3);
  });
}); 