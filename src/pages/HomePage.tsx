import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

import { MagneticText } from '@/components/ui/magnetic-text'
import { BeamsBackground } from '@/components/ui/beams-background'
import { LxusBrainLogo, LxusBrainTitle } from '@/components/logos'

// Words and gradients for hero animation
const heroWords = [
  { text: "Building", gradient: "from-cyan-400 via-blue-400 to-indigo-400" },
  { text: "Transforming", gradient: "from-violet-400 via-purple-400 to-fuchsia-400" },
  { text: "Securing", gradient: "from-emerald-400 via-teal-400 to-cyan-400" },
  { text: "Powering", gradient: "from-amber-400 via-orange-400 to-red-400" },
]

// Shared animation config for perfect sync
const heroAnimationConfig = {
  duration: 0.6,
  ease: [0.33, 1, 0.68, 1] as const
}

// Animated cycling words for hero
function AnimatedWords({ currentIndex }: { currentIndex: number }) {
  return (
    <span className="relative inline-flex overflow-hidden h-[1.2em] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={heroAnimationConfig}
          className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r",
            heroWords[currentIndex].gradient
          )}
        >
          {heroWords[currentIndex].text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// Animated gradient text with bottom-to-top color wipe effect
function AnimatedGradientText({ currentIndex, children }: { currentIndex: number; children: React.ReactNode }) {
  const prevIndex = currentIndex === 0 ? heroWords.length - 1 : currentIndex - 1

  return (
    <span className="relative inline-block">
      {/* Base layer - previous gradient */}
      <span
        className={cn(
          "bg-clip-text text-transparent bg-gradient-to-r",
          heroWords[prevIndex].gradient
        )}
      >
        {children}
      </span>
      {/* Top layer - new gradient with clip-path animation */}
      <motion.span
        key={currentIndex}
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: "inset(0% 0 0 0)" }}
        transition={heroAnimationConfig}
        className={cn(
          "absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r",
          heroWords[currentIndex].gradient
        )}
      >
        {children}
      </motion.span>
    </span>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [wordIndex, setWordIndex] = useState(0)

  // Cycle through words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.3 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <BeamsBackground intensity="medium" className="bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2 sm:gap-3 outline-none focus:outline-none">
              <LxusBrainLogo size={28} className="sm:w-8 sm:h-8" />
              <LxusBrainTitle height={20} className="hidden sm:block" />
            </a>
            <div className="flex items-center space-x-4 sm:space-x-8">
              <a href="#about" className="text-white/60 hover:text-white transition text-sm sm:text-base">About</a>
              <a href="mailto:lxusbrain@gmail.com" className="text-white/60 hover:text-white transition text-sm sm:text-base hidden sm:block">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 sm:pt-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Tagline */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 md:mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <LxusBrainLogo size={16} />
              <span className="text-sm text-muted-foreground tracking-wide">
                AI-Powered Enterprise Solutions
              </span>
            </span>
          </motion.div>

          {/* Main heading with animated cycling words */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight -mb-1 sm:-mb-2">
              <AnimatedWords currentIndex={wordIndex} />
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">the Future </span>
              <AnimatedGradientText currentIndex={wordIndex}>
                with AI
              </AnimatedGradientText>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-16"
          >
            Empowering enterprises with intelligent software solutions that transform workflows and unlock new possibilities.
          </motion.p>

          {/* Magnetic Text for TermiVoxed */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <MagneticText
              text="Explore →"
              hoverText="TermiVoxed"
              onClick={() => navigate('/termivoxed')}
              className="cursor-pointer"
              textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              hoverTextClassName="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            />
          </motion.div>

          {/* Coming soon hint */}
          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 md:mt-16 flex items-center justify-center gap-2 text-muted-foreground/50"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">More products coming soon</span>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              About <span className="gradient-text">LxusBrain</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 md:mb-8">
              We're a technology company focused on building AI-powered software that helps businesses
              work smarter. Our solutions are designed to be self-hosted, giving enterprises full
              control over their data while leveraging cutting-edge artificial intelligence.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
              <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-foreground font-semibold mb-2 text-sm md:text-base">AI-First</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Every product is built with AI at its core</p>
              </div>
              <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <Cpu className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-foreground font-semibold mb-2 text-sm md:text-base">Self-Hosted</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Your data stays on your infrastructure</p>
              </div>
              <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/[0.05] sm:col-span-2 md:col-span-1">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-foreground font-semibold mb-2 text-sm md:text-base">Enterprise Ready</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Built for scale, security, and compliance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 border-t border-border/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <LxusBrainLogo size={20} className="sm:w-6 sm:h-6" />
              <span className="text-muted-foreground text-xs sm:text-sm">
                © {new Date().getFullYear()} LxusBrain Technologies
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <a href="/legal/terms" className="text-muted-foreground hover:text-foreground transition">
                Terms
              </a>
              <a href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition">
                Privacy
              </a>
              <a href="/legal/refund" className="text-muted-foreground hover:text-foreground transition">
                Refund Policy
              </a>
              <a href="/legal/shipping" className="text-muted-foreground hover:text-foreground transition">
                Shipping
              </a>
              <a href="mailto:lxusbrain@gmail.com" className="text-muted-foreground hover:text-foreground transition">
                Contact
              </a>
              <a href="/termivoxed" className="text-muted-foreground hover:text-foreground transition flex items-center gap-1">
                TermiVoxed <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </BeamsBackground>
  )
}
