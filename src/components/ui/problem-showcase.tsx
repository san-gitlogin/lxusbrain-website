import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Presentation, Mic, Video, Sparkles, Users, BookOpen, Megaphone } from "lucide-react"

interface ProblemScenario {
  icon: React.ElementType
  badge: string
  headline: string
  problem: string
  solution: string
  audience: string
  previewImage: string
}

const problemScenarios: ProblemScenario[] = [
  {
    icon: Presentation,
    badge: "Enterprise Demo",
    headline: "Demo tomorrow. Stakeholders visiting. No time for voice-over.",
    problem: "You've recorded the perfect screen demo, but it's silent. Hiring a voice artist? Days. Recording yourself? Awkward pauses, retakes, background noise.",
    solution: "Upload. Write script. Generate professional voice-over in minutes. Your demo sounds like a Netflix documentary.",
    audience: "Enterprise Teams",
    previewImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80"
  },
  {
    icon: BookOpen,
    badge: "Course Creation",
    headline: "Great at teaching. Not so great at speaking on camera.",
    problem: "You know your subject inside out, but recording yourself is painful. Vocabulary slips, 'umms' everywhere, accent concerns, endless retakes.",
    solution: "Focus on your content. Let AI handle the voice. Choose from 320+ natural voices. Your knowledge, professional delivery.",
    audience: "Course Creators",
    previewImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    icon: Megaphone,
    badge: "Small Business",
    headline: "Need a professional ad. Budget says otherwise.",
    problem: "Video ads with voice-overs cost thousands. Agencies charge per minute. Web tools want monthly subscriptions. Your video sits unfinished.",
    solution: "One-time affordable license. Unlimited exports. Create ads that sound like big-budget productions. Your data never leaves your computer.",
    audience: "Small Business Owners",
    previewImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80"
  },
  {
    icon: Video,
    badge: "Content Creation",
    headline: "Why are you still making PowerPoints?",
    problem: "Static slides in 2025? Your competitors are posting cinematic videos with professional narration. You're clicking through bullet points.",
    solution: "Transform any screen recording into a polished video. AI-generated scripts. Word-timed subtitles. This is the modern era of presentations.",
    audience: "Content Creators",
    previewImage: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&auto=format&fit=crop&q=80"
  },
  {
    icon: Mic,
    badge: "Voice Cloning",
    headline: "Your voice. Without you speaking.",
    problem: "You want consistency across all videos. But recording takes time. Background noise. Energy levels vary. Same script, different takes.",
    solution: "Clone your voice with 6 seconds of audio. Generate unlimited voice-overs that sound exactly like you. Your voice, zero recording time.",
    audience: "Personal Branding",
    previewImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80"
  },
  {
    icon: Users,
    badge: "Team Collaboration",
    headline: "Marketing needs videos. IT needs security. Both need it yesterday.",
    problem: "Cloud tools mean data leaves your network. Compliance teams panic. Marketing waits. Videos don't get made.",
    solution: "100% local processing. Videos never leave your infrastructure. Enterprise-grade security. Marketing ships. IT sleeps.",
    audience: "Enterprise Security",
    previewImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80"
  },
]

interface ProblemShowcaseProps {
  className?: string
}

