
import { useState, useEffect, useRef } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { writeUser } from "../../app/auth"
import { 
  generateCSRFToken, 
  storeCSRFToken, 
  validateCSRFToken,
  isRateLimited,
  getRemainingAttempts,
  clearRateLimit,
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
  getLockoutTimeRemaining,
  sanitizeInput,
  validateEmail
} from "../../lib/security"
import { trackLogin, trackFailedLogin } from "../../lib/auth-analytics"

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginView() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [csrfToken, setCsrfToken] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState(5)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: "" })
  const [isTyping, setIsTyping] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()



  // Auto-focus email field on component mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  // Initialize CSRF token and check account lockout
  useEffect(() => {
    const token = generateCSRFToken()
    setCsrfToken(token)
    storeCSRFToken(token)
    
    // Check if account is locked
    if (email && isAccountLocked(email)) {
      setIsLocked(true)
      setLockoutTimeRemaining(getLockoutTimeRemaining(email))
    } else {
      setIsLocked(false)
      setLockoutTimeRemaining(0)
    }
    
    // Update remaining attempts
    setRemainingAttempts(getRemainingAttempts(`login_${email}`))
  }, [email])

  // Update lockout timer
  useEffect(() => {
    if (isLocked && lockoutTimeRemaining > 0) {
      const timer = setInterval(() => {
        const remaining = getLockoutTimeRemaining(email)
        setLockoutTimeRemaining(remaining)
        
        if (remaining <= 0) {
          setIsLocked(false)
          clearInterval(timer)
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [isLocked, lockoutTimeRemaining, email])

  // Enhanced email validation with debouncing
  useEffect(() => {
    if (!email) {
      setEmailValidation({ isValid: true, message: "" })
      return
    }

    const timer = setTimeout(() => {
      setIsTyping(false)
      const isValid = validateEmail(email)
      setEmailValidation({
        isValid,
        message: isValid ? "" : "Please enter a valid email address"
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [email])

  // Clear errors when user starts typing
  useEffect(() => {
    if (email && errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
    if (password && errors.password) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
  }, [email, password, errors])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to submit form
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const form = document.querySelector('form')
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement
          if (submitButton && !submitButton.disabled) {
            submitButton.click()
          }
        }
      }
      
      // Escape to clear form
      if (e.key === 'Escape') {
        setEmail("")
        setPassword("")
        setErrors({})
        if (emailInputRef.current) {
          emailInputRef.current.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const startTime = performance.now()

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)

    // Enhanced client-side validation
    const newErrors: FormErrors = {}

    // Email validation
    if (!sanitizedEmail.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(sanitizedEmail)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!sanitizedPassword.trim()) {
      newErrors.password = "Password is required"
    } else if (sanitizedPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Check if account is locked
    if (isAccountLocked(sanitizedEmail)) {
      const remaining = getLockoutTimeRemaining(sanitizedEmail)
      const minutes = Math.ceil(remaining / 60000)
      newErrors.general = `Account is temporarily locked. Please try again in ${minutes} minutes.`
      setIsLoading(false)
      setErrors(newErrors)
      return
    }

    // Check rate limiting
    const rateLimitKey = `login_${sanitizedEmail}`
    if (isRateLimited(rateLimitKey)) {
      const remaining = getRemainingAttempts(rateLimitKey)
      newErrors.general = `Too many login attempts. Please try again later. (${remaining} attempts remaining)`
      setIsLoading(false)
      setErrors(newErrors)
      return
    }

    // If there are validation errors, stop here
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const loginTime = performance.now() - startTime
      
      // Minimal fake auth: accept anything not empty
      if (!sanitizedEmail.trim() || !sanitizedPassword.trim()) {
        recordFailedAttempt(sanitizedEmail)
        setErrors({ general: "Invalid credentials" })
        setRemainingAttempts(getRemainingAttempts(rateLimitKey))
        
        // Track failed login
        trackFailedLogin({
          email: sanitizedEmail,
          reason: "Invalid credentials",
          ipAddress: "127.0.0.1", // In real app, get from request
          userAgent: navigator.userAgent
        })
        
        return
      }

      // Success - clear failed attempts and rate limits
      clearFailedAttempts(sanitizedEmail)
      clearRateLimit(rateLimitKey)
      
      // Track successful login
      trackLogin({
        email: sanitizedEmail,
        success: true,
        loginTime: loginTime,
        ipAddress: "127.0.0.1", // In real app, get from request
        userAgent: navigator.userAgent,
        sessionId: generateSessionId()
      })
      
      // Write user and navigate
      writeUser({ email: sanitizedEmail, role: "ops" })
      navigate("/dashboard", { replace: true })
    } catch (error) {
      const loginTime = performance.now() - startTime
      recordFailedAttempt(sanitizedEmail)
      setErrors({ general: "An unexpected error occurred. Please try again." })
      setRemainingAttempts(getRemainingAttempts(rateLimitKey))
      
      // Track failed login due to error
      trackFailedLogin({
        email: sanitizedEmail,
        reason: "System error",
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsTyping(true)
    setRemainingAttempts(getRemainingAttempts(`login_${value}`))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  // Format lockout time
  const formatLockoutTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Generate session ID
  const generateSessionId = (): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  return (
    <div 
      data-testid="login-view"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Sign in to your account to continue</p>
        </div>

        {/* Success message from password reset */}
        {location.state?.message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>{location.state.message}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
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

          {/* Account Locked Warning */}
          {isLocked && (
            <div 
              role="alert" 
              className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🔒</span>
                <span>
                  Account temporarily locked. Please wait {formatLockoutTime(lockoutTimeRemaining)} before trying again.
                </span>
              </div>
            </div>
          )}

          {/* Remaining Attempts Warning */}
          {remainingAttempts < 5 && remainingAttempts > 0 && (
            <div 
              role="alert" 
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⚠️</span>
                <span>{remainingAttempts} login attempts remaining</span>
              </div>
            </div>
          )}

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
                ref={emailInputRef}
                id="email"
                data-testid="login-email"
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  errors.email 
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                    : !emailValidation.isValid && email && !isTyping
                    ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/20'
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
                required
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isLoading || isLocked}
              />
            </div>
            {isTyping && email && (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Validating email...</span>
              </div>
            )}
            {!emailValidation.isValid && email && !isTyping && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <span>⚠️</span>
                <span>{emailValidation.message}</span>
              </div>
            )}
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
                data-testid="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full h-12 pl-10 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm ${
                  errors.password 
                    ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' 
                    : 'border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={isLoading || isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading || isLocked}
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
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                disabled={isLoading || isLocked}
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>
            <Link 
              to="/reset-password" 
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            data-testid="btn-login-submit"
            type="submit"
            disabled={isLoading || isLocked}
            className={`w-full h-14 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] btn-primary ${
              isLoading || isLocked
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : isLocked ? (
              <span>Account Locked</span>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-1 gap-4">
            {/* Google Login */}
            <button
              type="button"
              onClick={() => {
                // In a real app, this would redirect to Google OAuth
                console.log('Google login clicked')
                trackLogin({
                  email: 'google-user@example.com',
                  success: true,
                  loginTime: 0,
                  ipAddress: '127.0.0.1',
                  userAgent: navigator.userAgent,
                  sessionId: generateSessionId()
                })
                writeUser({ email: 'google-user@example.com', role: 'ops' })
                navigate('/dashboard', { replace: true })
              }}
              disabled={isLoading || isLocked}
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-300/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/20 focus:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transform hover:scale-[1.02] active:scale-[0.98] social-btn"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Continue with Google</span>
              </div>
            </button>

            {/* Apple Login */}
            <button
              type="button"
              onClick={() => {
                // In a real app, this would redirect to Apple OAuth
                console.log('Apple login clicked')
                trackLogin({
                  email: 'apple-user@example.com',
                  success: true,
                  loginTime: 0,
                  ipAddress: '127.0.0.1',
                  userAgent: navigator.userAgent,
                  sessionId: generateSessionId()
                })
                writeUser({ email: 'apple-user@example.com', role: 'ops' })
                navigate('/dashboard', { replace: true })
              }}
              disabled={isLoading || isLocked}
              className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-black hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-white font-medium">Continue with Apple</span>
              </div>
            </button>

            {/* GitHub Login */}
          <button
            type="button"
              onClick={() => {
                // In a real app, this would redirect to GitHub OAuth
                console.log('GitHub login clicked')
                trackLogin({
                  email: 'github-user@example.com',
                  success: true,
                  loginTime: 0,
                  ipAddress: '127.0.0.1',
                  userAgent: navigator.userAgent,
                  sessionId: generateSessionId()
                })
                writeUser({ email: 'github-user@example.com', role: 'ops' })
                navigate('/dashboard', { replace: true })
              }}
              disabled={isLoading || isLocked}
              className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-slate-800 hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-white font-medium">Continue with GitHub</span>
              </div>
          </button>
        </div>

          {/* Register Link */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <span>Don't have an account? </span>
            <Link 
              data-testid="link-register" 
              to="/register" 
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline"
            >
              Create an account
            </Link>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Demo Credentials:</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div>Email: ops@example.com</div>
            <div>Password: password123</div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Keyboard Shortcuts:</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div>• <kbd className="px-1 py-0.5 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-xs">Ctrl/Cmd + Enter</kbd> Submit form</div>
            <div>• <kbd className="px-1 py-0.5 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-xs">Escape</kbd> Clear form</div>
          </div>
        </div>
      </div>
    </div>
  )
}
