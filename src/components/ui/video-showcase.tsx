import type React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { User, Mic, Globe } from "lucide-react"

interface ShowcaseVideo {
  id: string
  icon: React.ElementType
  title: string
  description: string
  /** 11-char YouTube video ID (e.g. the part after youtu.be/). Leave empty for placeholder. */
  youtubeId?: string
}

const showcaseVideos: ShowcaseVideo[] = [
  {
    id: 'sign-in',
    icon: User,
    title: 'Sign in and get started',
    description: 'Sign in with Google in seconds. TermiVoxed is powered by Firebase — Google sign-in works alongside email/password, both end-to-end.',
    youtubeId: 'CEkmeutE5Ss',
  },
  {
    id: 'first-voiceover',
    icon: Mic,
    title: 'Add a video, add a voice-over',
    description: 'Drop a video into your project. Drop voice-over segments onto the timeline at the exact moments you want them. Generate and preview in real time.',
    youtubeId: 'x6XJwuBpAKY',
  },
  {
    id: 'multi-lingual',
    icon: Globe,
    title: 'Multi-video, multi-lingual',
    description: 'Add multiple videos to one project. Voice each segment in a different regional language using Microsoft Edge TTS. The demo dubs the same segment in Tamil, then re-dubs it in Arabic.',
    youtubeId: 'b05GbFv8DSY',
  },
]

interface VideoShowcaseProps {
  className?: string
}

export function VideoShowcase({ className }: VideoShowcaseProps) {
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
    setActiveIndex((prev) => (prev + 1) % showcaseVideos.length)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + showcaseVideos.length) % showcaseVideos.length)
  }, [])

  // Manual navigation only — auto-advance would interrupt video playback.

  const current = showcaseVideos[activeIndex]
  const IconComponent = current.icon

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl mx-auto py-8 md:py-12"
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

        {/* Main content - asymmetric layout */}
        <div className="relative flex flex-col md:flex-row">
          {/* Left column - vertical text with progress (desktop only) */}
          <div className="hidden md:flex flex-col items-center justify-center pr-12 border-r border-border">
            <motion.span
              className="text-xs font-mono text-muted-foreground tracking-widest uppercase"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              See It In Action
            </motion.span>

            {/* Vertical progress line */}
            <div className="relative h-32 w-px bg-border mt-8">
              <motion.div
                className="absolute top-0 left-0 w-full bg-cyan-500 origin-top"
                animate={{
                  height: `${((activeIndex + 1) / showcaseVideos.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex flex-col gap-2 mt-6">
              {showcaseVideos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-cyan-500 scale-125'
                      : index < activeIndex
                      ? 'bg-cyan-500/50'
                      : 'bg-border hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Center - main content */}
          <div className="flex-1 pl-4 md:pl-12 py-6">
            {/* Video badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="mb-4"
              >
                <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded-full px-3 py-1.5">
                  <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                  Walkthrough {activeIndex + 1} of {showcaseVideos.length}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Title with word reveal */}
            <div className="relative mb-4 min-h-[50px] md:min-h-[60px]">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={`${activeIndex}-title`}
                  className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {current.title.split(" ").map((word, i) => (
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
                            delay: i * 0.06,
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

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`${activeIndex}-desc`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-muted-foreground text-sm md:text-base mb-6 max-w-lg leading-relaxed"
              >
                {current.description}
              </motion.p>
            </AnimatePresence>

            {/* Inline YouTube embed (one iframe at a time — only the active walkthrough loads) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIndex}-video`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="relative aspect-video max-w-lg rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 mb-6"
              >
                {current.youtubeId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0`}
                    title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/60 text-sm">Walkthrough coming soon</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom row - video indicator and navigation */}
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIndex}-indicator`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  {/* Animated line */}
                  <motion.div
                    className="w-8 h-px bg-cyan-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{ originX: 0 }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {activeIndex + 1} of {showcaseVideos.length}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={goPrev}
                  className="group relative w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-cyan-500/50 transition-colors"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Previous video"
                >
                  <motion.div
                    className="absolute inset-0 bg-cyan-500/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-muted-foreground group-hover:text-cyan-400 transition-colors"
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
                  className="group relative w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-cyan-500/50 transition-colors"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Next video"
                >
                  <motion.div
                    className="absolute inset-0 bg-cyan-500/10"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-muted-foreground group-hover:text-cyan-400 transition-colors"
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

        {/* Mobile step indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {showcaseVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-cyan-500 w-6'
                  : index < activeIndex
                  ? 'bg-cyan-500/50'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
