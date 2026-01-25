import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
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

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = useMemo(
    () => getSafeRedirect(searchParams.get('redirect')),
    [searchParams]
  )
  const { user, signInWithGoogle, signInWithMicrosoft, signInWithEmail, logout, error, loading, clearError } = useAuth()

  // Desktop authentication detection
  const isDesktopAuth = searchParams.get('source') === 'desktop'
  const authMethod = searchParams.get('method') as 'email' | 'google' | 'microsoft' | null
  const prefillEmail = searchParams.get('email') || ''
  const authError = searchParams.get('error')
  // fresh_login=true means user explicitly logged out and initiated a new login
  // In this case, we must show the account chooser even if they have an existing session
  const isFreshLogin = searchParams.get('fresh_login') === 'true'

  // Track if we're in the process of handling fresh login (logging out existing session)
  const freshLoginHandledRef = useRef(false)
  const [freshLoginLogoutInProgress, setFreshLoginLogoutInProgress] = useState(false)

  // Handle fresh login: if user explicitly logged out and is trying to log in again,
  // we need to sign out of lxusbrain.com first so the account chooser appears
  useEffect(() => {
    if (isDesktopAuth && isFreshLogin && user && !loading && !freshLoginHandledRef.current) {
      // User exists but this is a fresh login request
      // Sign out first so the account chooser will appear
      freshLoginHandledRef.current = true
      setFreshLoginLogoutInProgress(true)
      console.log('[LOGIN] Fresh login detected with existing session, signing out first...')
      // NOTE: Don't set inProgress=false in the callback - let auth state change handle it
      logout().catch((err) => {
        console.error('[LOGIN] Fresh login signout failed:', err)
        setFreshLoginLogoutInProgress(false)
      })
    }
  }, [isDesktopAuth, isFreshLogin, user, loading, logout])

  // Detect when logout completes by watching for user becoming null
  // This is more reliable than the logout() promise because auth state is async
  useEffect(() => {
    if (isFreshLogin && freshLoginHandledRef.current && freshLoginLogoutInProgress && !user && !loading) {
      // User just became null after we initiated fresh login logout
      console.log('[LOGIN] Auth state updated: user is null, logout complete')
      setFreshLoginLogoutInProgress(false)
    }
  }, [isFreshLogin, freshLoginLogoutInProgress, user, loading])

  // Auto-trigger OAuth for desktop authentication
  useEffect(() => {
    if (isDesktopAuth && !user && !loading && !freshLoginLogoutInProgress) {
      if (authMethod === 'google') {
        console.log('[LOGIN] Triggering Google OAuth popup')
        handleGoogleLogin()
      } else if (authMethod === 'microsoft') {
        console.log('[LOGIN] Triggering Microsoft OAuth popup')
        handleMicrosoftLogin()
      }
    }
  }, [isDesktopAuth, authMethod, user, loading, freshLoginLogoutInProgress])

  // Redirect if already logged in or after successful login
  // Skip redirect if fresh login logout is in progress
  useEffect(() => {
    if (user && !loading) {
      // Don't redirect while fresh login logout is in progress
      // This prevents redirecting to desktop-callback before logout completes
      if (freshLoginLogoutInProgress) {
        console.log('[LOGIN] Skipping redirect - fresh login logout in progress')
        return
      }

      if (isDesktopAuth) {
        // Pass callback_port to the desktop callback page
        const callbackPort = searchParams.get('callback_port') || '8000'
        navigate(`/termivoxed/desktop-callback?callback_port=${callbackPort}`)
      } else {
        navigate(redirect)
      }
    }
  }, [user, loading, navigate, redirect, isDesktopAuth, freshLoginLogoutInProgress, searchParams])

  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsSubmitting(true)
    await signInWithEmail(email, password)
    setIsSubmitting(false)
  }

  const handleGoogleLogin = () => {
    signInWithGoogle()
  }

  const handleMicrosoftLogin = () => {
    signInWithMicrosoft()
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your TermiVoxed account</p>
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
              <span className="text-cyan-400 font-semibold text-sm">Authenticating for TermiVoxed Desktop App</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {authMethod === 'google' && 'Please complete sign-in in the Google popup window...'}
              {authMethod === 'microsoft' && 'Please complete sign-in in the Microsoft popup window...'}
              {authMethod === 'email' && 'Sign in with your email and password below'}
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
            {authError === 'auth_failed' ? 'Authentication failed. Please try again.' : error}
            <button onClick={clearError} className="ml-2 underline hover:no-underline">Dismiss</button>
          </motion.div>
        )}

        {/* Social login buttons */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-6"
        >
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M1 13h10v10H1z"/>
              <path fill="#7FBA00" d="M13 1h10v10H13z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Continue with Microsoft
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-6"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">or continue with email</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Email login form */}
        <motion.form
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onSubmit={handleEmailLogin}
          className="space-y-4"
        >
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

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/termivoxed/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </motion.form>

        {/* Sign up link */}
        <motion.p
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 text-center text-muted-foreground"
        >
          Don't have an account?{' '}
          <Link
            to={`/termivoxed/register${redirect !== '/termivoxed/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Sign up
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
