import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Rocket, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'
import { useAuth } from '@/lib/auth-context'

export function AppPage() {
  const navigate = useNavigate()
  const { user, loading, signInWithGoogle, signInWithMicrosoft, error } = useAuth()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/termivoxed/dashboard')
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <Link to="/termivoxed" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated Logo */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8"
            >
              <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
                <TermiVoxedLogo width={120} />
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm">Launching Soon</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              We're Building Something
              <br />
              <span className="gradient-text">Amazing</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
              The TermiVoxed web app is under active development. We're working hard to bring you the best AI voice-over experience.
            </p>

            {/* Features Preview */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {['AI Voices', 'Multi-Language', 'Voice Cloning', 'Subtitle Editor'].map((feature) => (
                <span key={feature} className="px-3 py-1.5 rounded-full bg-card border border-border text-sm text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {feature}
                </span>
              ))}
            </div>

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

            {/* Sign up for Early Access */}
            <div className="max-w-md mx-auto">
              <p className="text-foreground mb-6 font-medium">Sign up for early access</p>

              <div className="space-y-3">
                <button
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  onClick={signInWithMicrosoft}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                  )}
                  Continue with Microsoft
                </button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                By signing up, you agree to our{' '}
                <Link to="/legal/terms" className="text-cyan-400 hover:text-cyan-300">Terms</Link>
                {' '}and{' '}
                <Link to="/legal/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground text-xs">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/termivoxed/login"
                  className="px-6 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-foreground text-sm font-medium transition-all"
                >
                  Sign in with email
                </Link>
                <Link
                  to="/termivoxed/download"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium transition-all"
                >
                  Download Desktop App
                </Link>
              </div>
            </div>

            {/* Contact Link */}
            <p className="mt-10 text-muted-foreground text-sm">
              Have questions?{' '}
              <a href="mailto:lxusbrain@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition">
                Contact us
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
