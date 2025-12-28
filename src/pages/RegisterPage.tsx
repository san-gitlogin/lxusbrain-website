import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TermiVoxedLogo } from '@/components/logos'

export function RegisterPage() {
  const navigate = useNavigate()
  const { user, signInWithGoogle, signInWithMicrosoft, signUpWithEmail, error, loading, clearError } = useAuth()

  // Redirect to dashboard after successful registration
  useEffect(() => {
    if (user && !loading) {
      navigate('/termivoxed/dashboard')
    }
  }, [user, loading, navigate])

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

  const handleGoogleLogin = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy')
      return
    }
    await signInWithGoogle()
  }

  const handleMicrosoftLogin = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy')
      return
    }
    await signInWithMicrosoft()
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

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
          >
            {error}
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
          <Link to="/termivoxed/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
