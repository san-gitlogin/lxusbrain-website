import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Check,
  Menu,
  X,
  ArrowRight,
  Play,
  Github,
  Download,
  MousePointer2,
  Keyboard,
  KeyRound,
  Command,
  Music2,
  Gamepad2,
  Lock,
  Laptop,
  Bot,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Box,
  Usb,
  Cpu,
} from 'lucide-react'

// Components
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { LetsTalk } from '@/components/ui/lets-work-section'
import { MovingBorderButton } from '@/components/ui/moving-border'
import { Button } from '@/components/ui/button'

// Logos
import { LxusBrainLogo, LxusBrainTitle, HidFiLogo } from '@/components/logos'

// Images (real dashboard screenshots and renders of the real case)
import productImg from '@/assets/images/hidfi/product.webp'
import explodedImg from '@/assets/images/hidfi/exploded.webp'
import trackpadImg from '@/assets/images/hidfi/trackpad.webp'
import keyboardImg from '@/assets/images/hidfi/keyboard.webp'
import mediaImg from '@/assets/images/hidfi/media.webp'
import gamepadImg from '@/assets/images/hidfi/gamepad.webp'
import shortcutsImg from '@/assets/images/hidfi/shortcuts.webp'
import screenTabletImg from '@/assets/images/hidfi/screen-tablet.webp'

const REPO = 'https://github.com/san-gitlogin/HID-Fi'
const QUICK_START = `${REPO}#quick-start`
const CORE_GUIDE = 'https://san-gitlogin.github.io/HID-Fi/hardware/hid-fi-core/'
const KIT_ALL = `${REPO}/raw/main/hardware/hid-fi-core/print/kit-all.stl`
const COMPANION_DOCS = `${REPO}/blob/main/docs/COMPANION.md`
const BOARD_LINK = 'https://amzn.in/d/0b1t9Zab'

const videos = [
  {
    youtubeId: '8RiCR_qBxCI',
    title: 'HID-Fi in two minutes',
    description: 'The board in its printed case, the trackpad and keyboard on a phone, joining your home Wi-Fi, seeing the screen and updating over the air.',
    length: '2:13',
  },
  {
    youtubeId: 'HUG3y0nIfkw',
    title: 'Build it, from a blank board',
    description: 'The two USB-C ports, installing the tools on Windows and macOS, flashing with one command, and a tour of the dashboard.',
    length: '9:39',
  },
]

const features = [
  { icon: MousePointer2, title: 'Trackpad', text: 'One finger moves, tap clicks, two fingers scroll and pinch, three swipe desktops. Speed, acceleration and momentum are yours to set.' },
  { icon: Keyboard, title: 'Keyboard', text: 'Real press and release, so you can hold Ctrl and strike another key. A phone gets letters and symbols; a wide screen gets all 104 keys.' },
  { icon: KeyRound, title: 'Password vault', text: 'Stores the passwords and PINs you keep typing and types them for you, behind a PIN asked for every time.' },
  { icon: Command, title: '190 shortcuts', text: 'For macOS, Windows and Linux, each taken from the vendor\'s own shortcut page, searchable and filtered to your OS.' },
  { icon: Music2, title: 'Media', text: 'Volume knobs you turn with a finger, playback keys, brightness, and quick actions for mic mute and calls.' },
  { icon: Gamepad2, title: 'Gamepad', text: 'An optional second USB device: two sticks, a D-pad and twelve buttons.' },
  { icon: Lock, title: 'Unlock and lock', text: 'Types a locked PC\'s password, locks it again, sleeps and wakes it, and keeps it awake with a net-zero jiggle.' },
  { icon: Laptop, title: 'Knows the computer', text: 'Tells a Mac from a PC by how the computer reads its USB descriptors, typing nothing, and switches shortcuts to match.' },
  { icon: Bot, title: 'For AI agents', text: 'Say "do copy" or "open Calculator" and the board presses the right keys. About 80 actions and an MCP server.' },
]

