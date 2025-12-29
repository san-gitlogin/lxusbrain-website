"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"

interface InstallationStep {
  step: number
  title: string
  description: string
}

interface InstallationStepsProps {
  platform: 'windows' | 'mac'
}

const installationSteps: Record<'windows' | 'mac', InstallationStep[]> = {
  windows: [
    { step: 1, title: 'Download', description: 'Click the download button to get the TermiVoxed installer (.exe file) for Windows.' },
    { step: 2, title: 'Run Installer', description: 'Double-click the downloaded file to start the installation wizard.' },
    { step: 3, title: 'Follow Prompts', description: 'Accept the license agreement and choose your preferred installation location.' },
    { step: 4, title: 'Launch App', description: 'Open TermiVoxed from your Start menu or desktop shortcut and start creating!' },
  ],
  mac: [
    { step: 1, title: 'Download', description: 'Click the download button to get the TermiVoxed disk image (.dmg file) for macOS.' },
    { step: 2, title: 'Open DMG', description: 'Double-click the downloaded file to mount the disk image.' },
    { step: 3, title: 'Drag to Apps', description: 'Drag the TermiVoxed icon to your Applications folder to install.' },
    { step: 4, title: 'Launch App', description: 'Open TermiVoxed from Applications or Spotlight and start creating!' },
  ],
}

export function InstallationSteps({ platform }: InstallationStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const steps = installationSteps[platform]

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

  const goNext = () => setActiveIndex((prev) => (prev + 1) % steps.length)
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + steps.length) % steps.length)

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 5000)
    return () => clearInterval(timer)
  }, [platform])

  // Reset to first step when platform changes
  useEffect(() => {
    setActiveIndex(0)
  }, [platform])

  const current = steps[activeIndex]

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto py-8"
      onMouseMove={handleMouseMove}
    >
      {/* Oversized step number - background */}
      <motion.div
        className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 text-[12rem] md:text-[16rem] font-bold text-foreground/[0.03] select-none pointer-events-none leading-none tracking-tighter"
        style={{ x: numberX, y: numberY }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={`${platform}-${activeIndex}`}
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
      <div className="relative flex">
        {/* Left column - vertical text with progress */}
        <div className="hidden md:flex flex-col items-center justify-center pr-12 border-r border-border">
          <motion.span
            className="text-xs font-mono text-muted-foreground tracking-widest uppercase"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Installation
          </motion.span>

          {/* Vertical progress line */}
          <div className="relative h-24 w-px bg-border mt-6">
            <motion.div
              className="absolute top-0 left-0 w-full bg-cyan-500 origin-top"
              animate={{
                height: `${((activeIndex + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex flex-col gap-2 mt-6">
            {steps.map((_, index) => (
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
          {/* Platform badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={platform}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded-full px-3 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${platform === 'windows' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                {platform === 'windows' ? 'Windows' : 'macOS'}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Step title with word reveal */}
          <div className="relative mb-4 min-h-[60px]">
            <AnimatePresence mode="wait">
              <motion.h3
                key={`${platform}-${activeIndex}-title`}
                className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight"
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
              key={`${platform}-${activeIndex}-desc`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-muted-foreground text-base md:text-lg mb-8 max-w-lg"
            >
              {current.description}
            </motion.p>
          </AnimatePresence>

          {/* Bottom row - step indicator and navigation */}
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${platform}-${activeIndex}-step`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-3"
              >
                {/* Animated line before step */}
                <motion.div
                  className="w-8 h-px bg-cyan-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{ originX: 0 }}
                />
                <span className="text-sm font-medium text-foreground">
                  Step {current.step} of {steps.length}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={goPrev}
                className="group relative w-10 h-10 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-cyan-500/50 transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label="Previous step"
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
                aria-label="Next step"
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
        {steps.map((_, index) => (
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
  )
}
