import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  BadgeCheck,
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCcw
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { initiatePayment, cancelSubscription, type PlanId, type BillingPeriod, type SubscriptionStatus } from '@/lib/razorpay'
import { TermiVoxedLogo, LxusBrainLogo } from '@/components/logos'
import { BeamsBackground } from '@/components/ui/beams-background'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: { monthly: 'Free', yearly: 'Free' },
    description: 'Try before you commit',
    features: ['5 video exports', '320+ AI voices', 'Watermark included', '7-day trial'],
    cta: 'Current Plan'
  },
  {
    id: 'individual',
    name: 'Individual',
    price: { monthly: 199, yearly: 167 },
    description: 'For creators & freelancers',
    features: ['200 exports/month', 'Premium voices', 'No watermark', 'Priority support', '2 devices'],
    cta: 'Upgrade',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 399, yearly: 333 },
    description: 'For professionals',
    features: ['Unlimited exports', 'Voice cloning', 'API access', '24/7 support', '3 devices'],
    cta: 'Upgrade'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'For teams & organizations',
    features: ['2000 exports/month', 'Custom branding', 'Dedicated support', 'SLA guarantee', 'Up to 50 devices'],
    cta: 'Contact Sales',
    highlighted: true
  }
]

type PaymentStatus = 'idle' | 'loading' | 'success' | 'error'
type CancelStatus = 'idle' | 'confirming' | 'cancelling' | 'success' | 'error'

