import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Mic, Globe, Sparkles, Video, Zap, Shield, Check, Play } from "lucide-react"
import { VideoModal } from "@/components/ui/video-player"

interface Feature {
  icon: React.ElementType
  title: string
  description: string
  highlights: string[]
  previewImage: string
  videoUrl?: string
}

const features: Feature[] = [
  {
    icon: Mic,
    title: 'AI Voice Generation',
    description: 'Access 320+ natural-sounding AI voices powered by cutting-edge Edge-TTS technology. Adjust pitch, speed, and volume with real-time preview.',
    highlights: ['320+ natural voices', '75+ languages', 'Real-time preview', 'Pitch & speed control'],
    previewImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
  },
  {
    icon: Globe,
    title: 'Multi-Language Dubbing',
    description: 'Instantly dub your videos into any language with authentic accents and natural pronunciation. Perfect for reaching global audiences.',
    highlights: ['75+ languages', 'Authentic accents', 'Natural pronunciation', 'Instant dubbing'],
    previewImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
  },
  {
    icon: Sparkles,
    title: 'Smart Subtitles',
    description: 'Auto-generate word-timed subtitles with advanced styling. Choose from 1000+ Google Fonts and apply professional animation effects.',
    highlights: ['Auto word-timing', '1000+ Google Fonts', 'Animation effects', 'Custom styling'],
    previewImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
  },
  {
    icon: Video,
    title: 'Video Processing',
    description: 'Handle multi-video projects with ease. Mix background music, stack segments, and export in quality presets up to 4K resolution.',
    highlights: ['Multi-video projects', 'BGM mixing', 'Segment stacking', 'Up to 4K export'],
    previewImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
  },
  {
    icon: Zap,
    title: 'Voice Cloning',
    description: 'Clone any voice with just 6 seconds of audio. Create personalized content that sounds exactly like you—or anyone you choose.',
    highlights: ['6-second samples', 'Perfect replication', 'Unlimited content', 'Your voice, no recording'],
    previewImage: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: '100% local processing. Your videos never leave your computer. AES-256 encryption, JWT authentication, and full GDPR/DPDP compliance.',
    highlights: ['100% local processing', 'AES-256 encryption', 'GDPR compliant', 'Your data stays yours'],
    previewImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    videoUrl: '',
  },
]

interface FeatureShowcaseProps {
  className?: string
}

export function FeatureShowcase({ className }: FeatureShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse position for magnetic effect on number
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

  const handlePreviewClick = () => {
    const current = features[activeIndex]
    if (current.videoUrl) {
      setPlayingVideo(current.videoUrl)
    }
  }

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % features.length)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length)
  }, [])

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused || playingVideo) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused, playingVideo])

  const current = features[activeIndex]
  const IconComponent = current.icon

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl mx-auto py-8 md:py-12"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Oversized index number - background */}
        <motion.div
          className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 text-[10rem] md:text-[14rem] font-bold text-foreground/[0.03] select-none pointer-events-none leading-none tracking-tighter z-0"
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
                Capabilities
              </motion.span>

              {/* Vertical progress line */}
              <div className="relative h-32 w-px bg-border mt-8">
                <motion.div
                  className="absolute top-0 left-0 w-full bg-cyan-500 origin-top"
                  animate={{
                    height: `${((activeIndex + 1) / features.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {/* Step indicators */}
              <div className="flex flex-col gap-2 mt-6">
                {features.map((_, index) => (
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

            {/* Content area */}
            <div className="flex-1 pl-4 md:pl-10 lg:pl-12 py-2">
              {/* Feature icon badge */}
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
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-cyan-400" />
                    </div>
                    Feature {activeIndex + 1} of {features.length}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Title with word reveal */}
              <div className="relative mb-4 min-h-[50px] md:min-h-[70px]">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={`${activeIndex}-title`}
                    className="text-2xl md:text-4xl font-bold text-foreground leading-tight tracking-tight"
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
                              delay: i * 0.08,
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
                  className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed"
                >
                  {current.description}
                </motion.p>
              </AnimatePresence>

              {/* Feature highlights */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIndex}-highlights`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8"
                >
                  {current.highlights.map((highlight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      <span className="text-sm text-foreground">{highlight}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Navigation row */}
              <div className="flex items-center justify-between mt-2">
                {/* Progress indicator */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-px bg-cyan-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    style={{ originX: 0 }}
                  />
                  <span className="text-sm font-mono text-muted-foreground">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={goPrev}
                    className="group relative w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-cyan-500/50 transition-colors"
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous feature"
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
                    aria-label="Next feature"
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

          {/* Right side - Preview Panel */}
          <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0">
            <motion.div
              className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl cursor-pointer group"
              onClick={handlePreviewClick}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Images with crossfade */}
              {features.map((feature, index) => (
                <motion.img
                  key={feature.title}
                  src={feature.previewImage}
                  alt={feature.title}
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

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                <motion.div
                  className="w-16 h-16 rounded-full bg-cyan-500/90 flex items-center justify-center backdrop-blur-sm shadow-lg"
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: 1
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 }
                  }}
                >
                  <Play className="w-7 h-7 text-white ml-1" />
                </motion.div>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Feature info overlay */}
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
                      <div className="w-6 h-6 rounded-md bg-cyan-500/30 flex items-center justify-center">
                        <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">{current.title}</span>
                    </div>
                    <p className="text-white/50 text-xs">Click to watch demo video</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>

              {/* Feature number badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/70 text-xs font-mono">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>

            {/* Mini feature selector below preview */}
            <div className="flex justify-center gap-2.5 mt-5">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === activeIndex
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30 scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-90 hover:border-white/30'
                  }`}
                >
                  <img
                    src={feature.previewImage}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-cyan-500/10" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile step indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {features.map((_, index) => (
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

        {/* Bottom ticker - subtle repeating feature names */}
        <div className="absolute -bottom-8 left-0 right-0 overflow-hidden opacity-[0.04] pointer-events-none hidden md:block">
          <motion.div
            className="flex whitespace-nowrap text-3xl font-bold tracking-tight"
            animate={{ x: [0, -1200] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(5)].map((_, i) => (
              <span key={i} className="mx-8">
                {features.map((f) => f.title).join(" • ")} •
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        src={playingVideo || ""}
        poster={current.previewImage}
        title={`${current.title} - Demo`}
      />
    </div>
  )
}
