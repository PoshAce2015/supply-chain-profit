import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginView from '../LoginView';
import { authAnalytics } from '../../../lib/auth-analytics';

// Mock dependencies
jest.mock('../../../lib/security', () => ({
  generateCSRFToken: jest.fn(() => 'test-csrf-token'),
  storeCSRFToken: jest.fn(),
  validateCSRFToken: jest.fn(() => true),
  isRateLimited: jest.fn(() => false),
  getRemainingAttempts: jest.fn(() => 5),
  clearRateLimit: jest.fn(),
  isAccountLocked: jest.fn(() => false),
  recordFailedAttempt: jest.fn(),
  clearFailedAttempts: jest.fn(),
  getLockoutTimeRemaining: jest.fn(() => 0),
  sanitizeInput: jest.fn((input) => input),
  validateEmail: jest.fn(() => true)
}));

jest.mock('../../../lib/auth-analytics', () => ({
  trackLogin: jest.fn(),
  trackFailedLogin: jest.fn(),
  authAnalytics: {
    trackEvent: jest.fn()
  }
}));

jest.mock('../../../app/auth', () => ({
  writeUser: jest.fn()
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => 1000)
  }
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent'
  }
});

const mockStore = configureStore({
  reducer: {
    users: (state = {}, action: any) => state
  }
});

const renderLoginView = () => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <LoginView />
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form with all required elements', () => {
      renderLoginView();
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('renders demo credentials section', () => {
      renderLoginView();
      
      expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
      expect(screen.getByText('Email: ops@example.com')).toBeInTheDocument();
      expect(screen.getByText('Password: password123')).toBeInTheDocument();
    });

    it('renders password toggle button', () => {
      renderLoginView();
      
      const passwordField = screen.getByLabelText(/password/i);
      const toggleButton = passwordField.parentElement?.querySelector('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('renders remember me checkbox', () => {
      renderLoginView();
      
      expect(screen.getByLabelText(/remember me for 30 days/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty email', async () => {
      renderLoginView();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      const { validateEmail } = require('../../../lib/security');
      validateEmail.mockReturnValue(false);
      
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      fireEvent.change(emailField, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('shows error for empty password', async () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('clears errors when user starts typing', async () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      
      // Trigger validation errors
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      // Start typing to clear errors
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: 'password123' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Toggle', () => {
    it('toggles password visibility', () => {
      renderLoginView();
      
      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggleButton = passwordField.parentElement?.querySelector('button');
      
      expect(passwordField.type).toBe('password');
      
      fireEvent.click(toggleButton!);
      expect(passwordField.type).toBe('text');
      
      fireEvent.click(toggleButton!);
      expect(passwordField.type).toBe('password');
    });
  });

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Signing In...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('disables form fields during loading', async () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(emailField).toBeDisabled();
        expect(passwordField).toBeDisabled();
      });
    });
  });

  describe('Rate Limiting', () => {
    it('shows remaining attempts warning', () => {
      const { getRemainingAttempts } = require('../../../lib/security');
      getRemainingAttempts.mockReturnValue(2);
      
      renderLoginView();
      
      expect(screen.getByText('2 login attempts remaining')).toBeInTheDocument();
    });

    it('shows rate limit error when rate limited', async () => {
      const { isRateLimited } = require('../../../lib/security');
      isRateLimited.mockReturnValue(true);
      
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Account Lockout', () => {
    it('shows account locked warning', () => {
      const { isAccountLocked, getLockoutTimeRemaining } = require('../../../lib/security');
      isAccountLocked.mockReturnValue(true);
      getLockoutTimeRemaining.mockReturnValue(300000); // 5 minutes
      
      renderLoginView();
      
      expect(screen.getByText(/account temporarily locked/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait 5:00 before trying again/i)).toBeInTheDocument();
    });

    it('disables form when account is locked', () => {
      const { isAccountLocked } = require('../../../lib/security');
      isAccountLocked.mockReturnValue(true);
      
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailField).toBeDisabled();
      expect(passwordField).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Account Locked')).toBeInTheDocument();
    });
  });

  describe('Successful Login', () => {
    it('tracks successful login with analytics', async () => {
      const { trackLogin } = require('../../../lib/auth-analytics');
      const { writeUser } = require('../../../app/auth');
      
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(trackLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          success: true,
          loginTime: expect.any(Number),
          ipAddress: '127.0.0.1',
          userAgent: 'test-user-agent',
          sessionId: expect.any(String)
        });
      });
    });

    it('writes user data and navigates on success', async () => {
      const { writeUser } = require('../../../app/auth');
      
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(writeUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          role: 'ops'
        });
      });
    });
  });

  describe('Failed Login', () => {
    it('tracks failed login with analytics', async () => {
      const { trackFailedLogin } = require('../../../lib/auth-analytics');
      
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: '' } }); // Empty password to trigger failure
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(trackFailedLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          reason: 'Invalid credentials',
          ipAddress: '127.0.0.1',
          userAgent: 'test-user-agent'
        });
      });
    });

    it('shows error message for invalid credentials', async () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordField, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('has link to registration page', () => {
      renderLoginView();
      
      const registerLink = screen.getByText(/create an account/i);
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('has link to password reset page', () => {
      renderLoginView();
      
      const resetLink = screen.getByText(/forgot password/i);
      expect(resetLink).toHaveAttribute('href', '/reset-password');
    });
  });

  describe('Success Message from Password Reset', () => {
    it('displays success message from location state', () => {
      const mockLocation = {
        state: {
          message: 'Password reset successfully. Please sign in with your new password.'
        }
      };

      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
      
      renderLoginView();
      
      expect(screen.getByText('Password reset successfully. Please sign in with your new password.')).toBeInTheDocument();
    });
  });

  describe('CSRF Protection', () => {
    it('includes CSRF token in form', () => {
      renderLoginView();
      
      const csrfInput = screen.getByDisplayValue('test-csrf-token');
      expect(csrfInput).toHaveAttribute('name', 'csrf_token');
      expect(csrfInput).toHaveAttribute('type', 'hidden');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and descriptions', () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      
      expect(emailField).toHaveAttribute('aria-describedby');
      expect(passwordField).toHaveAttribute('aria-describedby');
    });

    it('has proper error associations', async () => {
      renderLoginView();
      
      const emailField = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorElement = screen.getByText('Email is required');
        expect(emailField).toHaveAttribute('aria-describedby');
      });
    });
  });
});
