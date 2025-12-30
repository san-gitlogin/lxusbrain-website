import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MessageSquare, Clock, Loader2, Check, Sparkles, Zap, Crown } from 'lucide-react'

import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function GetStartedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'individual'
  const { user, loading, signInWithGoogle, signInWithMicrosoft, error } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const planNames: Record<string, string> = {
    'free': 'Free Trial',
    'individual': 'Individual',
    'pro': 'Pro',
    'enterprise': 'Enterprise'
  }

  const planIcons: Record<string, React.ElementType> = {
    'free': Sparkles,
    'individual': Zap,
    'pro': Crown,
    'enterprise': Crown
  }

  const PlanIcon = planIcons[plan] || Sparkles

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }))
    }
  }, [user])

  // For non-enterprise paid plans, redirect to subscription page if logged in
  useEffect(() => {
    if (!loading && user && plan !== 'enterprise' && plan !== 'free') {
      // For paid plans, redirect to subscription to complete purchase
      navigate('/termivoxed/subscription')
    }
  }, [user, loading, plan, navigate])

  // For free plan, redirect to dashboard
  useEffect(() => {
    if (!loading && user && plan === 'free') {
      navigate('/termivoxed/dashboard')
    }
  }, [user, loading, plan, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  const handleMicrosoftSignIn = async () => {
    await signInWithMicrosoft()
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <TermiVoxedLogo width={80} height={67} />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-indigo-500/[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,200,0.08),transparent)]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 outline-none focus:outline-none">
                <LxusBrainLogo size={28} />
                <LxusBrainTitle height={20} className="hidden sm:block" />
              </Link>
              <div className="h-5 sm:h-6 w-px bg-border" />
              <Link to="/termivoxed" className="flex items-center">
                <TermiVoxedLogo width={45} className="sm:w-[55px]" />
              </Link>
            </div>
            <Link to="/termivoxed#pricing" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Not logged in - show sign in options */}
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                <PlanIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm">{planNames[plan]} Plan</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Sign in to Continue
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {plan === 'free'
                  ? "Create an account to start your free trial with 5 exports."
                  : plan === 'enterprise'
                  ? "Sign in to request a custom enterprise quote."
                  : `Sign in to get started with the ${planNames[plan]} plan.`}
              </p>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md mx-auto"
                >
                  {error}
                </motion.div>
              )}

              {/* Sign in buttons */}
              <div className="max-w-md mx-auto space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium"
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
                  onClick={handleMicrosoftSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#F25022" d="M1 1h10v10H1z"/>
                    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                    <path fill="#FFB900" d="M13 13h10v10H13z"/>
                  </svg>
                  Continue with Microsoft
                </button>

                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Link
                  to={`/termivoxed/login?redirect=/termivoxed/get-started?plan=${plan}`}
                  className="block w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-foreground text-center font-medium transition-all"
                >
                  Sign in with email
                </Link>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                By signing in, you agree to our{' '}
                <Link to="/legal/terms" className="text-cyan-400 hover:text-cyan-300">Terms</Link>
                {' '}and{' '}
                <Link to="/legal/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
              </p>
            </motion.div>
          ) : !submitted ? (
            // Logged in - show form (only for enterprise plan)
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 text-sm">{planNames[plan]} Plan</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Request Enterprise Quote
                </h1>
                <p className="text-muted-foreground">
                  Tell us about your organization and we'll create a custom plan for you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your needs
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                    placeholder="How many team members? What features are most important? Any specific requirements?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Request Quote
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-muted-foreground text-sm mt-6 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                We typically respond within 24 hours
              </p>
            </motion.div>
          ) : (
            // Form submitted
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Thank You!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We've received your request for the <strong>{planNames[plan]}</strong> plan.
                Our team will reach out to <strong>{formData.email}</strong> shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/termivoxed/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/termivoxed"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-foreground transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to TermiVoxed
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
