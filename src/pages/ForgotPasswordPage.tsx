import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TermiVoxedLogo } from '@/components/logos'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    clearError()
    const success = await resetPassword(email)
    setIsSubmitting(false)

    // Only show success if reset email was sent successfully
    // Note: Firebase doesn't reveal if email exists for security reasons,
    // so this succeeds even for non-existent emails (by design)
    if (success) {
      setIsSuccess(true)
    }
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

        {isSuccess ? (
          <>
            {/* Success state */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Check your email</h1>
              <p className="text-muted-foreground mb-8">
                We've sent a password reset link to<br />
                <span className="text-foreground font-medium">{email}</span>
              </p>
              <Link
                to="/termivoxed/login"
                className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all"
              >
                Back to sign in
              </Link>
              <p className="mt-6 text-sm text-muted-foreground">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Try again
                </button>
              </p>
            </motion.div>
          </>
        ) : (
          <>
            {/* Title */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-center mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reset your password</h1>
              <p className="text-muted-foreground">Enter your email and we'll send you a reset link</p>
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

            {/* Reset form */}
            <motion.form
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </motion.form>

            {/* Back to login */}
            <motion.p
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 text-center text-muted-foreground"
            >
              Remember your password?{' '}
              <Link to="/termivoxed/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Sign in
              </Link>
            </motion.p>
          </>
        )}
      </div>
    </div>
  )
}
