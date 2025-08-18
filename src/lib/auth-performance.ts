// Performance optimizations for authentication

/** Debounce function calls */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/** Throttle function calls */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/** Cache for expensive operations */
class Cache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxAge: number;

  constructor(maxAge: number = 5 * 60 * 1000) { // 5 minutes default
    this.maxAge = maxAge;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/** Email validation cache */
const emailValidationCache = new Cache<boolean>();

/** Cached email validation */
export function cachedValidateEmail(email: string): boolean {
  const cached = emailValidationCache.get(email);
  if (cached !== null) {
    return cached;
  }
  
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  emailValidationCache.set(email, isValid);
  return isValid;
}

/** Password strength cache */
const passwordStrengthCache = new Cache<{ score: number; feedback: string[] }>();

/** Cached password strength validation */
export function cachedValidatePasswordStrength(password: string): { score: number; feedback: string[] } {
  const cached = passwordStrengthCache.get(password);
  if (cached !== null) {
    return cached;
  }
  
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('At least one lowercase letter');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('At least one uppercase letter');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('At least one number');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('At least one special character');
  
  const result = { score, feedback };
  passwordStrengthCache.set(password, result);
  return result;
}

/** Form validation cache */
const formValidationCache = new Cache<{ isValid: boolean; errors: Record<string, string> }>();

/** Cached form validation */
export function cachedValidateForm(data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } {
  const key = JSON.stringify(data);
  const cached = formValidationCache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  const errors: Record<string, string> = {};
  
  // Email validation
  if (data.email && !cachedValidateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (data.password) {
    const strength = cachedValidatePasswordStrength(data.password);
    if (strength.score < 4) {
      errors.password = 'Password does not meet strength requirements';
    }
  }
  
  // Password confirmation
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  const result = { isValid: Object.keys(errors).length === 0, errors };
  formValidationCache.set(key, result);
  return result;
}

/** Lazy loading for heavy components */
export function lazyLoad<T>(importFunc: () => Promise<{ default: T }>): T {
  let component: T | null = null;
  let loading = false;
  let promise: Promise<T> | null = null;
  
  return new Proxy({} as T, {
    get(target, prop) {
      if (!component && !loading) {
        loading = true;
        promise = importFunc().then(module => {
          component = module.default;
          loading = false;
          return component;
        });
      }
      
      if (component) {
        return (component as any)[prop];
      }
      
      if (promise) {
        throw promise;
      }
      
      return undefined;
    }
  });
}

/** Optimized input sanitization */
const sanitizationCache = new Cache<string>();

export function cachedSanitizeInput(input: string): string {
  const cached = sanitizationCache.get(input);
  if (cached !== null) {
    return cached;
  }
  
  const sanitized = input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
  
  sanitizationCache.set(input, sanitized);
  return sanitized;
}

/** Performance monitoring */
export class PerformanceMonitor {
  private metrics: Record<string, number[]> = {};
  
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics[name]) {
        this.metrics[name] = [];
      }
      this.metrics[name].push(duration);
      
      // Keep only last 100 measurements
      if (this.metrics[name].length > 100) {
        this.metrics[name] = this.metrics[name].slice(-100);
      }
    };
  }
  
  getAverageTime(name: string): number {
    const measurements = this.metrics[name];
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }
  
  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    for (const [name, measurements] of Object.entries(this.metrics)) {
      result[name] = {
        average: this.getAverageTime(name),
        count: measurements.length
      };
    }
    
    return result;
  }
  
  clear(): void {
    this.metrics = {};
  }
}

/** Global performance monitor instance */
export const authPerformanceMonitor = new PerformanceMonitor();

/** Optimized form submission */
export function optimizedFormSubmission<T>(
  submitFunc: (data: T) => Promise<any>,
  validateFunc: (data: T) => { isValid: boolean; errors: Record<string, string> }
) {
  return async (data: T) => {
    const stopTimer = authPerformanceMonitor.startTimer('form_submission');
    
    try {
      // Validate first
      const validation = validateFunc(data);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }
      
      // Submit if valid
      const result = await submitFunc(data);
      stopTimer();
      return { success: true, result };
    } catch (error) {
      stopTimer();
      return { success: false, error };
    }
  };
}

/** Memory management utilities */
export function cleanupCaches(): void {
  emailValidationCache.clear();
  passwordStrengthCache.clear();
  formValidationCache.clear();
  sanitizationCache.clear();
}

/** Auto-cleanup on page unload */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupCaches);
}

/** Batch operations for multiple validations */
export function batchValidate(validations: Array<() => boolean>): boolean[] {
  return validations.map(validation => {
    const stopTimer = authPerformanceMonitor.startTimer('batch_validation');
    const result = validation();
    stopTimer();
    return result;
  });
}
