import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Shield,
  Users,
  FileText,
  Download,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Zap,
  HeadphonesIcon,
  Server
} from 'lucide-react'

import { LxusBrainLogo, LxusBrainTitle, TermiVoxedLogo } from '@/components/logos'
import { Button } from '@/components/ui/button'

// Enterprise features - only features that are actually implemented
const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'AES-256 encryption, GDPR & DPDP Act compliant. Your data stays secure with industry-standard protection.'
  },
  {
    icon: Server,
    title: '100% Local Processing',
    description: 'Videos never leave your infrastructure. Process entirely on your machines for maximum privacy.'
  },
  {
    icon: Zap,
    title: 'Unlimited Usage',
    description: 'No limits on exports, TTS minutes, or AI generations. Scale without worrying about caps.'
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Support',
    description: 'Priority email support with faster response times and personalized assistance for your team.'
  },
  {
    icon: Users,
    title: 'Volume Licensing',
    description: 'Flexible licensing for teams of any size with volume discounts. Deploy across your organization.'
  },
  {
    icon: FileText,
    title: 'Invoice Billing',
    description: 'NET-30 payment terms with GST-compliant invoices. No credit card required for enterprise contracts.'
  }
]

// Downloadable resources
const resources = [
  {
    title: 'Enterprise Pricing Guide',
    description: 'Detailed pricing structure with volume discounts and add-on services.',
    icon: FileText,
    href: '/enterprise/enterprise-pricing.html',
    type: 'PDF'
  },
  {
    title: 'Security Whitepaper',
    description: 'Comprehensive overview of our security architecture, compliance, and practices.',
    icon: Shield,
    href: '/enterprise/security-whitepaper.html',
    type: 'PDF'
  },
  {
    title: 'Data Processing Agreement',
    description: 'Standard DPA for GDPR and DPDP Act compliance. Ready to sign.',
    icon: FileText,
    href: '/enterprise/data-processing-agreement.html',
    type: 'PDF'
  },
  {
    title: 'Invoice Template',
    description: 'GST-compliant invoice format for enterprise billing.',
    icon: FileText,
    href: '/enterprise/enterprise-invoice-template.html',
    type: 'HTML'
  }
]

export function EnterprisePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    phone: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create mailto link with form data
    const subject = encodeURIComponent(`Enterprise Inquiry from ${formData.company}`)
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Team Size: ${formData.teamSize}
Phone: ${formData.phone || 'Not provided'}

Message:
${formData.message}

---
Sent from TermiVoxed Enterprise page
    `.trim())

    // Open mailto
    window.location.href = `mailto:info@lxusbrain.com?subject=${subject}&body=${body}`

    // Show success after a brief delay
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1 }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-orange-500/[0.02]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.05),transparent)]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
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
            <Link to="/termivoxed#pricing" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Enterprise Plan</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            TermiVoxed for{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Enterprise
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            AI-powered video dubbing at scale. Custom pricing, dedicated support,
            and enterprise-grade security for your organization.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium transition-all shadow-lg shadow-amber-500/25"
            >
              <Mail className="w-5 h-5" />
              Contact Sales
            </a>
            <a
              href="#resources"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-foreground font-medium transition-all"
            >
              <Download className="w-5 h-5" />
              Download Resources
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            custom={4}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12"
          >
            Enterprise Features
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 5}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-16 px-4 bg-white/[0.01] relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Enterprise Resources
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Download our enterprise documentation. All documents can be printed or saved as PDF.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {resources.map((resource, i) => (
              <motion.a
                key={resource.title}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/30 hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <resource.icon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-amber-400 transition-colors">
                      {resource.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                  <span className="inline-block mt-2 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Open in new tab
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground text-sm mt-8"
          >
            Use "Print / Save as PDF" button in each document to download as PDF.
          </motion.p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Request Enterprise Quote
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll prepare a custom quote for your organization.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Work Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Team Size <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Select team size</option>
                      <option value="10-25">10-25 users</option>
                      <option value="26-50">26-50 users</option>
                      <option value="51-100">51-100 users</option>
                      <option value="101-250">101-250 users</option>
                      <option value="250+">250+ users</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your requirements <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    placeholder="What features are most important? Any specific requirements? Expected video volume per month?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Opening email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>

                <p className="text-center text-muted-foreground text-xs">
                  This will open your email client. Alternatively, email us directly at{' '}
                  <a href="mailto:info@lxusbrain.com" className="text-amber-400 hover:underline">
                    info@lxusbrain.com
                  </a>
                </p>
              </form>

              <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>We typically respond within 24 hours with a custom quote and proposal.</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Request Received!</h2>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                Your email client should have opened with your request. If it didn't, please email us directly:
              </p>
              <a
                href="mailto:info@lxusbrain.com"
                className="text-amber-400 hover:underline font-medium"
              >
                info@lxusbrain.com
              </a>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-foreground transition-all"
                >
                  Submit Another Request
                </button>
                <Link
                  to="/termivoxed"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to TermiVoxed
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Info Footer */}
      <section className="py-12 px-4 bg-white/[0.01] border-t border-border relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-foreground mb-6">Other Ways to Reach Us</h3>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="mailto:info@lxusbrain.com"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition"
            >
              <Mail className="w-5 h-5 text-amber-400" />
              <span>info@lxusbrain.com</span>
            </a>
            <a
              href="tel:+918667429016"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition"
            >
              <Phone className="w-5 h-5 text-amber-400" />
              <span>+91 8667429016</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LxusBrainLogo size={20} />
            <span className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} LxusBrain Technologies
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition">
              Terms
            </Link>
            <Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition">
              Privacy
            </Link>
            <Link to="/legal/refund" className="text-muted-foreground hover:text-foreground transition">
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default EnterprisePage
