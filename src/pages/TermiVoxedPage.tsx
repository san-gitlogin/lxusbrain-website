import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Check,
  Menu,
  X,
  ArrowRight,
  Play,
  Clock,
  LogOut,
  User
} from 'lucide-react'

// Components
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { TestimonialsColumn } from '@/components/ui/testimonials-column'
import { PricingSection } from '@/components/ui/pricing-section'
import { LetsTalk } from '@/components/ui/lets-work-section'
import { MovingBorderButton } from '@/components/ui/moving-border'
import { Button } from '@/components/ui/button'
import { ProblemShowcase } from '@/components/ui/problem-showcase'
import { FeatureShowcase } from '@/components/ui/feature-showcase'

// Auth
import { useAuth } from '@/lib/auth-context'

// Logos
import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'

// Featured showcase items with larger visuals
const showcaseItems = [
  {
    title: 'Intuitive Timeline Editor',
    description: 'Professional-grade timeline with voice-over tracks, BGM mixing, and segment stacking. Drag, drop, and edit with precision.',
    screenshot: '/screenshots/timeline.png', // Add your screenshot here
    video: '/demo-videos/timeline-demo.mp4', // Optional: Add demo video
    features: ['Multi-track editing', 'Segment stacking', 'Zoom controls', 'Real-time preview'],
  },
  {
    title: 'AI Voice Studio',
    description: 'Select from 320+ natural-sounding voices across 75+ languages. Adjust pitch, speed, and volume with real-time preview.',
    screenshot: '/screenshots/voice-studio.png', // Add your screenshot here
    video: '/demo-videos/voice-studio-demo.mp4', // Optional: Add demo video
    features: ['320+ voices', 'Real-time preview', 'Voice cloning', 'Emotion control'],
  },
  {
    title: 'Smart Subtitle Generation',
    description: 'Automatically generate word-timed subtitles with advanced styling options. Choose from 1000+ Google Fonts.',
    screenshot: '/screenshots/subtitle-editor.png', // Add your screenshot here
    video: '/demo-videos/subtitle-demo.mp4', // Optional: Add demo video
    features: ['Auto-transcription', 'Word-level timing', '1000+ fonts', 'Animation effects'],
  },
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
    features: ["5 video exports", "320+ AI voices", "Watermark included", "7-day trial"],
    cta: "Start Free",
  },
  {
    name: "Individual",
    price: { monthly: 199, yearly: 167 },
    description: "For creators & freelancers",
    features: ["200 exports/month", "Premium voices", "No watermark", "Priority support", "2 devices"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pro",
    price: { monthly: 399, yearly: 333 },
    description: "For professionals",
    features: ["Unlimited exports", "Voice cloning", "API access", "24/7 support", "3 devices"],
    cta: "Go Pro",
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "For teams & organizations",
    features: ["Unlimited exports", "Volume licensing", "Priority support", "Invoice billing", "Up to 50 devices"],
    cta: "Contact Sales",
    highlighted: true,
  },
]

export function TermiVoxedPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()

  const handleTierSelect = (tierName: string) => {
    // Enterprise goes to dedicated enterprise page
    if (tierName === 'Enterprise') {
      navigate('/termivoxed/enterprise')
      return
    }

    const planMap: Record<string, string> = {
      'Free Trial': 'free',
      'Individual': 'individual',
      'Pro': 'pro'
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
                <Link to="/termivoxed/dashboard" className="flex items-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-9 h-9 rounded-full border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                      <span className="text-sm font-bold text-white">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>
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
            onClick={() => window.location.href = '/termivoxed/try'}
          >
            <Play className="w-4 h-4 mr-2" />
            Try Now
          </MovingBorderButton>
          <Button variant="outline" size="lg" className="rounded-full" onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}>
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </HeroGeometric>

      {/* Problem Showcase Section - Sell the Pain Points */}
      <section id="problem" className="py-12 md:py-16 px-4 bg-gradient-to-b from-background to-background/50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-10"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Still Making PPTs?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your competitors are shipping cinematic videos. You're clicking through slides.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ProblemShowcase />
          </motion.div>
        </div>
      </section>

      {/* Features Section - The Solution */}
      <section id="features" className="py-12 md:py-16 px-4 bg-gradient-to-b from-background/50 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-4">
              The Solution
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful <span className="gradient-text">Capabilities</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to turn screen recordings into professional productions
            </p>
          </motion.div>

          <FeatureShowcase />
        </div>
      </section>

      {/* Product Overview Section - Download CTA */}
      <section id="overview" className="py-12 md:py-16 px-4">
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
                <Link to="/termivoxed/try" className="btn-primary inline-flex items-center justify-center">
                  Download App
                </Link>
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

      {/* Showcase Section - Visual Feature Demos */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-4">
              See It In Action
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful <span className="gradient-text">Interface</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A professional video editing experience designed for creators
            </p>
          </motion.div>

          <div className="space-y-12 md:space-y-16">
            {showcaseItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Screenshot/Video Placeholder */}
                <div className={`relative ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl">
                    {/* Gradient placeholder - replace with actual screenshot */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10" />

                    {/* Placeholder content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer">
                          <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <p className="text-white/60 text-sm">Screenshot/Video Coming Soon</p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl -z-10 opacity-50" />
                </div>

                {/* Content */}
                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    {item.description}
                  </p>
                  <ul className="space-y-3">
                    {item.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-background/50 to-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
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
            <TestimonialsColumn testimonials={firstColumn} duration={30} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={38} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={34} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-16 px-4">
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
                <li><Link to="/termivoxed" className="text-muted-foreground hover:text-primary transition">TermiVoxed</Link></li>
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
          {/* Powered By Section */}
          <div className="pt-6 pb-4 border-t border-border">
            <p className="text-center text-muted-foreground/60 text-xs mb-3">Powered by open source technologies</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-muted-foreground/70">FFmpeg</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-muted-foreground/70">Edge-TTS</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-muted-foreground/70">Coqui TTS</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-muted-foreground/70">LangChain</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-muted-foreground/70">Whisper</span>
            </div>
          </div>
          <div className="pt-4 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} LxusBrain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
