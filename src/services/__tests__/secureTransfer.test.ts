import { encrypt, decrypt } from '../secureTransfer';
import crypto from 'crypto';

describe('Secure Transfer Service', () => {
  const testSecret = 'test-secret-key-32-characters-long';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encrypt', () => {
    it('should encrypt simple string data', () => {
      const data = 'Hello, World!';
      const result = encrypt(data, testSecret);

      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('payload');
      expect(typeof result.iv).toBe('string');
      expect(typeof result.authTag).toBe('string');
      expect(typeof result.payload).toBe('string');
    });

    it('should encrypt object data', () => {
      const data = { name: 'John', age: 30, active: true };
      const result = encrypt(data, testSecret);

      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('payload');
      expect(result.iv).toHaveLength(24); // 12 bytes = 24 hex chars
      expect(result.authTag).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should encrypt array data', () => {
      const data = [1, 2, 3, 'test', { nested: true }];
      const result = encrypt(data, testSecret);

      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('payload');
    });

    it('should generate different IV for each encryption', () => {
      const data = 'same data';
      const result1 = encrypt(data, testSecret);
      const result2 = encrypt(data, testSecret);

      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.payload).not.toBe(result2.payload);
      expect(result1.authTag).not.toBe(result2.authTag);
    });

    it('should handle null and undefined values', () => {
      const nullResult = encrypt(null, testSecret);
      const undefinedResult = encrypt(undefined, testSecret);

      expect(nullResult).toHaveProperty('iv');
      expect(nullResult).toHaveProperty('authTag');
      expect(nullResult).toHaveProperty('payload');
      
      expect(undefinedResult).toHaveProperty('iv');
      expect(undefinedResult).toHaveProperty('authTag');
      expect(undefinedResult).toHaveProperty('payload');
    });

    it('should use default secret when none provided', () => {
      const data = 'test data';
      const result = encrypt(data);

      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('payload');
    });
  });

  describe('decrypt', () => {
    it('should decrypt simple string data', () => {
      const originalData = 'Hello, World!';
      const encrypted = encrypt(originalData, testSecret);
      const decrypted = decrypt(encrypted, testSecret);

      expect(decrypted).toBe(originalData);
    });

    it('should decrypt object data', () => {
      const originalData = { name: 'John', age: 30, active: true };
      const encrypted = encrypt(originalData, testSecret);
      const decrypted = decrypt(encrypted, testSecret);

      expect(decrypted).toEqual(originalData);
    });

    it('should decrypt array data', () => {
      const originalData = [1, 2, 3, 'test', { nested: true }];
      const encrypted = encrypt(originalData, testSecret);
      const decrypted = decrypt(encrypted, testSecret);

      expect(decrypted).toEqual(originalData);
    });

    it('should decrypt null and undefined values', () => {
      const nullEncrypted = encrypt(null, testSecret);
      const undefinedEncrypted = encrypt(undefined, testSecret);
      
      const nullDecrypted = decrypt(nullEncrypted, testSecret);
      const undefinedDecrypted = decrypt(undefinedEncrypted, testSecret);

      expect(nullDecrypted).toBe(null);
      expect(undefinedDecrypted).toBe(undefined);
    });

    it('should fail with wrong secret', () => {
      const originalData = 'secret message';
      const encrypted = encrypt(originalData, testSecret);
      const wrongSecret = 'wrong-secret-key-32-characters-long';

      expect(() => decrypt(encrypted, wrongSecret)).toThrow();
    });

    it('should fail with tampered payload', () => {
      const originalData = 'secret message';
      const encrypted = encrypt(originalData, testSecret);
      
      // Tamper with payload
      const tamperedEncrypted = {
        ...encrypted,
        payload: encrypted.payload.slice(0, -2) + 'ff'
      };

      expect(() => decrypt(tamperedEncrypted, testSecret)).toThrow();
    });

    it('should fail with tampered auth tag', () => {
      const originalData = 'secret message';
      const encrypted = encrypt(originalData, testSecret);
      
      // Tamper with auth tag
      const tamperedEncrypted = {
        ...encrypted,
        authTag: encrypted.authTag.slice(0, -2) + 'ff'
      };

      expect(() => decrypt(tamperedEncrypted, testSecret)).toThrow();
    });

    it('should fail with tampered IV', () => {
      const originalData = 'secret message';
      const encrypted = encrypt(originalData, testSecret);
      
      // Tamper with IV
      const tamperedEncrypted = {
        ...encrypted,
        iv: encrypted.iv.slice(0, -2) + 'ff'
      };

      expect(() => decrypt(tamperedEncrypted, testSecret)).toThrow();
    });

    it('should fail with invalid hex strings', () => {
      const invalidPacket = {
        iv: 'invalid-hex',
        authTag: 'invalid-hex',
        payload: 'invalid-hex'
      };

      expect(() => decrypt(invalidPacket, testSecret)).toThrow();
    });

    it('should fail with missing packet properties', () => {
      const incompletePacket = {
        iv: '123456789012345678901234',
        authTag: '12345678901234567890123456789012'
        // missing payload
      } as any;

      expect(() => decrypt(incompletePacket, testSecret)).toThrow();
    });
  });

  describe('round-trip encryption/decryption', () => {
    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          id: 123,
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true,
              preferences: ['email', 'sms']
            }
          }
        },
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const encrypted = encrypt(complexData, testSecret);
      const decrypted = decrypt(encrypted, testSecret);

      expect(decrypted).toEqual(complexData);
    });

    it('should handle large data sets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `item-${i}`,
        value: Math.random()
      }));

      const encrypted = encrypt(largeData, testSecret);
      const decrypted = decrypt(encrypted, testSecret);

      expect(decrypted).toEqual(largeData);
      expect(decrypted).toHaveLength(1000);
    });

    it('should handle special characters and unicode', () => {
      const unicodeData = {
        emoji: '🔐🚀💻',
        chinese: '你好世界',
        arabic: 'مرحبا بالعالم',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      };

      const encrypted = encrypt(unicodeData, testSecret);
      const decrypted = decrypt(encrypted, testSecret);

      expect(decrypted).toEqual(unicodeData);
    });
  });

  describe('security properties', () => {
    it('should produce different ciphertexts for same plaintext', () => {
      const data = 'same plaintext';
      const encrypted1 = encrypt(data, testSecret);
      const encrypted2 = encrypt(data, testSecret);

      expect(encrypted1.payload).not.toBe(encrypted2.payload);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.authTag).not.toBe(encrypted2.authTag);
    });

    it('should detect any modification to encrypted data', () => {
      const data = 'sensitive data';
      const encrypted = encrypt(data, testSecret);

      // Test modification of each component
      const modifications = [
        { ...encrypted, iv: encrypted.iv.replace('0', '1') },
        { ...encrypted, authTag: encrypted.authTag.replace('0', '1') },
        { ...encrypted, payload: encrypted.payload.replace('0', '1') }
      ];

      modifications.forEach(modified => {
        expect(() => decrypt(modified, testSecret)).toThrow();
      });
    });

    it('should handle key truncation properly', () => {
      const data = 'test data';
      const longSecret = 'this-is-a-very-long-secret-key-that-exceeds-32-characters';
      const shortSecret = 'short';

      // Both should work (key gets truncated/padded)
      const encryptedLong = encrypt(data, longSecret);
      const encryptedShort = encrypt(data, shortSecret);

      expect(() => decrypt(encryptedLong, longSecret)).not.toThrow();
      expect(() => decrypt(encryptedShort, shortSecret)).not.toThrow();
    });
  });
}); 