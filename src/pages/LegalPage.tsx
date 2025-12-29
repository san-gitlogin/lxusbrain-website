import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'
import { LxusBrainLogo, LxusBrainTitle } from '@/components/logos'

// Legal content data
const legalContent = {
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'Dec 29, 2025',
    sections: [
      {
        title: null,
        content: `For the purpose of these Terms and Conditions, the term "we", "us", "our" used anywhere on this page shall mean LxusBrain, whose registered/operational office is Aravind Santhosh Illam, Gudiyattam 632602 Gudiyattam South TAMIL NADU 632602. "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.`
      },
      {
        title: 'Your Use of the Website',
        content: 'Your use of the website and/or purchase from us are governed by the following Terms and Conditions:',
        list: [
          'The content of the pages of this website is subject to change without notice.',
          'Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.',
          'Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable.',
          'Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice.',
          'All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.',
          'Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.',
          'From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.',
          'You may not create a link to our website from another website or document without LxusBrain\'s prior written consent.',
          'Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.',
          'We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction.'
        ]
      },
      {
        title: 'Our Products and Services',
        content: 'LxusBrain offers AI-powered software products including but not limited to:',
        list: [
          'TermiVoxed: An AI voice-over dubbing service with subscription plans'
        ],
        additionalContent: 'Additional terms for using our services:',
        additionalList: [
          'Subscription: Subscriptions auto-renew unless cancelled before the billing date',
          'Device Limits: Each plan has a device limit based on your subscription tier',
          'Content Ownership: You retain all rights to content you create using our products',
          'Acceptable Use: You may not use our services to create illegal, harmful, or misleading content'
        ]
      },
      {
        title: 'Governing Law',
        content: 'These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Dec 29, 2025',
    sections: [
      {
        title: null,
        content: 'This privacy policy sets out how LxusBrain uses and protects any information that you give us when you use this website or our products. We are committed to ensuring that your privacy is protected.'
      },
      {
        title: 'Information We Collect',
        content: 'We may collect the following information:',
        list: [
          'Name and contact information including email address',
          'Demographic information such as preferences and interests',
          'Other information relevant to customer surveys and/or offers',
          'Payment information (processed securely through Razorpay)',
          'Device information for license verification',
          'Usage data to improve our services'
        ]
      },
      {
        title: 'How We Use Your Information',
        content: 'We require this information to understand your needs and provide you with a better service:',
        list: [
          'Internal record keeping',
          'Improving our products and services',
          'Sending promotional emails about new products, special offers, or other information',
          'From time to time, we may also use your information to contact you for market research purposes',
          'Processing payments and managing subscriptions',
          'Verifying device licenses and preventing fraud'
        ]
      },
      {
        title: 'Security',
        content: 'We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.'
      },
      {
        title: 'Payment Processing',
        content: 'All payment transactions are processed through Razorpay, a PCI-DSS compliant payment gateway. We do not store your complete credit/debit card details on our servers.'
      },
      {
        title: 'Cookies',
        content: 'We use traffic log cookies to identify which pages are being used. This helps us analyze data about web page traffic and improve our website and products. We only use this information for statistical analysis purposes.'
      },
      {
        title: 'Your Rights',
        content: 'You may request details of personal information which we hold about you. If you believe that any information we are holding on you is incorrect or incomplete, please contact us and we will promptly correct any information found to be incorrect.'
      },
      {
        title: 'Data Retention',
        content: 'We retain your personal information for as long as necessary to provide you with our services. We may also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.'
      }
    ]
  },
  refund: {
    title: 'Cancellation & Refund Policy',
    lastUpdated: 'Dec 29, 2025',
    sections: [
      {
        title: null,
        content: 'At LxusBrain, we strive to provide high-quality AI-powered software services. This policy outlines our cancellation and refund procedures.'
      },
      {
        title: 'Subscription Cancellation',
        content: 'You can cancel your subscription at any time:',
        list: [
          'Cancellation can be done through your account settings',
          'Your subscription remains active until the end of the current billing period',
          'No refund is provided for the remaining days of the current billing period',
          'After cancellation, you will retain access to your account data for 30 days'
        ]
      },
      {
        title: 'Refund Eligibility',
        content: 'Refunds may be considered in the following cases:',
        list: [
          'Technical issues that prevent you from using the service, which our support team cannot resolve',
          'Duplicate charges or billing errors',
          'Service outages exceeding 48 hours',
          'Requests made within 7 days of the initial purchase (first-time subscribers only)'
        ]
      },
      {
        title: 'How to Request a Refund',
        content: 'To request a refund, please contact us at lxusbrain@gmail.com with your account details and reason for the refund request. We will review your request within 5-7 business days.'
      },
      {
        title: 'Non-Refundable Items',
        content: 'The following are not eligible for refunds:',
        list: [
          'Lifetime license purchases (after 7-day cooling period)',
          'Subscription renewals (cancellation is the appropriate action)',
          'Partial month usage',
          'Account termination due to Terms of Service violations'
        ]
      }
    ]
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    lastUpdated: 'Dec 29, 2025',
    sections: [
      {
        title: null,
        content: 'LxusBrain provides digital software products and services. As such, our delivery policy pertains to digital delivery only.'
      },
      {
        title: 'Digital Delivery',
        content: 'Our products are delivered digitally:',
        list: [
          'Access is granted immediately upon successful payment',
          'Download links and account credentials are sent to your registered email',
          'License keys (if applicable) are delivered within minutes of purchase',
          'Desktop applications can be downloaded from your account dashboard'
        ]
      },
      {
        title: 'Delivery Confirmation',
        content: 'You will receive an email confirmation containing:',
        list: [
          'Purchase receipt and invoice',
          'Instructions for accessing your account',
          'Download links for desktop applications',
          'License activation instructions'
        ]
      },
      {
        title: 'Delivery Issues',
        content: 'If you do not receive your purchase confirmation within 30 minutes of payment, please check your spam folder first. If still not received, contact us at lxusbrain@gmail.com with your transaction ID.'
      },
      {
        title: 'No Physical Shipping',
        content: 'We do not ship any physical products. All our offerings are cloud-based services or downloadable software applications.'
      }
    ]
  }
}

type LegalType = keyof typeof legalContent

export function LegalPage() {
  const { type } = useParams<{ type: string }>()
  const content = legalContent[type as LegalType]

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">Go back home</Link>
        </div>
      </div>
    )
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.1 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-indigo-500/[0.02]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,200,0.05),rgba(255,255,255,0))]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 outline-none focus:outline-none">
              <LxusBrainLogo size={28} className="sm:w-8 sm:h-8" />
              <LxusBrainTitle height={20} className="hidden sm:block" />
            </Link>
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to="/" className="text-white/60 hover:text-white transition text-sm sm:text-base">Home</Link>
              <Link to="/termivoxed" className="text-white/60 hover:text-white transition text-sm sm:text-base">TermiVoxed</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
              {content.title}
            </h1>
            <p className="text-muted-foreground">
              Last updated on {content.lastUpdated}
            </p>
          </motion.div>

          {/* Sections */}
          {content.sections.map((section, index) => (
            <motion.div
              key={index}
              custom={index + 2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mb-10"
            >
              {section.title && (
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 pb-2 border-b border-white/[0.1]">
                  {section.title}
                </h2>
              )}
              <p className="text-muted-foreground leading-relaxed mb-4">
                {section.content}
              </p>
              {section.list && (
                <ul className="space-y-3 mb-4">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.additionalContent && (
                <>
                  <p className="text-muted-foreground leading-relaxed mb-4 mt-6">
                    {section.additionalContent}
                  </p>
                  {section.additionalList && (
                    <ul className="space-y-3">
                      {section.additionalList.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </motion.div>
          ))}

          {/* Contact Box */}
          <motion.div
            custom={content.sections.length + 2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-medium text-foreground">LxusBrain Technologies</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>Aravind Santhosh Illam, Gudiyattam 632602<br />Gudiyattam South, TAMIL NADU 632602</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <a href="tel:+918667429016" className="hover:text-cyan-400 transition">+91 8667429016</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <a href="mailto:lxusbrain@gmail.com" className="hover:text-cyan-400 transition">lxusbrain@gmail.com</a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 border-t border-border/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <LxusBrainLogo size={20} className="sm:w-6 sm:h-6" />
              <span className="text-muted-foreground text-xs sm:text-sm">
                © {new Date().getFullYear()} LxusBrain Technologies
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition">
                Terms
              </Link>
              <Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition">
                Privacy
              </Link>
              <Link to="/legal/refund" className="text-muted-foreground hover:text-foreground transition">
                Refund Policy
              </Link>
              <Link to="/legal/shipping" className="text-muted-foreground hover:text-foreground transition">
                Shipping
              </Link>
              <a href="mailto:lxusbrain@gmail.com" className="text-muted-foreground hover:text-foreground transition">
                Contact
              </a>
              <Link to="/termivoxed" className="text-muted-foreground hover:text-foreground transition flex items-center gap-1">
                TermiVoxed <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LegalPage
