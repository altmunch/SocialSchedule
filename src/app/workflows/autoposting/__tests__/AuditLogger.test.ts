import { AuditLogger } from '../AuditLogger';

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  it('logs actions and retrieves them', () => {
    logger.log('post', 'user1', { id: 1 });
    logger.log('status_change', 'user2', { status: 'scheduled' });
    expect(logger.getLogs().length).toBe(2);
    expect(logger.getLogs('user1').length).toBe(1);
  });

  it('verifies log integrity', () => {
    logger.log('action1');
    logger.log('action2');
    expect(logger.verifyIntegrity()).toBe(true);
  });
}); 