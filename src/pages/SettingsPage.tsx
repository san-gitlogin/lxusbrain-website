import { useState, useEffect } from 'react'
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
  AlertTriangle,
  X,
  Download,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile } from '@/lib/firebase'
import { deleteAccount, downloadUserData } from '@/lib/razorpay'
import { TermiVoxedLogo, LxusBrainLogo } from '@/components/logos'
import { BeamsBackground } from '@/components/ui/beams-background'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, profile, loading, logout } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [exportSuccess, setExportSuccess] = useState(false)

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return

    setIsDeleting(true)
    setDeleteError('')

    try {
      const response = await deleteAccount()
      if (response.success) {
        // Account deleted, sign out and redirect
        await logout()
        navigate('/')
      } else {
        setDeleteError(response.error || 'Failed to delete account')
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account')
    }

    setIsDeleting(false)
  }

  const handleExportData = async () => {
    setIsExporting(true)
    setExportError('')
    setExportSuccess(false)

    try {
      await downloadUserData()
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to export data')
    }

    setIsExporting(false)
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
    <BeamsBackground intensity="subtle" className="min-h-screen bg-background">
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Delete Account</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-muted-foreground mb-4">
              This action cannot be undone. All your data will be permanently deleted, including:
            </p>
            <ul className="text-sm text-muted-foreground mb-4 list-disc list-inside space-y-1">
              <li>Your profile and settings</li>
              <li>All projects and exports</li>
              <li>Payment and subscription history</li>
              <li>Active subscriptions (will be cancelled)</li>
            </ul>
            <p className="text-sm text-foreground mb-2">Type <strong className="text-red-400">DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={isDeleting}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all mb-4 disabled:opacity-50"
              placeholder="Type DELETE"
            />
            {deleteError && (
              <p className="text-sm text-red-400 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-center transition-all flex items-center justify-center gap-2 ${
                  deleteConfirmText === 'DELETE' && !isDeleting
                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                    : 'bg-red-500/30 text-red-400/50 cursor-not-allowed'
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Account <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Settings</span>
            </h1>
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
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-16 h-16 rounded-full border-2 border-cyan-500/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {(displayName || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{displayName || user.email}</p>
                <p className="text-xs text-muted-foreground">Photo synced from {user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : user.providerData?.[0]?.providerId === 'microsoft.com' ? 'Microsoft' : 'login provider'}</p>
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

          {/* Data Privacy section (GDPR/CCPA) */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Data Privacy</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Under GDPR and CCPA, you have the right to access and download your personal data.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all text-foreground disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download My Data
                </>
              )}
            </button>
            {exportError && (
              <p className="text-sm text-red-400 mt-2">{exportError}</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-3">
              Your data will be exported as a JSON file containing your profile, projects, and payment history.
            </p>
          </motion.div>

          {/* Danger zone */}
          <motion.div
            custom={7}
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
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all text-red-400"
              >
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
