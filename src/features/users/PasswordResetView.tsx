import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { 
  generateSecureString, 
  validateEmail, 
  sanitizeInput,
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  generateCSRFToken,
  storeCSRFToken
} from "../../lib/security";
import { readJSON, writeJSON } from "../../utils/storage";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  token?: string;
  general?: string;
}

type ResetStep = "email" | "token" | "password";

export default function PasswordResetView() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(validatePasswordStrength(""));
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  // Initialize CSRF token
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    storeCSRFToken(token);
  }, []);

  // Check if token is provided in URL
  useEffect(() => {
    if (token) {
      setStep("token");
    }
  }, [token]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(validatePasswordStrength(password));
  }, [password]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (email && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (password && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (confirmPassword && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [email, password, confirmPassword, errors]);

  // Validate reset token
  const validateResetToken = (token: string): boolean => {
    // In a real app, this would validate against stored tokens
    // For demo purposes, we'll accept any 32-character token
    return token.length === 32;
  };

  // Send reset email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const sanitizedEmail = sanitizeInput(email);

    if (!sanitizedEmail.trim()) {
      setErrors({ email: "Email is required" });
      setIsLoading(false);
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      setErrors({ email: "Please enter a valid email address" });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user exists
      const all = readJSON<any[]>("users", []);
      const user = all.find(u => u.email === sanitizedEmail);
      
      if (!user) {
        setErrors({ general: "If an account with this email exists, a reset link has been sent." });
        setIsLoading(false);
        return;
      }

      // Generate reset token
      const resetToken = generateSecureString(32);
      const resetExpiry = Date.now() + (60 * 60 * 1000); // 1 hour

      // Store reset token (in real app, this would be in database)
      const resetTokens = readJSON<Record<string, { token: string; expiry: number }>>("reset_tokens", {});
      resetTokens[sanitizedEmail] = { token: resetToken, expiry: resetExpiry };
      writeJSON("reset_tokens", resetTokens);

      setResetEmailSent(true);
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify reset token
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const sanitizedToken = sanitizeInput(token);

    if (!sanitizedToken.trim()) {
      setErrors({ token: "Reset token is required" });
      setIsLoading(false);
      return;
    }

    if (!validateResetToken(sanitizedToken)) {
      setErrors({ token: "Invalid reset token" });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if token exists and is valid
      const resetTokens = readJSON<Record<string, { token: string; expiry: number }>>("reset_tokens", {});
      const tokenEntry = Object.values(resetTokens).find(entry => entry.token === sanitizedToken);

      if (!tokenEntry || Date.now() > tokenEntry.expiry) {
        setErrors({ token: "Invalid or expired reset token" });
        setIsLoading(false);
        return;
      }

      setStep("password");
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    if (!sanitizedPassword.trim()) {
      setErrors({ password: "Password is required" });
      setIsLoading(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setErrors({ password: "Password does not meet strength requirements" });
      setIsLoading(false);
      return;
    }

    if (!sanitizedConfirmPassword.trim()) {
      setErrors({ confirmPassword: "Please confirm your password" });
      setIsLoading(false);
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find user by token
      const resetTokens = readJSON<Record<string, { token: string; expiry: number }>>("reset_tokens", {});
      const userEmail = Object.keys(resetTokens).find(email => resetTokens[email].token === token);

      if (!userEmail) {
        setErrors({ general: "Invalid reset token" });
        setIsLoading(false);
        return;
      }

      // Update user password
      const all = readJSON<any[]>("users", []);
      const userIndex = all.findIndex(u => u.email === userEmail);
      
      if (userIndex === -1) {
        setErrors({ general: "User not found" });
        setIsLoading(false);
        return;
      }

      // In a real app, you would hash the password here
      all[userIndex].password = sanitizedPassword;
      writeJSON("users", all);

      // Remove used token
      delete resetTokens[userEmail];
      writeJSON("reset_tokens", resetTokens);

      // Redirect to login
      navigate("/login", { 
        replace: true,
        state: { message: "Password reset successfully. Please sign in with your new password." }
      });
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend reset email
  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(60);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!password) return null;

    const strengthColor = getPasswordStrengthColor(passwordStrength.score);
    const strengthLabel = getPasswordStrengthLabel(passwordStrength.score);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Password strength:</span>
          <span className={`font-medium ${strengthColor}`}>{strengthLabel}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              passwordStrength.score <= 1 ? 'bg-red-500' :
              passwordStrength.score <= 2 ? 'bg-orange-500' :
              passwordStrength.score <= 3 ? 'bg-yellow-500' :
              passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
          />
        </div>
        {passwordStrength.feedback.length > 0 && (
          <div className="text-xs text-slate-500 space-y-1">
            {passwordStrength.feedback.map((feedback, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-red-400">•</span>
                <span>{feedback}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main 
      className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {step === "email" && "Reset Password"}
            {step === "token" && "Enter Reset Code"}
            {step === "password" && "Set New Password"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {step === "email" && "Enter your email to receive a reset link"}
            {step === "token" && "Enter the reset code sent to your email"}
            {step === "password" && "Create a new secure password"}
          </p>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form 
            onSubmit={handleSendResetEmail}
            className="w-full space-y-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50"
            noValidate
          >
            <input type="hidden" name="csrf_token" value={csrfToken} />

            {errors.general && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">ℹ️</span>
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative group input-group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                    errors.email 
                      ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                      : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                  }`}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] btn-primary ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Send Reset Link</span>
                </div>
              )}
            </button>

            <div className="text-center text-sm text-slate-600">
              <span>Remember your password? </span>
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                Sign in
              </Link>
            </div>
          </form>
        )}

        {/* Token Step */}
        {step === "token" && (
          <form 
            onSubmit={handleVerifyToken}
            className="w-full space-y-6 bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
            noValidate
          >
            <input type="hidden" name="csrf_token" value={csrfToken} />

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="token" className="block text-sm font-semibold text-slate-700">
                Reset Code
              </label>
              <input
                id="token"
                type="text"
                name="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`w-full h-12 px-4 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.token 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="Enter reset code"
                autoComplete="off"
                required
                disabled={isLoading}
              />
              {errors.token && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.token}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="text-center text-sm text-slate-600">
              <span>Didn't receive the code? </span>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={countdown > 0 || isLoading}
                className={`font-medium underline ${
                  countdown > 0 || isLoading
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </button>
            </div>
          </form>
        )}

        {/* Password Step */}
        {step === "password" && (
          <form 
            onSubmit={handleResetPassword}
            className="w-full space-y-6 bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
            noValidate
          >
            <input type="hidden" name="csrf_token" value={csrfToken} />

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-12 px-4 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="Create a new password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.password}</span>
                </div>
              )}
              <PasswordStrengthIndicator />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-12 px-4 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
              {confirmPassword && password === confirmPassword && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <span>✅</span>
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
