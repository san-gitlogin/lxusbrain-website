import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Globe,
  Sparkles,
  Video,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  X
} from 'lucide-react'
import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'
import { BeamsBackground } from '@/components/ui/beams-background'

// Demo features with descriptions
const demoFeatures = [
  {
    id: 'voices',
    title: 'AI Voice Generation',
    description: 'Choose from 320+ natural AI voices in 75+ languages. From professional narrators to casual speakers.',
    icon: Mic,
    color: 'from-cyan-500 to-blue-600',
    highlights: [
      'Male, female, and neutral voices',
      'Multiple accents per language',
      'Adjustable speed and pitch',
      'Natural emotion expression'
    ]
  },
  {
    id: 'dubbing',
    title: 'Multi-Language Dubbing',
    description: 'Automatically dub your videos into any language while preserving the original tone and style.',
    icon: Globe,
    color: 'from-violet-500 to-purple-600',
    highlights: [
      'One-click language translation',
      'Lip-sync optimization',
      'Preserve original audio mix',
      'Batch processing support'
    ]
  },
  {
    id: 'subtitles',
    title: 'Smart Subtitles',
    description: 'Auto-generate, style, and animate subtitles with 1000+ Google Fonts integration.',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    highlights: [
      'Auto-transcription from audio',
      'Word-level timing accuracy',
      'Custom animations & effects',
      'SRT/VTT/ASS export'
    ]
  },
  {
    id: 'export',
    title: 'Video Processing',
    description: 'Combine multiple videos, add BGM, apply effects, and export in various quality presets.',
    icon: Video,
    color: 'from-emerald-500 to-teal-600',
    highlights: [
      'Multi-video timeline',
      'Background music mixing',
      'Watermark & branding',
      '4K export support'
    ]
  }
]

// Sample workflow steps
const workflowSteps = [
  {
    step: 1,
    title: 'Import Video',
    description: 'Drop your video file or paste a YouTube URL'
  },
  {
    step: 2,
    title: 'Generate Subtitles',
    description: 'AI transcribes and segments your audio'
  },
  {
    step: 3,
    title: 'Choose Voice',
    description: 'Select from 320+ voices in 75+ languages'
  },
  {
    step: 4,
    title: 'Style & Preview',
    description: 'Customize subtitle appearance and voice settings'
  },
  {
    step: 5,
    title: 'Export',
    description: 'Render your dubbed video in HD quality'
  }
]

export function DemoPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const currentFeature = demoFeatures[activeFeature]
  const FeatureIcon = currentFeature.icon

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
    })
  }

  return (
    <BeamsBackground intensity="medium" className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <LxusBrainLogo size={28} />
                <LxusBrainTitle height={20} className="hidden sm:block" />
              </Link>
              <div className="h-5 sm:h-6 w-px bg-border" />
              <Link to="/termivoxed" className="flex items-center">
                <TermiVoxedLogo width={45} className="sm:w-[55px]" />
              </Link>
            </div>
            <Link
              to="/termivoxed"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to TermiVoxed</span>
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
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Play className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm">Interactive Demo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Experience <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">TermiVoxed</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our AI-powered voice-over and dubbing capabilities. See how easy it is to transform your video content.
            </p>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Feature Preview */}
              <div className="relative">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 overflow-hidden">
                  {/* Simulated Video Preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-8 rounded-3xl bg-gradient-to-br ${currentFeature.color} opacity-20 blur-3xl absolute`} />
                    <div className="relative text-center">
                      <motion.div
                        key={activeFeature}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`inline-block p-6 rounded-2xl bg-gradient-to-br ${currentFeature.color} mb-4`}
                      >
                        <FeatureIcon className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{currentFeature.title}</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">{currentFeature.description}</p>
                    </div>
                  </div>

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                    <span className="text-xs text-white/60">Demo Preview</span>
                  </div>
                </div>

                {/* Feature Navigation */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setActiveFeature(prev => (prev === 0 ? demoFeatures.length - 1 : prev - 1))}
                    className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="flex gap-2">
                    {demoFeatures.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeFeature ? 'bg-cyan-400' : 'bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveFeature(prev => (prev === demoFeatures.length - 1 ? 0 : prev + 1))}
                    className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Feature Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-4">Key Capabilities</h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {currentFeature.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                      >
                        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${currentFeature.color}`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-foreground">{highlight}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Feature Buttons */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {demoFeatures.map((feature, index) => (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        index === activeFeature
                          ? `bg-gradient-to-r ${feature.color} text-white`
                          : 'bg-white/[0.05] text-muted-foreground hover:text-foreground hover:bg-white/[0.08]'
                      }`}
                    >
                      {feature.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workflow Section */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Simple <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">5-Step</span> Workflow
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative"
                >
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center h-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                    <h4 className="font-medium text-foreground text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 text-muted-foreground/30" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Transform Your Videos?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Start with a free trial - 5 video exports included. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/termivoxed/try"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all"
              >
                Try Editor Demo
              </Link>
              <Link
                to="/termivoxed/try"
                className="px-8 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] text-foreground transition-all"
              >
                Download App
              </Link>
            </div>
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
            <a href="mailto:lxusbrain@gmail.com" className="text-muted-foreground hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </BeamsBackground>
  )
}
