import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Settings,
  CreditCard,
  Download,
  LogOut,
  Sparkles,
  Zap,
  Crown,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TermiVoxedLogo, LxusBrainLogo } from '@/components/logos'

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-indigo-500/[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,200,0.08),transparent)]" />

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
              Welcome back, {profile?.displayName || user.displayName || 'there'}!
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

          {/* App status */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">TermiVoxed App</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Web App */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <ExternalLink className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Web App</h3>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Access TermiVoxed directly in your browser. No installation required.
                </p>
                <button
                  disabled
                  className="w-full py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-muted-foreground text-sm cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              {/* Desktop App */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Download className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Desktop App</h3>
                    <div className="flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Available</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Download the desktop app for Windows or macOS for full functionality.
                </p>
                <Link
                  to="/termivoxed/download"
                  className="block w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm text-center font-medium transition-all"
                >
                  Download Now
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
              &copy; {new Date().getFullYear()} LxusBrain Technologies
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition">Terms</Link>
            <Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition">Privacy</Link>
            <a href="mailto:lxusbrain@gmail.com" className="text-muted-foreground hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
