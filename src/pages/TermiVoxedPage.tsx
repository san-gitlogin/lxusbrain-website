import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mic,
  Globe,
  Sparkles,
  Video,
  Check,
  Menu,
  X,
  ArrowRight,
  Play,
  Zap,
  Shield,
  Clock,
  User,
  LogOut
} from 'lucide-react'

// Components
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { TestimonialsColumn } from '@/components/ui/testimonials-column'
import { PricingSection } from '@/components/ui/pricing-section'
import { LetsTalk } from '@/components/ui/lets-work-section'
import { MovingBorderButton } from '@/components/ui/moving-border'
import { Button } from '@/components/ui/button'

// Auth
import { useAuth } from '@/lib/auth-context'

// Logos
import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'

// Data
const features = [
  {
    icon: Mic,
    title: 'AI Voice Generation',
    description: '320+ natural voices in 75+ languages powered by cutting-edge AI technology.'
  },
  {
    icon: Globe,
    title: 'Multi-Language Dubbing',
    description: 'Professional dubbing with authentic accents and natural pronunciation.'
  },
  {
    icon: Sparkles,
    title: 'Smart Subtitles',
    description: 'Auto-generate and style subtitles with 1000+ Google Fonts integration.'
  },
  {
    icon: Video,
    title: 'Video Processing',
    description: 'Multi-video projects, BGM mixing, and quality export presets.'
  },
  {
    icon: Zap,
    title: 'Voice Cloning',
    description: 'Clone any voice with just 6 seconds of audio for personalized content.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'AES-256 encryption, JWT auth, and GDPR/DPDP compliance.'
  }
]

const testimonials = [
  {
    text: "TermiVoxed transformed how we create multilingual content. The AI voices are incredibly natural.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Priya Sharma",
    role: "Content Director, MediaWorks"
  },
  {
    text: "Voice cloning feature is a game-changer. We maintain brand consistency across all languages.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Rahul Verma",
    role: "Brand Manager, TechFlow"
  },
  {
    text: "Cut our video localization time by 80%. The subtitle styling is professional and beautiful.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Ananya Patel",
    role: "Video Producer, CreativeHub"
  },
  {
    text: "Enterprise features and security compliance made it easy to adopt across our organization.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Vikram Singh",
    role: "CTO, GlobalMedia"
  },
  {
    text: "The API integration was seamless. Now our entire workflow is automated.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Sneha Reddy",
    role: "Technical Lead, AutomateNow"
  },
  {
    text: "Best investment for our e-learning platform. Students love the natural voice-overs.",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    name: "Arjun Menon",
    role: "CEO, EduLearn"
  }
]

const PAYMENT_FREQUENCIES = ["monthly", "yearly"]

