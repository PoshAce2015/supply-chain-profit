// Security utilities for authentication and form protection

/** Generate a random CSRF token */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Store CSRF token in session storage */
export function storeCSRFToken(token: string): void {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch (error) {
    console.warn('Failed to store CSRF token:', error);
  }
}

/** Get stored CSRF token */
export function getCSRFToken(): string | null {
  try {
    return sessionStorage.getItem('csrf_token');
  } catch (error) {
    console.warn('Failed to get CSRF token:', error);
    return null;
  }
}

/** Validate CSRF token */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken === token;
}

/** Rate limiting utilities */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/** Check if action is rate limited */
export function isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }
  
  if (entry.count >= maxAttempts) {
    return true;
  }
  
  entry.count++;
  return false;
}

/** Get remaining attempts for rate limited action */
export function getRemainingAttempts(key: string, maxAttempts: number = 5): number {
  const entry = rateLimitStore.get(key);
  if (!entry || Date.now() > entry.resetTime) {
    return maxAttempts;
  }
  return Math.max(0, maxAttempts - entry.count);
}

/** Clear rate limit for a key */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/** Password strength validation */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one lowercase letter');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one uppercase letter');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one number');
  }
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one special character');
  }
  
  return {
    score,
    feedback,
    isValid: score >= 4
  };
}

/** Get password strength color */
export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return 'text-red-500';
  if (score <= 2) return 'text-orange-500';
  if (score <= 3) return 'text-yellow-500';
  if (score <= 4) return 'text-blue-500';
  return 'text-green-500';
}

/** Get password strength label */
export function getPasswordStrengthLabel(score: number): string {
  if (score <= 1) return 'Very Weak';
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Fair';
  if (score <= 4) return 'Good';
  return 'Strong';
}

/** Input sanitization */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/** Email validation */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/** Generate secure random string */
export function generateSecureString(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  
  return result;
}

/** Hash string (simple implementation for demo) */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Account lockout management */
interface LockoutEntry {
  attempts: number;
  lockedUntil: number;
}

const lockoutStore = new Map<string, LockoutEntry>();

/** Check if account is locked */
export function isAccountLocked(email: string): boolean {
  const entry = lockoutStore.get(email);
  if (!entry) return false;
  
  if (Date.now() > entry.lockedUntil) {
    lockoutStore.delete(email);
    return false;
  }
  
  return true;
}

/** Record failed login attempt */
export function recordFailedAttempt(email: string, lockoutDuration: number = 15 * 60 * 1000): void {
  const entry = lockoutStore.get(email) || { attempts: 0, lockedUntil: 0 };
  entry.attempts++;
  
  if (entry.attempts >= 5) {
    entry.lockedUntil = Date.now() + lockoutDuration;
  }
  
  lockoutStore.set(email, entry);
}

/** Clear failed attempts for account */
export function clearFailedAttempts(email: string): void {
  lockoutStore.delete(email);
}

/** Get lockout time remaining */
export function getLockoutTimeRemaining(email: string): number {
  const entry = lockoutStore.get(email);
  if (!entry || entry.lockedUntil === 0) return 0;
  
  const remaining = entry.lockedUntil - Date.now();
  return Math.max(0, remaining);
}
