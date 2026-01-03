import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download,
  Monitor,
  Apple,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Mic,
  Globe,
  Video,
  FileText,
  Zap,
  Clock,
  Bell,
} from 'lucide-react'
import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'
import { BeamsBackground } from '@/components/ui/beams-background'
import { VideoShowcase } from '@/components/ui/video-showcase'
import { useAuth } from '@/lib/auth-context'

// Set to true when downloads are ready
const DOWNLOADS_AVAILABLE = false

// Trial features (accurate based on backend)
const trialFeatures = [
  { icon: Video, text: '5 video exports' },
  { icon: Mic, text: '320+ AI voices' },
  { icon: Globe, text: '75+ languages' },
  { icon: FileText, text: 'Auto subtitles' },
  { icon: Zap, text: 'No credit card' },
  { icon: Clock, text: '7-day trial' },
]

export function TrialPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac'>('windows')
  const { user, loading, signInWithGoogle, signInWithMicrosoft, error } = useAuth()

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
    })
  }

  return (
    <BeamsBackground intensity="medium" className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <LxusBrainLogo size={28} />
                <LxusBrainTitle height={20} className="hidden sm:block" />
              </Link>
              <div className="h-5 sm:h-6 w-px bg-border" />
              <Link to="/termivoxed" className="flex items-center">
                <TermiVoxedLogo width={45} className="sm:w-[55px]" />
              </Link>
            </div>
            <Link
              to="/termivoxed"
              className="text-muted-foreground hover:text-foreground transition text-sm"
            >
              ← Back to TermiVoxed
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                {DOWNLOADS_AVAILABLE ? 'Start Your Free Trial' : 'Coming Soon'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get Started with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">TermiVoxed</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              {DOWNLOADS_AVAILABLE
                ? 'Download the app and start creating professional voice-overs in minutes. Try free for 7 days with 5 video exports - no credit card required.'
                : "We're putting the finishing touches on our desktop apps. Sign in to be the first to know when they're ready!"
              }
            </p>
          </motion.div>

          {/* Notify Section - Show when downloads not available */}
          {!DOWNLOADS_AVAILABLE && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-md mx-auto mb-16"
            >
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-white/5 rounded-xl mb-4" />
                </div>
              ) : user ? (
                // User is logged in - show confirmation
                <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <p className="text-green-400 mb-2 font-medium">You're on the list!</p>
                  <p className="text-muted-foreground text-sm">
                    We'll notify you at <strong className="text-foreground">{user.email}</strong> when the desktop apps are ready.
                  </p>
                </div>
              ) : (
                // Not logged in - show sign in options
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-medium text-foreground">
                      Get notified when we launch
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 text-center">
                    Sign in to join the waitlist and be first to download
                  </p>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
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

                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    By signing in, you agree to our{' '}
                    <Link to="/legal/terms" className="text-cyan-400 hover:text-cyan-300">Terms</Link>
                    {' '}and{' '}
                    <Link to="/legal/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Download Section */}
          <motion.div
            custom={DOWNLOADS_AVAILABLE ? 1 : 2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Windows Download */}
              <div
                className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlatform === 'windows'
                    ? 'bg-blue-500/10 border-blue-500/50'
                    : 'bg-card/50 border-border hover:border-blue-500/30'
                }`}
                onClick={() => setSelectedPlatform('windows')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Monitor className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Windows</h3>
                    <p className="text-muted-foreground text-sm">Windows 10/11 (64-bit)</p>
                  </div>
                </div>
                {DOWNLOADS_AVAILABLE ? (
                  <a
                    href="https://github.com/LxusBrain/termivoxed/releases/download/v1.0.4/TermiVoxed-1.0.4-Setup.exe"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download for Windows
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-muted-foreground cursor-not-allowed"
                  >
                    <Clock className="w-5 h-5" />
                    Coming Soon
                  </button>
                )}
                <p className="text-center text-xs text-muted-foreground mt-2">v1.0.4 • 85 MB</p>
              </div>

              {/* macOS Download */}
              <div
                className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlatform === 'mac'
                    ? 'bg-gray-500/10 border-gray-400/50'
                    : 'bg-card/50 border-border hover:border-gray-400/30'
                }`}
                onClick={() => setSelectedPlatform('mac')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-500/20 flex items-center justify-center">
                    <Apple className="w-7 h-7 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">macOS</h3>
                    <p className="text-muted-foreground text-sm">macOS 11+ (Intel & Apple Silicon)</p>
                  </div>
                </div>
                {DOWNLOADS_AVAILABLE ? (
                  <a
                    href="https://github.com/LxusBrain/termivoxed/releases/download/v1.0.4/TermiVoxed-1.0.4-macos.dmg"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download for macOS
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-muted-foreground cursor-not-allowed"
                  >
                    <Clock className="w-5 h-5" />
                    Coming Soon
                  </button>
                )}
                <p className="text-center text-xs text-muted-foreground mt-2">v1.0.4 • 92 MB</p>
              </div>
            </div>

            {/* Trial Features */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {trialFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08]">
                  <feature.icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Video Showcase - Animated Carousel */}
          <motion.div
            custom={DOWNLOADS_AVAILABLE ? 2 : 3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">
              See It In Action
            </h2>
            <p className="text-muted-foreground text-center mb-4">
              Watch quick demos to see what TermiVoxed can do
            </p>
            <VideoShowcase />
          </motion.div>

          {/* What's Included Section */}
          <motion.div
            custom={DOWNLOADS_AVAILABLE ? 3 : 4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
              <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                What's Included in Your 7-Day Trial
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: '5 Video Exports', desc: 'Export up to 5 videos per month' },
                  { title: '320+ AI Voices', desc: 'Full access to all Edge-TTS voices' },
                  { title: '75+ Languages', desc: 'Create content in any language' },
                  { title: 'Auto Subtitles', desc: 'AI-generated word-timed captions' },
                  { title: 'Up to 1080p Export', desc: 'Full HD video quality' },
                  { title: '10 Min Total Duration', desc: 'Combined export time limit' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Trial exports include a small watermark. Upgrade to remove watermark and unlock more features.
              </p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            custom={DOWNLOADS_AVAILABLE ? 4 : 5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {DOWNLOADS_AVAILABLE ? 'Ready to Get Started?' : 'Be the First to Know'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {DOWNLOADS_AVAILABLE
                ? 'Download TermiVoxed now and start creating professional voice-overs in minutes.'
                : 'Sign in above to join the waitlist. We\'ll email you the moment downloads are available.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {DOWNLOADS_AVAILABLE ? (
                <a
                  href="https://github.com/LxusBrain/termivoxed/releases/tag/v1.0.4"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download Now
                </a>
              ) : (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all"
                >
                  <Bell className="w-5 h-5" />
                  Join Waitlist
                </button>
              )}
              <Link
                to="/termivoxed"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] text-foreground transition-all"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LxusBrainLogo size={16} />
            <span className="text-muted-foreground text-xs">
              &copy; {new Date().getFullYear()} LxusBrain
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition">Terms</Link>
            <Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition">Privacy</Link>
            <a href="mailto:lxusbrain@gmail.com" className="text-muted-foreground hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </BeamsBackground>
  )
}
