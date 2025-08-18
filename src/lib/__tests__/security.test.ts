import {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  isRateLimited,
  getRemainingAttempts,
  clearRateLimit,
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  sanitizeInput,
  validateEmail,
  generateSecureString,
  hashString,
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
  getLockoutTimeRemaining
} from '../security';

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    subtle: {
      digest: jest.fn().mockResolvedValue(new Uint8Array(32))
    }
  }
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('Security Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any stored data
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('CSRF Token Management', () => {
    it('generates a valid CSRF token', () => {
      const token = generateCSRFToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
    });

    it('stores CSRF token in session storage', () => {
      const token = generateCSRFToken();
      storeCSRFToken(token);
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
    });

    it('retrieves CSRF token from session storage', () => {
      const token = 'test-csrf-token';
      mockSessionStorage.getItem.mockReturnValue(token);
      
      const retrievedToken = getCSRFToken();
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('csrf_token');
      expect(retrievedToken).toBe(token);
    });

    it('returns null when CSRF token is not found', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const token = getCSRFToken();
      
      expect(token).toBeNull();
    });

    it('validates CSRF token correctly', () => {
      const token = 'test-csrf-token';
      mockSessionStorage.getItem.mockReturnValue(token);
      
      expect(validateCSRFToken(token)).toBe(true);
      expect(validateCSRFToken('wrong-token')).toBe(false);
    });

    it('handles session storage errors gracefully', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => storeCSRFToken('test-token')).not.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Reset rate limit store
      jest.clearAllMocks();
    });

    it('allows requests within rate limit', () => {
      const key = 'test-key';
      
      expect(isRateLimited(key, 5, 60000)).toBe(false);
      expect(isRateLimited(key, 5, 60000)).toBe(false);
      expect(isRateLimited(key, 5, 60000)).toBe(false);
    });

    it('blocks requests when rate limit is exceeded', () => {
      const key = 'test-key';
      
      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        expect(isRateLimited(key, 5, 60000)).toBe(false);
      }
      
      // 6th request should be blocked
      expect(isRateLimited(key, 5, 60000)).toBe(true);
    });

    it('resets rate limit after time window', () => {
      const key = 'test-key';
      
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        expect(isRateLimited(key, 5, 100)).toBe(false);
      }
      
      // Wait for time window to expire
      jest.advanceTimersByTime(200);
      
      // Should allow requests again
      expect(isRateLimited(key, 5, 100)).toBe(false);
    });

    it('returns correct remaining attempts', () => {
      const key = 'test-key';
      
      expect(getRemainingAttempts(key, 5)).toBe(5);
      
      // Make 2 requests
      isRateLimited(key, 5, 60000);
      isRateLimited(key, 5, 60000);
      
      expect(getRemainingAttempts(key, 5)).toBe(3);
    });

    it('clears rate limit for a key', () => {
      const key = 'test-key';
      
      // Make some requests
      isRateLimited(key, 5, 60000);
      isRateLimited(key, 5, 60000);
      
      expect(getRemainingAttempts(key, 5)).toBe(3);
      
      clearRateLimit(key);
      
      expect(getRemainingAttempts(key, 5)).toBe(5);
    });
  });

  describe('Password Strength Validation', () => {
    it('validates strong password correctly', () => {
      const result = validatePasswordStrength('StrongPass123!');
      
      expect(result.score).toBe(5);
      expect(result.isValid).toBe(true);
      expect(result.feedback).toHaveLength(0);
    });

    it('validates weak password correctly', () => {
      const result = validatePasswordStrength('weak');
      
      expect(result.score).toBe(1);
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('At least 8 characters');
      expect(result.feedback).toContain('At least one uppercase letter');
      expect(result.feedback).toContain('At least one number');
      expect(result.feedback).toContain('At least one special character');
    });

    it('provides specific feedback for missing requirements', () => {
      const result = validatePasswordStrength('password'); // lowercase only
      
      expect(result.score).toBe(2); // length + lowercase
      expect(result.feedback).toContain('At least one uppercase letter');
      expect(result.feedback).toContain('At least one number');
      expect(result.feedback).toContain('At least one special character');
    });

    it('returns correct strength colors', () => {
      expect(getPasswordStrengthColor(1)).toBe('text-red-500');
      expect(getPasswordStrengthColor(2)).toBe('text-orange-500');
      expect(getPasswordStrengthColor(3)).toBe('text-yellow-500');
      expect(getPasswordStrengthColor(4)).toBe('text-blue-500');
      expect(getPasswordStrengthColor(5)).toBe('text-green-500');
    });

    it('returns correct strength labels', () => {
      expect(getPasswordStrengthLabel(1)).toBe('Very Weak');
      expect(getPasswordStrengthLabel(2)).toBe('Weak');
      expect(getPasswordStrengthLabel(3)).toBe('Fair');
      expect(getPasswordStrengthLabel(4)).toBe('Good');
      expect(getPasswordStrengthLabel(5)).toBe('Strong');
    });
  });

  describe('Input Sanitization', () => {
    it('sanitizes input correctly', () => {
      expect(sanitizeInput('  test input  ')).toBe('test input');
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('normal input')).toBe('normal input');
    });

    it('limits input length', () => {
      const longInput = 'a'.repeat(2000);
      const sanitized = sanitizeInput(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });

    it('handles empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });
  });

  describe('Email Validation', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('rejects emails that are too long', () => {
      const longEmail = 'a'.repeat(255) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('Secure String Generation', () => {
    it('generates string of correct length', () => {
      const result = generateSecureString(16);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(16);
    });

    it('generates different strings on each call', () => {
      const result1 = generateSecureString(10);
      const result2 = generateSecureString(10);
      
      expect(result1).not.toBe(result2);
    });

    it('uses correct character set', () => {
      const result = generateSecureString(100);
      const validChars = /^[A-Za-z0-9]+$/;
      
      expect(validChars.test(result)).toBe(true);
    });
  });

  describe('String Hashing', () => {
    it('hashes string correctly', async () => {
      const result = await hashString('test input');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // SHA-256 = 32 bytes = 64 hex chars
      expect(/^[0-9a-f]{64}$/.test(result)).toBe(true);
    });

    it('generates different hashes for different inputs', async () => {
      const hash1 = await hashString('input1');
      const hash2 = await hashString('input2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('generates same hash for same input', async () => {
      const hash1 = await hashString('same input');
      const hash2 = await hashString('same input');
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('Account Lockout Management', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('tracks failed attempts correctly', () => {
      const email = 'test@example.com';
      
      expect(isAccountLocked(email)).toBe(false);
      
      // Record 4 failed attempts
      for (let i = 0; i < 4; i++) {
        recordFailedAttempt(email);
      }
      
      expect(isAccountLocked(email)).toBe(false);
      
      // 5th attempt should lock the account
      recordFailedAttempt(email);
      expect(isAccountLocked(email)).toBe(true);
    });

    it('locks account for specified duration', () => {
      const email = 'test@example.com';
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(email);
      }
      
      expect(isAccountLocked(email)).toBe(true);
      
      // Check lockout time remaining
      const remaining = getLockoutTimeRemaining(email);
      expect(remaining).toBeGreaterThan(0);
    });

    it('unlocks account after lockout period', () => {
      const email = 'test@example.com';
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(email, 100); // 100ms lockout
      }
      
      expect(isAccountLocked(email)).toBe(true);
      
      // Wait for lockout to expire
      jest.advanceTimersByTime(200);
      
      expect(isAccountLocked(email)).toBe(false);
    });

    it('clears failed attempts', () => {
      const email = 'test@example.com';
      
      // Record some failed attempts
      recordFailedAttempt(email);
      recordFailedAttempt(email);
      
      clearFailedAttempts(email);
      
      expect(isAccountLocked(email)).toBe(false);
      expect(getLockoutTimeRemaining(email)).toBe(0);
    });

    it('returns correct lockout time remaining', () => {
      const email = 'test@example.com';
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(email, 1000); // 1 second lockout
      }
      
      const remaining = getLockoutTimeRemaining(email);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(1000);
    });

    it('returns 0 for non-locked accounts', () => {
      const email = 'test@example.com';
      
      expect(getLockoutTimeRemaining(email)).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles crypto API errors gracefully', () => {
      // Mock crypto error
      const originalCrypto = window.crypto;
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: jest.fn(() => {
            throw new Error('Crypto error');
          })
        }
      });
      
      expect(() => generateCSRFToken()).not.toThrow();
      
      // Restore original crypto
      Object.defineProperty(window, 'crypto', {
        value: originalCrypto
      });
    });

    it('handles session storage errors gracefully', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => storeCSRFToken('test-token')).not.toThrow();
    });

    it('handles null/undefined inputs', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('handles very long inputs', () => {
      const longInput = 'a'.repeat(10000);
      const sanitized = sanitizeInput(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Integration Tests', () => {
    it('complete authentication flow with security measures', async () => {
      const email = 'test@example.com';
      const password = 'StrongPass123!';
      
      // Validate email
      expect(validateEmail(email)).toBe(true);
      
      // Validate password strength
      const strength = validatePasswordStrength(password);
      expect(strength.isValid).toBe(true);
      
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      expect(sanitizedEmail).toBe(email);
      expect(sanitizedPassword).toBe(password);
      
      // Generate CSRF token
      const csrfToken = generateCSRFToken();
      expect(csrfToken).toBeDefined();
      
      // Store and validate CSRF token
      storeCSRFToken(csrfToken);
      expect(validateCSRFToken(csrfToken)).toBe(true);
      
      // Check rate limiting
      expect(isRateLimited(`login_${email}`)).toBe(false);
      
      // Simulate failed login attempts
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(email);
      }
      
      expect(isAccountLocked(email)).toBe(true);
      
      // Clear failed attempts
      clearFailedAttempts(email);
      expect(isAccountLocked(email)).toBe(false);
    });
  });
});
