// Accessibility utilities for authentication forms

export interface AccessibilityConfig {
  announceChanges: boolean;
  liveRegion: 'polite' | 'assertive' | 'off';
  focusManagement: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

export class AccessibilityManager {
  private config: AccessibilityConfig = {
    announceChanges: true,
    liveRegion: 'polite',
    focusManagement: true,
    keyboardNavigation: true,
    screenReaderSupport: true
  };

  private liveRegion: HTMLElement | null = null;
  private focusTrap: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(config?: Partial<AccessibilityConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeLiveRegion();
  }

  // Live region management
  private initializeLiveRegion(): void {
    if (!this.config.announceChanges) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', this.config.liveRegion);
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.config.announceChanges || !this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear the message after a short delay
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  // Focus management
  setupFocusTrap(container: HTMLElement): void {
    if (!this.config.focusManagement) return;

    this.focusTrap = container;
    this.updateFocusableElements();
    
    // Handle focus trapping
    container.addEventListener('keydown', this.handleFocusTrap.bind(this));
  }

  private updateFocusableElements(): void {
    if (!this.focusTrap) return;

    this.focusableElements = Array.from(
      this.focusTrap.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }) as HTMLElement[];
  }

  private handleFocusTrap(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  // Form accessibility
  setupFormAccessibility(form: HTMLFormElement): void {
    if (!this.config.screenReaderSupport) return;

    // Add form description
    const description = document.createElement('div');
    description.id = 'form-description';
    description.setAttribute('aria-describedby', 'form-description');
    description.className = 'sr-only';
    description.textContent = 'Authentication form with email and password fields';
    form.appendChild(description);

    // Setup field descriptions
    this.setupFieldDescriptions(form);
  }

  private setupFieldDescriptions(form: HTMLFormElement): void {
    const emailField = form.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordField = form.querySelector('input[type="password"]') as HTMLInputElement;

    if (emailField) {
      emailField.setAttribute('aria-describedby', 'email-description');
      const emailDesc = document.createElement('div');
      emailDesc.id = 'email-description';
      emailDesc.className = 'sr-only';
      emailDesc.textContent = 'Enter your email address to sign in';
      emailField.parentElement?.appendChild(emailDesc);
    }

    if (passwordField) {
      passwordField.setAttribute('aria-describedby', 'password-description');
      const passwordDesc = document.createElement('div');
      passwordDesc.id = 'password-description';
      passwordDesc.className = 'sr-only';
      passwordDesc.textContent = 'Enter your password. Use the show password button to reveal the password';
      passwordField.parentElement?.appendChild(passwordDesc);
    }
  }

  // Error handling
  announceError(fieldName: string, errorMessage: string): void {
    this.announce(`Error in ${fieldName}: ${errorMessage}`, 'assertive');
  }

  announceSuccess(message: string): void {
    this.announce(message, 'polite');
  }

  announceValidation(fieldName: string, isValid: boolean): void {
    const message = isValid 
      ? `${fieldName} is valid` 
      : `${fieldName} has validation errors`;
    this.announce(message, 'polite');
  }

  // Keyboard navigation
  setupKeyboardNavigation(container: HTMLElement): void {
    if (!this.config.keyboardNavigation) return;

    // Handle Enter key on form submission
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
        const form = event.target.closest('form');
        if (form) {
          event.preventDefault();
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }
    });