export function SubscriptionPage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [frequency, setFrequency] = useState<BillingPeriod>('monthly')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [cancelStatus, setCancelStatus] = useState<CancelStatus>('idle')
  const [cancelMessage, setCancelMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      navigate('/termivoxed/login')
    }
  }, [user, loading, navigate])

  const handleCancelSubscription = async () => {
    setCancelStatus('cancelling')
    try {
      const response = await cancelSubscription()
      if (response.success) {
        setCancelStatus('success')
        setCancelMessage(response.message || 'Subscription cancelled successfully')
        // Refresh after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setCancelStatus('error')
        setCancelMessage(response.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      setCancelStatus('error')
      setCancelMessage(error instanceof Error ? error.message : 'Failed to cancel subscription')
    }
  }

  const closeCancelModal = () => {
    setCancelStatus('idle')
    setCancelMessage('')
  }

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:lxusbrain@gmail.com?subject=Enterprise Plan Inquiry'
      return
    }

    if (planId === 'free') return

    setProcessingPlan(planId)
    setPaymentStatus('loading')
    setPaymentMessage('')

    try {
      await initiatePayment(
        planId as PlanId,
        frequency,
        {
          name: user?.displayName || undefined,
          email: user?.email || undefined,
        },
        {
          onSuccess: (message) => {
            setPaymentStatus('success')
            setPaymentMessage(message)
            // Refresh profile after successful payment
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          },
          onError: (error) => {
            setPaymentStatus('error')
            setPaymentMessage(error)
          },
          onCancel: () => {
            setPaymentStatus('idle')
            setProcessingPlan(null)
          }
        }
      )
    } catch (error) {
      setPaymentStatus('error')
      setPaymentMessage(error instanceof Error ? error.message : 'Payment failed')
    }
  }

  const closeStatusModal = () => {
    setPaymentStatus('idle')
    setProcessingPlan(null)
    setPaymentMessage('')
  }

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

  const currentPlan = profile?.plan || 'free'

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
      {/* Payment Status Modal */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full text-center"
            >
              {paymentStatus === 'loading' && (
                <>
                  <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Processing Payment</h3>
                  <p className="text-muted-foreground">
                    Please complete the payment in the Razorpay window...
                  </p>
                </>
              )}

              {paymentStatus === 'success' && (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payment Successful!</h3>
                  <p className="text-muted-foreground mb-4">{paymentMessage}</p>
                  <p className="text-sm text-muted-foreground">Refreshing page...</p>
                </>
              )}

              {paymentStatus === 'error' && (
                <>
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payment Failed</h3>
                  <p className="text-muted-foreground mb-6">{paymentMessage}</p>
                  <button
                    onClick={closeStatusModal}
                    className="px-6 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm transition-all"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Subscription Modal */}
      <AnimatePresence>
        {cancelStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full text-center"
            >
              {cancelStatus === 'confirming' && (
                <>
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cancel Subscription?</h3>
                  <p className="text-muted-foreground mb-6">
                    Your subscription will remain active until the end of your current billing period.
                    You can resubscribe anytime.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={closeCancelModal}
                      className="px-6 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm transition-all"
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="px-6 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-sm transition-all"
                    >
                      Yes, Cancel
                    </button>
                  </div>
                </>
              )}

              {cancelStatus === 'cancelling' && (
                <>
                  <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cancelling Subscription</h3>
                  <p className="text-muted-foreground">Please wait...</p>
                </>
              )}

              {cancelStatus === 'success' && (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Subscription Cancelled</h3>
                  <p className="text-muted-foreground mb-4">{cancelMessage}</p>
                  <p className="text-sm text-muted-foreground">Refreshing page...</p>
                </>
              )}

              {cancelStatus === 'error' && (
                <>
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cancellation Failed</h3>
                  <p className="text-muted-foreground mb-6">{cancelMessage}</p>
                  <button
                    onClick={closeCancelModal}
                    className="px-6 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm transition-all"
                  >
                    Close
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <span className="text-sm">Back</span>
              </button>
            </div>
            <Link to="/termivoxed" className="flex items-center gap-3">
              <TermiVoxedLogo width={40} height={34} />
            </Link>
            {/* User Avatar */}
            <Link to="/termivoxed/dashboard" className="flex items-center">
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
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Subscription</span> & Billing
            </h1>
            <p className="text-muted-foreground">Manage your plan and payment details</p>
          </motion.div>

          {/* Frequency Toggle */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex justify-center mb-8"
          >
            <div className="flex rounded-full bg-muted p-1">
              <button
                onClick={() => setFrequency('monthly')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  frequency === 'monthly'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setFrequency('yearly')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  frequency === 'yearly'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">-20%</span>
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
          >
            {plans.map((plan) => {
              const price = plan.price[frequency]
              const isCurrent = currentPlan === plan.id
              const isHighlighted = plan.highlighted
              const isPopular = plan.popular
              const isProcessing = processingPlan === plan.id && paymentStatus === 'loading'

              return (
                <div key={plan.id} className="relative rounded-xl h-full">
                  <GlowingEffect
                    variant="cyan"
                    blur={0}
                    borderWidth={1}
                    spread={15}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div
                    className={cn(
                      "relative flex flex-col gap-5 md:gap-6 overflow-hidden p-4 md:p-6 h-full rounded-xl border",
                      isHighlighted
                        ? "bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-cyan-500/30"
                        : isCurrent
                        ? "bg-cyan-500/5 border-cyan-500/30"
                        : "bg-background border-white/10"
                    )}
                  >
                    {isHighlighted && (
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,200,200,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,200,200,0.1)_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                    )}
                    {isPopular && (
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                    )}

                    <h2 className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-medium capitalize relative z-10">
                      {plan.name}
                      {isPopular && !isCurrent && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Current</Badge>
                      )}
                    </h2>

                    <div className="relative h-10 md:h-12 z-10">
                      {typeof price === 'number' ? (
                        <>
                          <span className="text-3xl md:text-4xl font-medium">₹{price}</span>
                          <p className={cn(
                            "-mt-1 text-xs",
                            isHighlighted ? "text-cyan-300/60" : "text-muted-foreground"
                          )}>
                            Per month
                          </p>
                        </>
                      ) : (
                        <span className="text-3xl md:text-4xl font-medium">{price}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 relative z-10">
                      <h3 className="text-sm font-medium">{plan.description}</h3>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className={cn(
                              "flex items-center gap-2 text-sm font-medium",
                              isHighlighted ? "text-cyan-100/80" : "text-muted-foreground"
                            )}
                          >
                            <BadgeCheck className="h-4 w-4 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-muted-foreground text-sm cursor-not-allowed relative z-10"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* Subscription Management (only show if user has a paid plan) */}
          {currentPlan !== 'free' && profile?.planStatus && (
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/50 to-blue-950/30 border border-cyan-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-cyan-400" />
                  Your Subscription
                </h2>
                <Badge
                  className={cn(
                    "text-xs",
                    profile.planStatus === 'active'
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : profile.planStatus === 'cancelled'
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  )}
                >
                  {profile.planStatus === 'active' ? 'Active' :
                   profile.planStatus === 'cancelled' ? 'Cancelled' : 'Payment Failed'}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                  <p className="text-foreground font-medium capitalize">{currentPlan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Billing Period</p>
                  <p className="text-foreground font-medium capitalize">
                    {profile.billing_period || 'Monthly'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {profile.planStatus === 'cancelled' ? 'Access Until' : 'Next Billing'}
                  </p>
                  <p className="text-foreground font-medium">
                    {profile.subscription_expires_at
                      ? new Date(profile.subscription_expires_at.toDate()).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {profile.planStatus === 'active' && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCancelStatus('confirming')}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Cancel subscription
                  </button>
                </div>
              )}

              {profile.planStatus === 'cancelled' && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground">
                    Your subscription is cancelled. You can still access premium features until your current period ends.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Billing & Payment Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Billing history */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Billing History</h2>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">No billing history yet</p>
                <p className="text-sm text-muted-foreground/60">
                  Your invoices will appear here after your first payment
                </p>
              </div>
            </motion.div>

            {/* Payment info */}
            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  Secured by Razorpay
                </div>
              </div>
              <div className="text-center py-4">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm mb-1">Pay securely via Razorpay</p>
                <p className="text-xs text-muted-foreground/60 mb-4">
                  Cards, UPI, Net Banking, Wallets supported
                </p>
                <div className="flex items-center justify-center gap-4 opacity-70">
                  <span className="text-xs font-medium text-zinc-400 border border-zinc-700 rounded px-2 py-1">VISA</span>
                  <span className="text-xs font-medium text-zinc-400 border border-zinc-700 rounded px-2 py-1">Mastercard</span>
                  <span className="text-xs font-medium text-zinc-400 border border-zinc-700 rounded px-2 py-1">UPI</span>
                  <span className="text-xs font-medium text-zinc-400 border border-zinc-700 rounded px-2 py-1">NetBanking</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Help */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Questions?{' '}
              <a href="mailto:lxusbrain@gmail.com" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                Contact support <ExternalLink className="w-3 h-3" />
              </a>
            </p>
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
            <Link to="/legal/refund" className="text-muted-foreground hover:text-foreground transition">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </BeamsBackground>
  )
}