const screens = [
  { src: trackpadImg, label: 'Trackpad' },
  { src: keyboardImg, label: 'Keyboard' },
  { src: shortcutsImg, label: 'Shortcuts' },
  { src: mediaImg, label: 'Media' },
  { src: gamepadImg, label: 'Gamepad' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
}

function SectionBadge({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'amber' }) {
  const cls = tone === 'amber'
    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
  return <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm mb-4 ${cls}`}>{children}</span>
}

function PhoneFrame({ src, label }: { src: string; label: string }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-[200px] rounded-[2rem] bg-gradient-to-b from-gray-700 to-gray-900 p-[6px] shadow-2xl shadow-cyan-500/10 border border-white/10">
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-12 h-[5px] rounded-full bg-black/70 z-10" />
        <img src={src} alt={`The HID-Fi dashboard: ${label}`} loading="lazy" className="block w-full rounded-[1.6rem]" width={480} height={1039} />
      </div>
      <figcaption className="text-sm text-muted-foreground">{label}</figcaption>
    </figure>
  )
}

export function HidFiPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = 'HID-Fi - Control your computer from your phone | LxusBrain'
    return () => { document.title = previous }
  }, [])

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#screen', label: 'Screen' },
    { href: '#case', label: 'Case' },
    { href: '#start', label: 'Get started' },
  ]

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
              <Link to="/hid-fi" className="flex items-center">
                <HidFiLogo size={28} wordmark />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition">{l.label}</a>
              ))}
              <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm inline-flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-muted-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
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
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setIsMenuOpen(false)} className="block text-muted-foreground hover:text-foreground">{l.label}</a>
              ))}
              <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <HeroGeometric
        badge="Wi-Fi keyboard and mouse"
        title1="Control your computer"
        title2="from your phone"
        description="A small ESP32-S3 board plugs into the computer over USB and becomes its keyboard and mouse. Open its dashboard on your phone and you are driving the computer. No drivers, no app, no admin rights."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <MovingBorderButton
            borderRadius="1.75rem"
            containerClassName="h-12"
            className="bg-slate-900/[0.8] px-6"
            onClick={() => document.getElementById('film')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Play className="w-4 h-4 mr-2" />
            Watch the film
          </MovingBorderButton>
          <Button variant="outline" size="lg" className="rounded-full" onClick={() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })}>
            Get started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </HeroGeometric>

      {/* Why: works where software cannot */}
      <section id="why" className="py-12 md:py-16 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="section-card max-w-5xl mx-auto overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 p-4">
                <SectionBadge tone="amber">Why hardware</SectionBadge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Works where software <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">cannot</span>
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  To the computer, HID-Fi is a plain USB keyboard and mouse. Nothing is installed on it, so it works on machines you have no rights to install anything on.
                </p>
                <ul className="space-y-3">
                  {['On the lock screen', 'In the BIOS', 'On locked-down work machines', 'On macOS, Windows and Linux'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-3xl blur-2xl" />
                  <img src={productImg} alt="The HID-Fi board in its 3D-printed case, two USB-C ports at the front" className="relative rounded-2xl border border-white/10 w-full max-w-md" width={1200} height={735} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Film */}
      <section id="film" className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
            <SectionBadge>See it in action</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Watch <span className="gradient-text">HID-Fi</span> work
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A two-minute tour, and the full build from a blank board.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((v) => (
              <motion.div key={v.youtubeId} {...fadeUp}>
                <div className="relative">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl -z-10 opacity-50" />
                </div>
                <div className="mt-5">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    {v.title} <span className="text-sm font-normal text-muted-foreground ml-2">{v.length}</span>
                  </h3>
                  <p className="text-muted-foreground">{v.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 md:py-16 px-4 bg-gradient-to-b from-background/50 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
            <SectionBadge>What it does</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              One board, every <span className="gradient-text">input</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you set up is stored on the board, so every phone that opens the dashboard sees the same setup.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                viewport={{ once: true }}
                className="section-card"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard screens */}
      <section id="dashboard" className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
            <SectionBadge>The dashboard</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Any touchscreen, <span className="gradient-text">any browser</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The board serves its own dashboard over Wi-Fi. Open it on a phone or tablet; nothing to install there either.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {screens.map((s) => <PhoneFrame key={s.label} src={s.src} label={s.label} />)}
          </motion.div>
        </div>
      </section>

      {/* Screen sharing + updates */}
      <section id="screen" className="py-12 md:py-16 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div {...fadeUp}>
            <SectionBadge>Optional: HID-Fi Companion</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              See the computer's <span className="gradient-text">screen</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Install the free Companion app on the computer (macOS, Windows or Linux) and its screen shows live on the dashboard, beside the trackpad.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Straight to you over your home Wi-Fi, encrypted (WebRTC)',
                'Only the computer the board is plugged into, paired once with a code',
                'Every monitor at once, or one each',
                'Up to six viewers: phone, tablet, a TV\'s browser',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground/80">
                  <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <a href={COMPANION_DOCS} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2">
              <MonitorSmartphone className="w-4 h-4" />
              About the Companion
            </a>
          </motion.div>
          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl -z-10 opacity-60" />
            <img src={screenTabletImg} alt="The Screen tab on a tablet: the computer's screen beside the trackpad" loading="lazy" className="rounded-2xl border border-white/10 shadow-2xl w-full" width={1200} height={834} />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-4 md:gap-6 mt-12">
          <motion.div {...fadeUp} className="section-card flex gap-4">
            <RefreshCw className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-foreground font-semibold mb-1">Updates over the air</h3>
              <p className="text-muted-foreground text-sm">Settings, then Updates: see what changed and tap Update now. If a new version does not start properly, the board goes back to the one it had.</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="section-card flex gap-4">
            <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-foreground font-semibold mb-1">Yours to own</h3>
              <p className="text-muted-foreground text-sm">A PIN guards the dashboard, a separate one can guard the vault, and a forgotten password is recovered over USB only, never over Wi-Fi.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The printed case */}
      <section id="case" className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="section-card max-w-5xl mx-auto overflow-hidden">
            <div className="flex flex-col-reverse lg:flex-row gap-8 items-center">
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 to-blue-600/25 rounded-3xl blur-2xl" />
                  <img src={explodedImg} alt="The HID-Fi Core case taken apart: the shell, the board and the clip-in base" loading="lazy" className="relative rounded-2xl border border-white/10 w-full max-w-xs" width={840} height={1000} />
                </div>
              </div>
              <div className="flex-1 p-4">
                <SectionBadge>HID-Fi Core</SectionBadge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">A case you can 3D-print</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  A 9 mm shell for the board: three printed parts, no screws, no glue, about 10.6 g of PETG. One file puts every part on one bed.
                </p>
                <ul className="space-y-3 mb-6">
                  {['Interactive 3D model and build guide', 'Fit check and peg gauge before the full print', 'Print settings for your printer or a print shop'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={CORE_GUIDE} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center justify-center gap-2">
                    <Box className="w-4 h-4" />
                    Open the build guide
                  </a>
                  <a href={KIT_ALL} className="btn-secondary inline-flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    kit-all.stl
                  </a>
                </div>
                <p className="text-muted-foreground/70 text-sm mt-4">
                  The first 3D-printed set is on its way and has not yet been test-fitted on a real board. Personal, noncommercial use only.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Get started */}
      <section id="start" className="py-12 md:py-16 px-4 bg-gradient-to-b from-background/50 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
            <SectionBadge>Get started</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              What you <span className="gradient-text">need</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built and tested on one board, the YD-ESP32-S3 N16R8. Flashing is one command; the quick start walks you through it on Windows, macOS and Linux.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="section-card">
              <Cpu className="w-7 h-7 text-cyan-400 mb-3" />
              <h3 className="text-foreground font-semibold mb-2">An ESP32-S3 N16R8 board</h3>
              <p className="text-muted-foreground text-sm mb-3">With two USB-C ports: 16 MB flash, 8 MB PSRAM. Other chips are not supported.</p>
              <a href={BOARD_LINK} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm inline-flex items-center gap-1">
                The board the author uses <ArrowRight className="w-3 h-3" />
              </a>
            </motion.div>
            <motion.div {...fadeUp} className="section-card">
              <Usb className="w-7 h-7 text-cyan-400 mb-3" />
              <h3 className="text-foreground font-semibold mb-2">Two USB-C data cables</h3>
              <p className="text-muted-foreground text-sm">Both must carry data. A charge-only cable is the most common reason nothing works.</p>
            </motion.div>
            <motion.div {...fadeUp} className="section-card">
              <Laptop className="w-7 h-7 text-cyan-400 mb-3" />
              <h3 className="text-foreground font-semibold mb-2">A computer to flash from</h3>
              <p className="text-muted-foreground text-sm">With arduino-cli. The flasher finds the board, builds and verifies in one command.</p>
            </motion.div>
          </div>
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a href={QUICK_START} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center justify-center gap-2">
              <Github className="w-4 h-4" />
              Quick start on GitHub
            </a>
            <a href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Releases
            </a>
          </motion.div>
        </div>
      </section>

      {/* License */}
      <section id="license" className="py-10 md:py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="section-card text-center">
            <SectionBadge>License</SectionBadge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Free for personal use</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              HID-Fi and the HID-Fi Core case are licensed under
              <a href="https://polyformproject.org/licenses/noncommercial/1.0.0" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300"> PolyForm Noncommercial 1.0.0</a>:
              free for personal projects, hobby use, study, research, charities, schools and government bodies.
              Selling boards, printed cases, kits or the files, shipping it inside a product, or using it in paid work needs a commercial licence.
              Write to <a href="mailto:lxusbrain@gmail.com" className="text-cyan-400 hover:text-cyan-300">lxusbrain@gmail.com</a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
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
                Software and hardware that run on your own machines. Your data, your infrastructure, our innovation.
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/termivoxed" className="text-muted-foreground hover:text-primary transition">TermiVoxed</Link></li>
                <li><Link to="/hid-fi" className="text-muted-foreground hover:text-primary transition">HID-Fi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">HID-Fi</h4>
              <ul className="space-y-2 text-sm">
                <li><a href={REPO} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition">Source on GitHub</a></li>
                <li><a href={CORE_GUIDE} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition">HID-Fi Core build guide</a></li>
                <li><a href={COMPANION_DOCS} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition">Companion app</a></li>
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
          <div className="pt-4 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} LxusBrain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
