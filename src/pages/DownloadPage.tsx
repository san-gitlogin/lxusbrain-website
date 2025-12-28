import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Monitor, Apple, ArrowLeft, Clock, CheckCircle, User } from 'lucide-react'

import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function DownloadPage() {
  const navigate = useNavigate()
  const { user, loading, signInWithGoogle, signInWithMicrosoft, error } = useAuth()

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
            <div className="flex items-center gap-4">
              {!loading && user && (
                <Link
                  to="/termivoxed/dashboard"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              <Link to="/termivoxed" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm">Coming Soon</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Download <span className="gradient-text">TermiVoxed</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're putting the finishing touches on our desktop apps. Be the first to know when they're ready!
            </p>
          </motion.div>

          {/* Platform Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            {/* Windows */}
            <div className="relative p-6 rounded-2xl bg-card/50 border border-border hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Monitor className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Windows</h3>
                  <p className="text-muted-foreground text-sm">Windows 10/11 (64-bit)</p>
                </div>
              </div>
              <Button disabled className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>

            {/* macOS */}
            <div className="relative p-6 rounded-2xl bg-card/50 border border-border hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-500/10 flex items-center justify-center">
                  <Apple className="w-7 h-7 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">macOS</h3>
                  <p className="text-muted-foreground text-sm">macOS 11+ (Intel & Apple Silicon)</p>
                </div>
              </div>
              <Button disabled className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </motion.div>

          {/* Notify / Sign Up Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-md mx-auto text-center"
          >
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-white/5 rounded-xl mb-4" />
              </div>
            ) : user ? (
              // User is logged in - show confirmation
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 mb-2 font-medium">You're on the list!</p>
                <p className="text-muted-foreground text-sm">
                  We'll notify you at <strong className="text-foreground">{user.email}</strong> when the desktop apps are ready.
                </p>
              </div>
            ) : (
              // Not logged in - show sign in options
              <>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Get notified when we launch
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Sign in to join the waitlist and be first to download
                </p>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={signInWithGoogle}
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
                    onClick={signInWithMicrosoft}
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
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <Link to="/legal/terms" className="text-cyan-400 hover:text-cyan-300">Terms</Link>
                  {' '}and{' '}
                  <Link to="/legal/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
                </p>
              </>
            )}
          </motion.div>

          {/* Web App Alternative */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-4">
              In the meantime, you can use our web version
            </p>
            <Link
              to="/termivoxed/app"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
            >
              Try TermiVoxed Web App
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
