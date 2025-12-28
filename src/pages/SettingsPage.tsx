import { useState } from 'react'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  LogOut,
  Loader2,
  CheckCircle,
  Camera
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile } from '@/lib/firebase'
import { TermiVoxedLogo, LxusBrainLogo } from '@/components/logos'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, profile, loading, logout } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/termivoxed/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName)
    } else if (user?.displayName) {
      setDisplayName(user.displayName)
    }
  }, [profile, user])

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

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserProfile(user.uid, { displayName })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
    setIsSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-indigo-500/[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,200,0.08),transparent)]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/termivoxed/dashboard')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </button>
            </div>
            <Link to="/termivoxed" className="flex items-center gap-3">
              <TermiVoxedLogo width={40} height={34} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </motion.div>

          {/* Profile section */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-20 h-20 rounded-full border-2 border-cyan-500/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {(displayName || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-card border border-border hover:bg-white/10 transition-colors">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile photo</p>
                <p className="text-xs text-muted-foreground/60">Synced from your login provider</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  placeholder="Your name"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </motion.div>

          {/* Email section */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Email</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.emailVerified ? (
                    <span className="text-green-400">Verified</span>
                  ) : (
                    <span className="text-amber-400">Not verified</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security section */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <p className="text-foreground font-medium">Sign-in Method</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile?.provider || user.providerData[0]?.providerId || 'Email'}
                  </p>
                </div>
              </div>
              {profile?.provider === 'password' && (
                <Link
                  to="/termivoxed/forgot-password"
                  className="block px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all text-foreground"
                >
                  Change Password
                </Link>
              )}
            </div>
          </motion.div>

          {/* Notifications section */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                <div>
                  <p className="text-foreground font-medium">Product Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about new features</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-cyan-500" />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                <div>
                  <p className="text-foreground font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive promotional content</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded accent-cyan-500" />
              </label>
            </div>
          </motion.div>

          {/* Appearance section */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <p className="text-foreground font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Dark mode is currently enabled</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm">Dark</span>
            </div>
          </motion.div>

          {/* Danger zone */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign out of all devices
              </button>
              <button className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all text-red-400">
                Delete Account
              </button>
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
