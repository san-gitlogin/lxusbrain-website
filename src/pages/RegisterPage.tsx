import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TermiVoxedLogo } from '@/components/logos'

/**
 * Validate and sanitize redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with allowed prefixes.
 */
function getSafeRedirect(redirectParam: string | null): string {
  const defaultRedirect = '/termivoxed/dashboard'

  if (!redirectParam) {
    return defaultRedirect
  }

  // Must be a relative path (starts with /)
  if (!redirectParam.startsWith('/')) {
    return defaultRedirect
  }

  // Block protocol-relative URLs (//evil.com)
  if (redirectParam.startsWith('//')) {
    return defaultRedirect
  }

  // Block URLs containing protocol (javascript:, data:, http:, etc.)
  if (redirectParam.includes(':')) {
    return defaultRedirect
  }

  // Only allow redirects to our app paths
  const allowedPrefixes = ['/termivoxed/', '/app/', '/dashboard']
  const isAllowed = allowedPrefixes.some(prefix => redirectParam.startsWith(prefix))

  if (!isAllowed) {
    return defaultRedirect
  }

  return redirectParam
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = useMemo(
    () => getSafeRedirect(searchParams.get('redirect')),
    [searchParams]
  )
  const { user, signInWithGoogle, signInWithMicrosoft, signUpWithEmail, logout, error, loading, clearError } = useAuth()

  // Desktop authentication detection
  const isDesktopAuth = searchParams.get('source') === 'desktop'
  const authMethod = searchParams.get('method') as 'email' | 'google' | 'microsoft' | null
  const authError = searchParams.get('error')
  // fresh_login=true means user explicitly logged out and initiated a new signup/login
  // In this case, we must show the account chooser even if they have an existing session
  const isFreshLogin = searchParams.get('fresh_login') === 'true'

  // Track fresh login state using REFS (not state) to avoid React batching issues
  // Refs update synchronously and are visible to all useEffects in the same render
  const freshLoginHandledRef = useRef(false)
  const userWasNullAfterFreshLoginRef = useRef(false)

  // Handle fresh login: if user explicitly logged out and is trying to sign up again,
  // we need to sign out of lxusbrain.com first so the account chooser appears
  useEffect(() => {
    if (isDesktopAuth && isFreshLogin && user && !loading && !freshLoginHandledRef.current) {
      // User exists but this is a fresh login request
      // Sign out first so the account chooser will appear
      freshLoginHandledRef.current = true
      console.log('[REGISTER] Fresh login detected with existing session, signing out first...')
      logout().catch((err) => {
        console.error('[REGISTER] Fresh login signout failed:', err)
      })
    }
  }, [isDesktopAuth, isFreshLogin, user, loading, logout])

  // Track when user becomes null (logout completed)
  // This ref is used to distinguish between:
  // - Initial page load with existing user (should NOT redirect)
  // - After OAuth completed (user is non-null, should redirect)
  useEffect(() => {
    if (isFreshLogin && freshLoginHandledRef.current && !user && !loading) {
      console.log('[REGISTER] User is now null after fresh login logout')
      userWasNullAfterFreshLoginRef.current = true
    }
  }, [isFreshLogin, user, loading])

  // Auto-trigger OAuth for desktop authentication
  useEffect(() => {
    // For fresh login: only trigger OAuth after user becomes null (logout completed)
    if (isDesktopAuth && !user && !loading) {
      // If this is a fresh login, only proceed if we've handled it (logout was initiated)
      if (isFreshLogin && !freshLoginHandledRef.current) {
        // Fresh login not yet initiated, wait for the first useEffect
        return
      }

      if (authMethod === 'google') {
        console.log('[REGISTER] Triggering Google OAuth popup')
        handleGoogleLogin()
      } else if (authMethod === 'microsoft') {
        console.log('[REGISTER] Triggering Microsoft OAuth popup')
        handleMicrosoftLogin()
      }
    }
  }, [isDesktopAuth, authMethod, user, loading, isFreshLogin])

  // Redirect after successful registration/login
  useEffect(() => {
    if (user && !loading) {
      // For fresh login flow: only redirect AFTER the user has gone through logout
      // This prevents redirecting with the initial (stale) session
      if (isDesktopAuth && isFreshLogin && freshLoginHandledRef.current) {
        if (!userWasNullAfterFreshLoginRef.current) {
          // User exists but we haven't completed logout yet
          // The fresh login useEffect will handle logging out
          console.log('[REGISTER] Fresh login: waiting for logout to complete...')
          return
        }
        // userWasNullAfterFreshLoginRef.current is true
        // This means user WAS null (logged out) and is now non-null (OAuth completed)
        console.log('[REGISTER] Fresh login complete: user re-authenticated via OAuth')
      }

      if (isDesktopAuth) {
        // Pass callback_port to the desktop callback page
        const callbackPort = searchParams.get('callback_port') || '8000'
        navigate(`/termivoxed/desktop-callback?callback_port=${callbackPort}`)
      } else {
        navigate(redirect)
      }
    }
  }, [user, loading, navigate, redirect, isDesktopAuth, isFreshLogin, searchParams])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !agreedToTerms) return

    setIsSubmitting(true)
    await signUpWithEmail(email, password, name)
    setIsSubmitting(false)
  }

  const handleGoogleLogin = () => {
    // For desktop auth, terms are shown on lxusbrain.com
    if (!isDesktopAuth && !agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy')
      return
    }
    signInWithGoogle()
  }

  const handleMicrosoftLogin = () => {
    // For desktop auth, terms are shown on lxusbrain.com
    if (!isDesktopAuth && !agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy')
      return
    }
    signInWithMicrosoft()
  }

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (password.length < 6) return { label: 'Too short', color: 'text-red-400', width: '20%' }
    if (password.length < 8) return { label: 'Weak', color: 'text-orange-400', width: '40%' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'text-yellow-400', width: '60%' }
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return { label: 'Strong', color: 'text-green-400', width: '100%' }
    return { label: 'Good', color: 'text-cyan-400', width: '80%' }
  }

  const strength = passwordStrength()

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-indigo-500/[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,200,0.1),transparent)]" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </motion.button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-8"
        >
          <Link to="/termivoxed" className="inline-block">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
              <TermiVoxedLogo width={80} height={67} />
            </div>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground">Get started with TermiVoxed today</p>
        </motion.div>

        {/* Desktop auth banner */}
        {isDesktopAuth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-cyan-400 font-semibold text-sm">Signing up for TermiVoxed Desktop App</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {authMethod === 'google' && 'Please complete sign-up in the Google popup window...'}
              {authMethod === 'microsoft' && 'Please complete sign-up in the Microsoft popup window...'}
              {authMethod === 'email' && 'Enter your details below to create your account'}
            </p>
            <p className="text-xs text-yellow-400 mt-2">⚠️ Do not close this window</p>
          </motion.div>
        )}

        {/* Error message */}
        {(error || authError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
          >
            {authError === 'auth_failed' ? 'Sign-up failed. Please try again.' : error}
            <button onClick={clearError} className="ml-2 underline hover:no-underline">Dismiss</button>
          </motion.div>
        )}

        {/* Terms checkbox */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                agreedToTerms
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-muted-foreground/50 group-hover:border-muted-foreground'
              }`}>
                {agreedToTerms && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              I agree to the{' '}
              <Link to="/legal/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/legal/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
            </span>
          </label>
        </motion.div>

        {/* Social login buttons */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-6"
        >
          <button
            onClick={handleGoogleLogin}
            disabled={loading || !agreedToTerms}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <button
            onClick={handleMicrosoftLogin}
            disabled={loading || !agreedToTerms}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M1 13h10v10H1z"/>
              <path fill="#7FBA00" d="M13 1h10v10H13z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Sign up with Microsoft
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-6"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">or sign up with email</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Email register form */}
        <motion.form
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onSubmit={handleEmailRegister}
          className="space-y-4"
        >
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Full name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {strength && (
              <div className="space-y-1">
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: strength.width }}
                  />
                </div>
                <p className={`text-xs ${strength.color}`}>{strength.label}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading || !agreedToTerms}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </motion.form>

        {/* Sign in link */}
        <motion.p
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 text-center text-muted-foreground"
        >
          Already have an account?{' '}
          <Link
            to={`/termivoxed/login${redirect !== '/termivoxed/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