export function ProblemShowcase({ className }: ProblemShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse position for magnetic effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Transform for parallax on the large number
  const numberX = useTransform(x, [-200, 200], [-15, 15])
  const numberY = useTransform(y, [-200, 200], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    }
  }

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % problemScenarios.length)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + problemScenarios.length) % problemScenarios.length)
  }, [])

  // Auto-advance every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % problemScenarios.length)
    }, 8000)

    return () => clearInterval(timer)
  }, [])

  const current = problemScenarios[activeIndex]
  const IconComponent = current.icon

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl mx-auto py-8 md:py-12"
        onMouseMove={handleMouseMove}
      >
        {/* Oversized index number - background */}
        <motion.div
          className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 text-[10rem] md:text-[16rem] font-bold text-foreground/[0.03] select-none pointer-events-none leading-none tracking-tighter"
          style={{ x: numberX, y: numberY }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Main content - two column layout */}
        <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - content */}
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Vertical progress bar (desktop only) */}
            <div className="hidden md:flex flex-col items-center justify-start pt-8 pr-8 lg:pr-12 border-r border-border self-stretch">
              <motion.span
                className="text-xs font-mono text-muted-foreground tracking-widest uppercase"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                The Struggle
              </motion.span>

              {/* Vertical progress line */}
              <div className="relative h-32 w-px bg-border mt-8">
                <motion.div
                  className="absolute top-0 left-0 w-full bg-amber-500 origin-top"
                  animate={{
                    height: `${((activeIndex + 1) / problemScenarios.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {/* Step indicators */}
              <div className="flex flex-col gap-2 mt-6">
                {problemScenarios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'bg-amber-500 scale-125'
                        : index < activeIndex
                        ? 'bg-amber-500/50'
                        : 'bg-border hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 pl-4 md:pl-10 lg:pl-12 py-2">
            {/* Audience badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-3 text-xs font-mono text-muted-foreground border border-border rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-amber-400" />
                  </div>
                  Scenario {activeIndex + 1} of {problemScenarios.length}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Headline with word reveal */}
            <div className="relative mb-6 min-h-[80px] md:min-h-[100px]">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={`${activeIndex}-headline`}
                  className="text-2xl md:text-4xl font-bold text-foreground leading-tight tracking-tight"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {current.headline.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mr-[0.3em]"
                      variants={{
                        hidden: { opacity: 0, y: 20, rotateX: 90 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          transition: {
                            duration: 0.5,
                            delay: i * 0.04,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                        exit: {
                          opacity: 0,
                          y: -10,
                          transition: { duration: 0.2, delay: i * 0.02 },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Problem description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`${activeIndex}-problem`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-muted-foreground text-sm md:text-base mb-6 max-w-xl leading-relaxed"
              >
                {current.problem}
              </motion.p>
            </AnimatePresence>

            {/* Solution - highlighted */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIndex}-solution`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="relative mb-8"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-foreground text-sm md:text-base font-medium leading-relaxed max-w-xl">
                    {current.solution}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom row - audience indicator and navigation */}
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIndex}-audience`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  {/* Animated line before text */}
                  <motion.div
                    className="w-10 h-px bg-amber-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{ originX: 0 }}
                  />
                  <span className="text-sm font-mono text-muted-foreground">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(problemScenarios.length).padStart(2, "0")}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={goPrev}
                  className="group relative w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-amber-500/50 transition-colors"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Previous scenario"
                >
                  <motion.div
                    className="absolute inset-0 bg-amber-500/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-muted-foreground group-hover:text-amber-400 transition-colors"
                  >
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={goNext}
                  className="group relative w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-amber-500/50 transition-colors"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Next scenario"
                >
                  <motion.div
                    className="absolute inset-0 bg-amber-500/10"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-muted-foreground group-hover:text-amber-400 transition-colors"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
            </div>
          </div>

          {/* Right side - Preview Panel */}
          <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0">
            <motion.div
              className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Images with crossfade */}
              {problemScenarios.map((scenario, index) => (
                <motion.img
                  key={scenario.badge}
                  src={scenario.previewImage}
                  alt={scenario.badge}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={false}
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 1.1,
                    filter: activeIndex === index ? "blur(0px)" : "blur(10px)",
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Scenario info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-amber-500/30 flex items-center justify-center">
                        <IconComponent className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">{current.badge}</span>
                    </div>
                    <p className="text-white/50 text-xs">{current.audience}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>

              {/* Scenario number badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/70 text-xs font-mono">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>

            {/* Mini scenario selector below preview */}
            <div className="flex justify-center gap-2.5 mt-5">
              {problemScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === activeIndex
                      ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-90 hover:border-white/30'
                  }`}
                >
                  <img
                    src={scenario.previewImage}
                    alt={scenario.badge}
                    className="w-full h-full object-cover"
                  />
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-amber-500/10" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile step indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {problemScenarios.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-amber-500 w-6'
                  : index < activeIndex
                  ? 'bg-amber-500/50'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Bottom ticker - subtle repeating audience types */}
        <div className="absolute -bottom-12 left-0 right-0 overflow-hidden opacity-[0.04] pointer-events-none hidden md:block">
          <motion.div
            className="flex whitespace-nowrap text-4xl font-bold tracking-tight"
            animate={{ x: [0, -1500] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="mx-8">
                {problemScenarios.map((s) => s.audience).join(" • ")} •
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
