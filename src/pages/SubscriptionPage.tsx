import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Check,
  Zap,
  Crown,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TermiVoxedLogo, LxusBrainLogo } from '@/components/logos'
import { BeamsBackground } from '@/components/ui/beams-background'

const plans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: 'forever',
    features: [
      '5 exports total',
      'Basic AI voices',
      'Watermarked exports',
      'Email support',
      '1 device'
    ],
    icon: Sparkles,
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    id: 'individual',
    name: 'Individual',
    price: 499,
    period: 'month',
    features: [
      '200 exports/month',
      'Premium AI voices',
      'No watermark',
      'Priority support',
      '2 devices'
    ],
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-600',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    period: 'month',
    features: [
      '500 exports/month',
      'Voice cloning',
      'API access',
      '24/7 support',
      '5 devices'
    ],
    icon: Crown,
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'custom',
    features: [
      '2000+ exports/month',
      'Custom branding',
      'Dedicated support',
      'SLA guarantee',
      'Unlimited devices'
    ],
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600'
  }
]

export function SubscriptionPage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/termivoxed/login')
    }
  }, [user, loading, navigate])

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId)
    setShowUpgradeModal(true)
  }

  const confirmUpgrade = async () => {
    if (!selectedPlan) return
    setUpgradeLoading(selectedPlan)
    // Simulate API call - In production, this would integrate with Razorpay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setUpgradeLoading(null)
    setShowUpgradeModal(false)
    // Show success message or redirect
    alert('Thank you for your interest! Payment integration coming soon. Please contact lxusbrain@gmail.com for manual subscription.')
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
      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <CreditCard className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Upgrade to {plans.find(p => p.id === selectedPlan)?.name}</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              You're about to upgrade your plan. Payment integration via Razorpay is coming soon. For now, please contact us for manual subscription.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm transition-all"
              >
                Cancel
              </button>
              <a
                href="mailto:lxusbrain@gmail.com?subject=Subscription Upgrade Request"
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium text-center transition-all"
              >
                Contact Us
              </a>
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Subscription</span> & Billing
            </h1>
            <p className="text-muted-foreground">Manage your plan and payment details</p>
          </motion.div>

          {/* Current plan */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-foreground capitalize">{currentPlan} Plan</p>
                <p className="text-muted-foreground text-sm">
                  {currentPlan === 'free' ? 'Free forever' : 'Billed monthly'}
                </p>
              </div>
              {currentPlan !== 'free' && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">Active</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Plans */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 text-center">Available Plans</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const Icon = plan.icon
                const isCurrent = currentPlan === plan.id
                return (
                  <div
                    key={plan.id}
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {plan.popular && !isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium">
                        Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-500 text-white text-xs font-medium">
                        Current
                      </span>
                    )}
                    <div className={`inline-block p-2 rounded-lg bg-gradient-to-r ${plan.gradient} mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                    <div className="mb-4">
                      {plan.price !== null ? (
                        <>
                          <span className="text-2xl font-bold text-foreground">&#8377;{plan.price}</span>
                          <span className="text-muted-foreground text-sm">/{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-foreground">Custom pricing</span>
                      )}
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-muted-foreground text-sm cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : plan.id === 'enterprise' ? (
                      <a
                        href="mailto:lxusbrain@gmail.com?subject=Enterprise Plan Inquiry"
                        className="block w-full py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm text-center transition-all"
                      >
                        Contact Sales
                      </a>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgradeLoading === plan.id}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {upgradeLoading === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          currentPlan === 'free' ? 'Upgrade' : 'Switch'
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Billing history */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Billing History</h2>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center">
              <p className="text-muted-foreground mb-4">No billing history yet</p>
              <p className="text-sm text-muted-foreground/60">
                Your invoices and payment receipts will appear here
              </p>
            </div>
          </motion.div>

          {/* Payment info */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
              <span className="text-sm text-muted-foreground">Powered by Razorpay</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.15] flex-1 text-center">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No payment method added</p>
                <a
                  href="mailto:lxusbrain@gmail.com?subject=Add Payment Method"
                  className="mt-3 inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium transition-all"
                >
                  Add Payment Method
                </a>
                <p className="text-xs text-muted-foreground/60 mt-2">Razorpay integration coming soon</p>
              </div>
            </div>
          </motion.div>

          {/* Help */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Have questions about billing?{' '}
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