const TIERS = [
  {
    name: "Free Trial",
    price: { monthly: "Free", yearly: "Free" },
    description: "Try before you commit",
    features: ["5 video exports", "Basic voices", "Watermark included", "Email support"],
    cta: "Start Free",
  },
  {
    name: "Individual",
    price: { monthly: 499, yearly: 399 },
    description: "For creators & freelancers",
    features: ["200 exports/month", "Premium voices", "No watermark", "Priority support", "2 devices"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pro",
    price: { monthly: 999, yearly: 799 },
    description: "For professionals",
    features: ["500 exports/month", "Voice cloning", "API access", "24/7 support", "5 devices"],
    cta: "Go Pro",
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "For teams & organizations",
    features: ["2000+ exports/month", "Custom branding", "Dedicated support", "SLA guarantee", "Unlimited devices"],
    cta: "Contact Sales",
    highlighted: true,
  },
]

export function TermiVoxedPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()

  const handleTierSelect = (tierName: string) => {
    const planMap: Record<string, string> = {
      'Free Trial': 'free',
      'Individual': 'individual',
      'Pro': 'pro',
      'Enterprise': 'enterprise'
    }
    const plan = planMap[tierName] || 'individual'
    navigate(`/termivoxed/get-started?plan=${plan}`)
  }

  const firstColumn = testimonials.slice(0, 2)
  const secondColumn = testimonials.slice(2, 4)
  const thirdColumn = testimonials.slice(4, 6)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 outline-none focus:outline-none">
                <LxusBrainLogo size={28} className="sm:w-8 sm:h-8" />
                <LxusBrainTitle height={20} className="hidden sm:block" />
              </Link>
              <div className="h-5 sm:h-6 w-px bg-border" />
              <Link to="/termivoxed" className="flex items-center">
                <TermiVoxedLogo width={45} className="sm:w-[55px]" />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition">Contact</a>
              {!loading && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/termivoxed/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition text-sm text-foreground"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/termivoxed/login" className="text-muted-foreground hover:text-foreground transition text-sm">
                    Sign in
                  </Link>
                  <Link to="/termivoxed/app" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-muted-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background/95 border-b border-border"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-border mb-2">
                <TermiVoxedLogo width={55} />
              </div>
              <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
              <a href="#contact" className="block text-muted-foreground hover:text-foreground">Contact</a>
              {!loading && user ? (
                <>
                  <Link to="/termivoxed/dashboard" className="flex items-center gap-2 text-foreground">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/termivoxed/login" className="block text-muted-foreground hover:text-foreground">Sign in</Link>
                  <Link to="/termivoxed/app" className="btn-primary block text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section with Geometric Animation */}
      <HeroGeometric
        badge="AI-Powered Voice-Over Platform"
        title1="Transform Your"
        title2="Video Content"
        description="Professional AI voice-over and dubbing platform. Create multilingual content with natural-sounding voices in 75+ languages."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <MovingBorderButton
            borderRadius="1.75rem"
            containerClassName="h-12"
            className="bg-slate-900/[0.8] px-6"
            onClick={() => window.location.href = '/termivoxed/app'}
          >
            <Play className="w-4 h-4 mr-2" />
            Try TermiVoxed Free
          </MovingBorderButton>
          <Button variant="outline" size="lg" className="rounded-full" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </HeroGeometric>

      {/* Product Overview Section */}
      <section id="overview" className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-card max-w-5xl mx-auto overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 p-4">
                <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
                  <span className="text-cyan-400 text-sm">By LxusBrain</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">TermiVoxed</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Self-hosted AI voice-over platform. Generate natural-sounding dubbing in 75+ languages. Install on your infrastructure, maintain full control of your data.
                </p>
                <ul className="space-y-3 mb-8">
                  {['320+ AI Voices', 'Voice Cloning Technology', '1000+ Subtitle Fonts', 'Multi-Video Projects'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/termivoxed/app" className="btn-primary inline-flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Try TermiVoxed
                  </Link>
                  <Link to="/termivoxed/download" className="btn-secondary inline-flex items-center justify-center">
                    Download App
                  </Link>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-3xl blur-2xl" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/10">
                    <TermiVoxedLogo width={220} />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful <span className="gradient-text">Capabilities</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional voice-overs and dubbed content
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="section-card group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background/50 to-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied creators and businesses
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 md:gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[400px] md:max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <PricingSection
              title="Simple, Transparent Pricing"
              subtitle="Self-hosted software with subscription support. Choose the plan that fits your needs."
              frequencies={PAYMENT_FREQUENCIES}
              tiers={TIERS}
              onTierSelect={handleTierSelect}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Self-hosted solution • Install on your own infrastructure • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <LetsTalk email="lxusbrain@gmail.com" />
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LxusBrainLogo size={32} />
                <LxusBrainTitle height={20} />
              </div>
              <p className="text-muted-foreground text-sm">
                Self-hosted AI software with subscription support. Your data, your infrastructure, our innovation.
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/termivoxed/app" className="text-muted-foreground hover:text-primary transition">TermiVoxed Web</Link></li>
                <li><Link to="/termivoxed/download" className="text-muted-foreground hover:text-primary transition">Windows App</Link></li>
                <li><Link to="/termivoxed/download" className="text-muted-foreground hover:text-primary transition">macOS App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition">Terms of Service</Link></li>
                <li><Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition">Privacy Policy</Link></li>
                <li><Link to="/legal/refund" className="text-muted-foreground hover:text-primary transition">Refund Policy</Link></li>
                <li><Link to="/legal/shipping" className="text-muted-foreground hover:text-primary transition">Shipping Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">Gudiyattam 632602, Tamil Nadu, India</li>
                <li><a href="tel:+918667429016" className="text-muted-foreground hover:text-primary transition">+91 8667429016</a></li>
                <li><a href="mailto:lxusbrain@gmail.com" className="text-muted-foreground hover:text-primary transition">lxusbrain@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} LxusBrain Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
