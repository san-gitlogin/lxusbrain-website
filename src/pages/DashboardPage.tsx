import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Settings,
  CreditCard,
  Download,
  LogOut,
  Sparkles,
  Zap,
  Crown,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TermiVoxedLogo, LxusBrainLogo } from '@/components/logos'
import { BeamsBackground } from '@/components/ui/beams-background'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, profile, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/termivoxed/login')
    }
  }, [user, loading, navigate])

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

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const planColors = {
    free: 'from-gray-500 to-gray-600',
    individual: 'from-cyan-500 to-blue-600',
    pro: 'from-violet-500 to-purple-600',
    enterprise: 'from-amber-500 to-orange-600'
  }

  const planIcons = {
    free: Sparkles,
    individual: Zap,
    pro: Crown,
    enterprise: Crown
  }

  const currentPlan = profile?.plan || 'free'
  const PlanIcon = planIcons[currentPlan]

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
    })
  }

  return (
    <BeamsBackground intensity="subtle" className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/termivoxed" className="flex items-center gap-3">
              <TermiVoxedLogo width={40} height={34} />
              <span className="font-semibold text-foreground hidden sm:block">TermiVoxed</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <LxusBrainLogo size={20} />
                <span className="hidden sm:inline">LxusBrain</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
              {/* User Avatar */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-cyan-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{profile?.displayName || user.displayName || 'there'}</span>!
            </h1>
            <p className="text-muted-foreground">Manage your account and subscription</p>
          </motion.div>

          {/* User card */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-16 h-16 rounded-full border-2 border-cyan-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-gradient-to-r ${planColors[currentPlan]}`}>
                  <PlanIcon className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* User info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {profile?.displayName || user.displayName || 'User'}
                </h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${planColors[currentPlan]} text-white`}>
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                  </span>
                  {profile?.earlyAccess && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      Early Access
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 gap-4 mb-8"
          >
            <Link
              to="/termivoxed/settings"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Account Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage your profile</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
              </div>
            </Link>

            <Link
              to="/termivoxed/subscription"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <CreditCard className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Subscription</h3>
                    <p className="text-sm text-muted-foreground">Manage billing</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
              </div>
            </Link>
          </motion.div>

          {/* App Download */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Get TermiVoxed</h2>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
                  <Download className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Desktop Application</h3>
                  <p className="text-sm text-muted-foreground">
                    TermiVoxed runs as a desktop application on Windows and macOS. Download to get started with AI voice-over and dubbing.
                  </p>
                </div>
                <Link
                  to="/termivoxed/download"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium transition-all whitespace-nowrap"
                >
                  Download App
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Usage stats (placeholder) */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">This Month's Usage</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Exports Used</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center">
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Exports Left</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Videos Created</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center">
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-xs text-muted-foreground">Devices</p>
              </div>
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
