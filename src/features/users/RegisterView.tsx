import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCurrentUser } from "./actions";
import { readJSON, writeJSON } from "../../utils/storage";
import { TID } from "../../testing/testIds";
import { 
  generateCSRFToken, 
  storeCSRFToken, 
  validateCSRFToken,
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  sanitizeInput,
  validateEmail,
  isRateLimited,
  getRemainingAttempts,
  clearRateLimit
} from "../../lib/security";

type Role = "admin" | "ops" | "finance" | "analyst" | "viewer";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  terms?: string;
  general?: string;
}

export default function RegisterView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("ops");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(validatePasswordStrength(""));
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldTouched, setFieldTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false
  });
  
  const dispatch = useDispatch();
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

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(validatePasswordStrength(password));
  }, [password]);

  // Update remaining attempts when email changes
  useEffect(() => {
    setRemainingAttempts(getRemainingAttempts(`register_${email}`));
  }, [email]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (name && errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
    if (email && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (password && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (confirmPassword && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    if (role && errors.role) {
      setErrors(prev => ({ ...prev, role: undefined }));
    }
    if (acceptedTerms && errors.terms) {
      setErrors(prev => ({ ...prev, terms: undefined }));
    }
  }, [name, email, password, confirmPassword, role, acceptedTerms, errors]);

  // Validate password confirmation
  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    // Client-side validation
    const newErrors: FormErrors = {};

    // Email validation
    if (!sanitizedEmail.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(sanitizedEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!sanitizedPassword.trim()) {
      newErrors.password = "Password is required";
    } else if (!passwordStrength.isValid) {
      newErrors.password = "Password does not meet strength requirements";
    }

    // Confirm password validation
    if (!sanitizedConfirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (!validateConfirmPassword(sanitizedPassword, sanitizedConfirmPassword)) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!role) {
      newErrors.role = "Please select a role";
    }

    // Terms validation
    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    // Check rate limiting
    const rateLimitKey = `register_${sanitizedEmail}`;
    if (isRateLimited(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      const remaining = getRemainingAttempts(rateLimitKey, 3);
      newErrors.general = `Too many registration attempts. Please try again later. (${remaining} attempts remaining)`;
      setIsLoading(false);
      setErrors(newErrors);
      return;
    }

    // If there are validation errors, stop here
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const all = readJSON<any[]>("users", []);
      if (all.find(u => u.email === sanitizedEmail)) {
        setErrors({ general: "This email is already registered." });
        setIsLoading(false);
        return;
      }

      // Create user
      const user = { 
        email: sanitizedEmail, 
        name: sanitizedName || sanitizedEmail.split("@")[0], 
        role 
      };
      
    writeJSON("users", [...all, user]);
    dispatch(setCurrentUser(user));

      // Clear rate limits on successful registration
      clearRateLimit(rateLimitKey);

    navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setIsLoading(false);
    }
  };

  // Enhanced password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!password) return null;

    const strengthColor = getPasswordStrengthColor(passwordStrength.score);
    const strengthLabel = getPasswordStrengthLabel(passwordStrength.score);
    const strengthIcon = passwordStrength.score <= 1 ? '🔴' : 
                        passwordStrength.score <= 2 ? '🟠' : 
                        passwordStrength.score <= 3 ? '🟡' : 
                        passwordStrength.score <= 4 ? '🔵' : '🟢';

    return (
      <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">Password Strength:</span>
          <div className="flex items-center gap-1">
            <span>{strengthIcon}</span>
            <span className={`font-semibold ${strengthColor}`}>{strengthLabel}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              passwordStrength.score <= 1 ? 'bg-red-500' :
              passwordStrength.score <= 2 ? 'bg-orange-500' :
              passwordStrength.score <= 3 ? 'bg-yellow-500' :
              passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
          />
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-700 mb-2">Requirements:</div>
          {[
            { met: password.length >= 8, text: "At least 8 characters" },
            { met: /[A-Z]/.test(password), text: "One uppercase letter" },
            { met: /[a-z]/.test(password), text: "One lowercase letter" },
            { met: /\d/.test(password), text: "One number" },
            { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "One special character" }
          ].map((requirement, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className={requirement.met ? "text-green-500" : "text-slate-400"}>
                {requirement.met ? "✅" : "⭕"}
              </span>
              <span className={requirement.met ? "text-slate-700" : "text-slate-500"}>
                {requirement.text}
              </span>
            </div>
          ))}
        </div>

        {/* Feedback Messages */}
        {passwordStrength.feedback.length > 0 && (
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-medium text-slate-700 dark:text-slate-200">Suggestions:</div>
            {passwordStrength.feedback.map((feedback, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-blue-500">💡</span>
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
      data-testid={TID.REGISTER_VIEW} 
      className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 login-container">
        {/* Header */}
        <div className="text-center mb-8 login-header">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Join us to get started</p>
        </div>

        {/* Register Form */}
        <form 
          onSubmit={onSubmit}
          className="w-full space-y-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 login-form"
          noValidate
        >
          {/* CSRF Token */}
          <input type="hidden" name="csrf_token" value={csrfToken} />

          {/* General Error Message */}
          {errors.general && (
            <div 
              role="alert" 
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {/* Remaining Attempts Warning */}
          {remainingAttempts < 3 && remainingAttempts > 0 && (
            <div 
              role="alert" 
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⚠️</span>
                <span>{remainingAttempts} registration attempts remaining</span>
              </div>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Full Name <span className="text-slate-400">(Optional)</span>
            </label>
            <div className="relative group input-group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldTouched(prev => ({ ...prev, name: true }));
                }}
                onBlur={() => setFieldTouched(prev => ({ ...prev, name: true }))}
                className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  fieldTouched.name && name.length > 0 && name.length < 2
                    ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/20' 
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            {fieldTouched.name && name.length > 0 && name.length < 2 && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <span>💡</span>
                <span>Name should be at least 2 characters long</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
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
                data-testid={TID.REGISTER_EMAIL}
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldTouched(prev => ({ ...prev, email: true }));
                }}
                onBlur={() => setFieldTouched(prev => ({ ...prev, email: true }))}
                className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  errors.email 
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                    : fieldTouched.email && email && !validateEmail(email)
                    ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/20'
                    : fieldTouched.email && email && validateEmail(email)
                    ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20'
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
                required
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div 
                id="email-error" 
                role="alert" 
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <span>⚠️</span>
                <span>{errors.email}</span>
              </div>
            )}
            {fieldTouched.email && email && !validateEmail(email) && !errors.email && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <span>💡</span>
                <span>Please enter a valid email address</span>
              </div>
            )}
            {fieldTouched.email && email && validateEmail(email) && !errors.email && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <span>✅</span>
                <span>Valid email format</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Password
            </label>
            <div className="relative group input-group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                data-testid={TID.REGISTER_PASSWORD}
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldTouched(prev => ({ ...prev, password: true }));
                }}
                onBlur={() => setFieldTouched(prev => ({ ...prev, password: true }))}
                className={`w-full h-12 pl-10 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  errors.password 
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                    : fieldTouched.password && password && !passwordStrength.isValid
                    ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/20'
                    : fieldTouched.password && password && passwordStrength.isValid
                    ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20'
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <div 
                id="password-error" 
                role="alert" 
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <span>⚠️</span>
                <span>{errors.password}</span>
              </div>
            )}
            <PasswordStrengthIndicator />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative group input-group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldTouched(prev => ({ ...prev, confirmPassword: true }));
                }}
                onBlur={() => setFieldTouched(prev => ({ ...prev, confirmPassword: true }))}
                className={`w-full h-12 pl-10 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  errors.confirmPassword 
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                    : fieldTouched.confirmPassword && confirmPassword && password !== confirmPassword
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20'
                    : fieldTouched.confirmPassword && confirmPassword && password === confirmPassword
                    ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20'
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div 
                id="confirm-password-error" 
                role="alert" 
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <span>⚠️</span>
                <span>{errors.confirmPassword}</span>
              </div>
            )}
            {fieldTouched.confirmPassword && confirmPassword && password !== confirmPassword && !errors.confirmPassword && (
              <div className="text-xs text-red-600 flex items-center gap-1">
                <span>❌</span>
                <span>Passwords do not match</span>
              </div>
            )}
            {fieldTouched.confirmPassword && confirmPassword && password === confirmPassword && !errors.confirmPassword && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <span>✅</span>
                <span>Passwords match</span>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label 
              htmlFor="role" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Select Role <span className="text-red-500">*</span>
            </label>
            <div className="relative group input-group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as Role);
                  setFieldTouched(prev => ({ ...prev, role: true }));
                }}
                onBlur={() => setFieldTouched(prev => ({ ...prev, role: true }))}
                className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  errors.role 
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                required
                aria-describedby={errors.role ? "role-error" : undefined}
                disabled={isLoading}
              >
                <option value="">Select a role...</option>
                <option value="admin">👑 Administrator - Full system access</option>
                <option value="ops">⚙️ Operations - Manage orders and processes</option>
                <option value="finance">💰 Finance - Handle financial data</option>
                <option value="analyst">📊 Analyst - View and analyze data</option>
                <option value="viewer">👁️ Viewer - Read-only access</option>
              </select>
            </div>
            {errors.role && (
              <div 
                id="role-error" 
                role="alert" 
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <span>⚠️</span>
                <span>{errors.role}</span>
              </div>
            )}
            {role && !errors.role && (
              <div className="text-xs text-slate-500">
                {role === "admin" && "Full system access and user management"}
                {role === "ops" && "Manage orders, processes, and operations"}
                {role === "finance" && "Handle financial data and reports"}
                {role === "analyst" && "View and analyze all data"}
                {role === "viewer" && "Read-only access to view data"}
              </div>
            )}
          </div>

          {/* Form Validation Summary */}
          {Object.keys(fieldTouched).some(key => fieldTouched[key as keyof typeof fieldTouched]) && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-medium text-slate-700 mb-2">Form Status:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className={email && validateEmail(email) ? "text-green-500" : "text-slate-400"}>
                    {email && validateEmail(email) ? "✅" : "⭕"}
                  </span>
                  <span>Email Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={password && passwordStrength.isValid ? "text-green-500" : "text-slate-400"}>
                    {password && passwordStrength.isValid ? "✅" : "⭕"}
                  </span>
                  <span>Password Strength</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={confirmPassword && password === confirmPassword ? "text-green-500" : "text-slate-400"}>
                    {confirmPassword && password === confirmPassword ? "✅" : "⭕"}
                  </span>
                  <span>Password Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={role ? "text-green-500" : "text-slate-400"}>
                    {role ? "✅" : "⭕"}
                  </span>
                  <span>Role Selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={acceptedTerms ? "text-green-500" : "text-slate-400"}>
                    {acceptedTerms ? "✅" : "⭕"}
                  </span>
                  <span>Terms & Conditions</span>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked && errors.terms) {
                    setErrors(prev => ({ ...prev, terms: undefined }));
                  }
                }}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                required
                aria-describedby={errors.terms ? "terms-error" : undefined}
                disabled={isLoading}
              />
              <div className="flex-1">
                <label 
                  htmlFor="terms" 
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                    onClick={() => {
                      // Open terms in new window or modal
                      window.open('/terms', '_blank');
                    }}
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                    onClick={() => {
                      // Open privacy policy in new window or modal
                      window.open('/privacy', '_blank');
                    }}
                  >
                    Privacy Policy
                  </button>
                  <span className="text-red-500">*</span>
                </label>
                {errors.terms && (
                  <div 
                    id="terms-error" 
                    role="alert" 
                    className="text-red-600 text-sm flex items-center gap-1 mt-1"
                  >
                    <span>⚠️</span>
                    <span>{errors.terms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            data-testid={TID.REGISTER_SUBMIT}
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
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Create Account</span>
              </div>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <span>Already have an account? </span>
            <Link 
              to="/login" 
              data-testid={TID.LINK_LOGIN}
              className="text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Sign in
            </Link>
        </div>
      </form>
      </div>
    </main>
  );
}