    // Handle Escape key to close modals or reset forms
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const form = container.querySelector('form');
        if (form) {
          form.reset();
          this.announce('Form has been reset', 'polite');
        }
      }
    });
  }

  // Screen reader specific utilities
  setupScreenReaderSupport(container: HTMLElement): void {
    if (!this.config.screenReaderSupport) return;

    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 rounded shadow-lg';
    container.insertBefore(skipLink, container.firstChild);

    // Add main content landmark
    const mainContent = container.querySelector('main') || container;
    mainContent.setAttribute('role', 'main');
    mainContent.id = 'main-content';

    // Add form landmark
    const form = container.querySelector('form');
    if (form) {
      form.setAttribute('role', 'form');
      form.setAttribute('aria-label', 'Authentication form');
    }
  }

  // Loading states
  announceLoadingState(isLoading: boolean, context: string = 'form'): void {
    const message = isLoading 
      ? `${context} is processing, please wait` 
      : `${context} is ready`;
    this.announce(message, 'polite');
  }

  // Progress indicators
  announceProgress(current: number, total: number, context: string = 'form'): void {
    const percentage = Math.round((current / total) * 100);
    this.announce(`${context} progress: ${percentage}% complete`, 'polite');
  }

  // Status updates
  announceStatus(status: string, context: string = 'form'): void {
    this.announce(`${context} status: ${status}`, 'polite');
  }

  // Utility functions
  isScreenReaderActive(): boolean {
    // Basic detection - in a real app, you'd use more sophisticated detection
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
           document.documentElement.getAttribute('data-screen-reader') === 'true';
  }

  getReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  getHighContrastPreference(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // Cleanup
  destroy(): void {
    if (this.liveRegion) {
      document.body.removeChild(this.liveRegion);
      this.liveRegion = null;
    }

    if (this.focusTrap) {
      this.focusTrap.removeEventListener('keydown', this.handleFocusTrap.bind(this));
      this.focusTrap = null;
    }

    this.focusableElements = [];
  }
}

// Global accessibility manager
export const accessibilityManager = new AccessibilityManager();

// Utility functions for common accessibility patterns
export const setupFormField = (
  field: HTMLInputElement,
  label: string,
  description?: string,
  errorId?: string
): void => {
  // Ensure proper labeling
  if (!field.id) {
    field.id = `field-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create label if it doesn't exist
  let labelElement = document.querySelector(`label[for="${field.id}"]`) as HTMLLabelElement;
  if (!labelElement) {
    labelElement = document.createElement('label');
    labelElement.htmlFor = field.id;
    labelElement.textContent = label;
    field.parentElement?.insertBefore(labelElement, field);
  }

  // Add description
  if (description) {
    const descId = `${field.id}-description`;
    field.setAttribute('aria-describedby', descId);
    
    let descElement = document.getElementById(descId);
    if (!descElement) {
      descElement = document.createElement('div');
      descElement.id = descId;
      descElement.className = 'sr-only';
      descElement.textContent = description;
      field.parentElement?.appendChild(descElement);
    }
  }

  // Add error handling
  if (errorId) {
    field.setAttribute('aria-invalid', 'false');
    field.setAttribute('aria-errormessage', errorId);
  }
};

export const announceFieldError = (field: HTMLInputElement, errorMessage: string): void => {
  field.setAttribute('aria-invalid', 'true');
  accessibilityManager.announceError(field.name || field.id, errorMessage);
};

export const clearFieldError = (field: HTMLInputElement): void => {
  field.setAttribute('aria-invalid', 'false');
};

export const setupPasswordToggle = (
  passwordField: HTMLInputElement,
  toggleButton: HTMLButtonElement
): void => {
  toggleButton.setAttribute('aria-label', 'Show password');
  toggleButton.setAttribute('aria-pressed', 'false');
  toggleButton.setAttribute('type', 'button');

  toggleButton.addEventListener('click', () => {
    const isVisible = passwordField.type === 'text';
    passwordField.type = isVisible ? 'password' : 'text';
    toggleButton.setAttribute('aria-pressed', isVisible ? 'false' : 'true');
    toggleButton.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    
    accessibilityManager.announce(
      isVisible ? 'Password is now hidden' : 'Password is now visible',
      'polite'
    );
  });
};

export const setupLoadingButton = (
  button: HTMLButtonElement,
  loadingText: string = 'Loading...',
  originalText?: string
): (() => void) => {
  const originalContent = originalText || button.textContent;
  
  const setLoading = (isLoading: boolean) => {
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : originalContent;
    button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    
    if (isLoading) {
      accessibilityManager.announceLoadingState(true, 'button');
    }
  };

  return setLoading;
};

// CSS utilities for screen reader only content
export const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: 0.5rem;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
    background: white;
    border: 1px solid #000;
    z-index: 1000;
  }
`;

// High contrast mode support
export const highContrastStyles = `
  @media (prefers-contrast: high) {
    .auth-form input {
      border-width: 2px;
    }
    
    .auth-form button {
      border-width: 2px;
    }
    
    .auth-form .error {
      border-color: #dc2626;
      background-color: #fef2f2;
    }
  }
`;

// Reduced motion support
export const reducedMotionStyles = `
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
