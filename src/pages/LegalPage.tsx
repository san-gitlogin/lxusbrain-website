import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { LxusBrainLogo, LxusBrainTitle } from "@/components/logos";

// Legal content data
const legalContent = {
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "Jan 01, 2026",
    sections: [
      {
        title: null,
        content: `For the purpose of these Terms and Conditions, the term "we", "us", "our" used anywhere on this page shall mean LxusBrain, whose registered/operational office is Aravind Santhosh Illam, Gudiyattam South, Tamil Nadu 632602, India. "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.`,
      },
      {
        title: "Eligibility",
        content:
          "You shall register to become a user of this website only if you are of the age of 18 years or above and can enter into binding contracts as per applicable laws. By using our services, you represent that you meet these eligibility requirements.",
      },
      {
        title: "Your Use of the Website",
        content:
          "Your use of the website and/or purchase from us are governed by the following Terms and Conditions:",
        list: [
          "The content of the pages of this website is subject to change without notice.",
          "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.",
          "Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable.",
          "Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice.",
          "All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.",
          "Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.",
          "From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.",
          "You may not create a link to our website from another website or document without LxusBrain's prior written consent.",
          "Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.",
          "We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction.",
        ],
      },
      {
        title: "Our Products and Services",
        content:
          "LxusBrain offers AI-powered software products including but not limited to:",
        list: [
          "TermiVoxed: An AI voice-over dubbing service with subscription plans",
        ],
        additionalContent: "Additional terms for using our services:",
        additionalList: [
          "Subscription: Subscriptions auto-renew unless cancelled before the billing date",
          "Device Limits: Each plan has a device limit based on your subscription tier",
          "Content Ownership: You retain all rights to content you create using our products",
          "Acceptable Use: You may not use our services to create illegal, harmful, or misleading content",
        ],
      },
      {
        title: "Payment Processing",
        content:
          "All payment transactions are processed through Razorpay, a PCI-DSS compliant payment aggregator licensed by the Reserve Bank of India. By making a purchase, you agree to Razorpay's terms of service and privacy policy. We do not store your complete credit/debit card details on our servers. Payment information is collected and processed securely by Razorpay.",
      },
      {
        title: "Subscription Billing and Pricing",
        content:
          "By subscribing to our services, you agree to the following billing terms:",
        list: [
          "Subscriptions are billed in advance on a recurring basis (monthly or yearly) based on your selected plan",
          "Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date",
          "We reserve the right to modify subscription pricing at any time. Price changes will take effect at the start of your next billing cycle following a minimum 30-day advance notice sent to your registered email address",
          "For existing subscribers, the current subscription rate will remain in effect until the end of the current billing period. The new pricing will apply upon renewal",
          "If you do not agree to a price change, you may cancel your subscription before the new pricing takes effect. Cancellation will not result in a refund of any prepaid amounts",
          "Prices may vary by region and currency. International transactions may be subject to currency conversion at prevailing rates",
          "All prices are inclusive of applicable taxes (GST for Indian customers) unless otherwise stated",
          "Promotional or discounted pricing is valid only for the specified promotional period and may revert to standard pricing upon renewal",
        ],
      },
      {
        title: "Enterprise Agreements",
        content:
          "Enterprise customers are subject to the following additional terms:",
        list: [
          "Enterprise pricing is determined on a case-by-case basis and will be detailed in a separate Enterprise Service Agreement",
          "Enterprise contracts may include custom terms regarding pricing, service levels, support, and data handling",
          "For Enterprise customers, pricing changes will be communicated as per the terms of the signed Enterprise Service Agreement, typically with a minimum 60-day notice period",
          "Enterprise Service Level Agreements (SLAs) and custom terms supersede these general Terms where applicable",
          "Enterprise invoicing and payment terms (such as NET-30 or NET-60) will be specified in the Enterprise Service Agreement",
        ],
      },
      {
        title: "Prohibited Uses",
        content:
          "You agree not to use our services for any unlawful purpose or in violation of these Terms. Prohibited uses include but are not limited to:",
        list: [
          "Creating content that is illegal, harmful, threatening, abusive, defamatory, or violates any law",
          "Infringing on intellectual property rights of others",
          "Impersonating any person or entity",
          "Uploading viruses or malicious code",
          "Using the service for any fraudulent or deceptive purpose",
          "Reselling or redistributing our services without authorization",
          "Circumventing any security measures or access controls",
        ],
      },
      {
        title: "Intellectual Property",
        content:
          "All intellectual property rights in the website, software, and services are owned by LxusBrain. You are granted a limited, non-exclusive, non-transferable license to use our services for personal or business purposes as per your subscription. You shall not copy, modify, distribute, sell, or lease any part of our services without our prior written consent.",
      },
      {
        title: "Limitation of Liability",
        content:
          "To the maximum extent permitted by law, LxusBrain shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly. Our total liability for any claims shall not exceed the amount paid by you for the services in the past 12 months.",
      },
      {
        title: "Force Majeure",
        content:
          "LxusBrain shall not be liable for any failure or delay in performing its obligations due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of government, epidemics, pandemics, or failures of third-party services.",
      },
      {
        title: "Governing Law",
        content:
          "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Dec 29, 2025",
    sections: [
      {
        title: null,
        content:
          "This privacy policy sets out how LxusBrain uses and protects any information that you give us when you use this website or our products. We are committed to ensuring that your privacy is protected. By visiting this website, you agree and acknowledge to be bound by this Privacy Policy and you hereby consent that we will collect, use, process and share your Personal Information in the manner set out below.",
      },
      {
        title: "Information We Collect",
        content:
          "We collect, receive and store your Personal Information. We may collect the following information:",
        list: [
          "Name and contact information including email address and phone number",
          "Demographic information such as preferences and interests",
          "Payment information (processed securely through Razorpay - we do not store card details)",
          "Device information including device ID, operating system, and browser type for license verification",
          "Usage data including IP address, browser type, pages viewed, and timestamps",
          "Third-party account information if you choose to link accounts",
          "Any other information you voluntarily provide to us",
        ],
      },
      {
        title: "How We Use Your Information",
        content:
          "The Personal Information collected will be used only for the purposes identified below:",
        list: [
          "Enabling you to use the services provided by us",
          "Processing payments and managing subscriptions through Razorpay",
          "Internal record keeping and improving our products and services",
          "Sending promotional emails about new products, special offers (you can unsubscribe anytime)",
          "Verifying device licenses and preventing fraud",
          "Customizing user experience and troubleshooting problems",
          "Enforcing our terms and conditions",
          "Complying with legal obligations and regulatory requirements",
        ],
      },
      {
        title: "Data Sharing",
        content:
          "We do not sell your Personal Information to third parties. We may share your information with:",
        list: [
          "Razorpay (our payment processor) for processing transactions",
          "Financial institutions such as banks and RBI as required by law",
          "Law enforcement agencies or government authorities when required by law",
          "Service providers who assist us in operating our business (under confidentiality agreements)",
          "Our affiliates and subsidiaries for business purposes",
        ],
      },
      {
        title: "Security",
        content:
          "We have implemented reasonable security practices and procedures that are commensurate with the information assets being protected. While we try our best to provide security that is better than industry standards, because of the inherent vulnerabilities of the internet, we cannot ensure or warrant complete security of all information that is being transmitted to us by you. Your account is password protected and you are responsible for maintaining the confidentiality of your credentials.",
      },
      {
        title: "Payment Processing",
        content:
          "All payment transactions are processed through Razorpay, a PCI-DSS compliant payment aggregator authorized by the Reserve Bank of India. We do not store your complete credit/debit card details on our servers. Your payment information is handled securely by Razorpay in accordance with their privacy policy and security standards.",
      },
      {
        title: "Cookies",
        content:
          "We send cookies to your computer to uniquely identify your browser and improve the quality of our service. We may use both session cookies (which expire once you close your browser) and persistent cookies (which stay on your computer until you delete them). You can disable cookies in your browser settings, but some features of our website may not work properly.",
      },
      {
        title: "Your Rights",
        content:
          "You have the following rights regarding your personal information:",
        list: [
          "Access: You may request details of personal information we hold about you",
          "Correction: If any information is incorrect or incomplete, please contact us to update it",
          "Erasure: You may request deletion of your personal information (subject to legal requirements)",
          "Opt-out: You can unsubscribe from marketing communications at any time",
          "Data Portability: You may request a copy of your data in a structured format",
        ],
      },
      {
        title: "Data Retention",
        content:
          "We retain your personal information for as long as necessary to provide you with our services and as required by applicable laws. Transaction records may be retained for up to 10 years as per regulatory requirements. After the retention period, your data will be securely deleted or anonymized.",
      },
      {
        title: "Changes to Privacy Policy",
        content:
          "Our Privacy Policy is subject to change at any time without notice. To make sure you are aware of any changes, please review this policy periodically. Continued use of our services after any changes shall indicate your acknowledgement of such changes.",
      },
      {
        title: "Grievance Redressal",
        content:
          "If you have any complaints or concerns regarding your personal information or this Privacy Policy, please contact our Grievance Officer at lxusbrain@gmail.com. We will respond to your grievance within 5 business days of receiving your complaint.",
      },
    ],
  },
  refund: {
    title: "Cancellation & Refund Policy",
    lastUpdated: "Dec 29, 2025",
    sections: [
      {
        title: null,
        content:
          "At LxusBrain, we strive to provide high-quality AI-powered software services. This policy outlines our cancellation and refund procedures in accordance with applicable laws and payment gateway requirements.",
      },
      {
        title: "Subscription Cancellation",
        content: "You can cancel your subscription at any time:",
        list: [
          "Cancellation can be done through your account settings or by contacting us",
          "Your subscription remains active until the end of the current billing period",
          "No refund is provided for the remaining days of the current billing period",
          "After cancellation, you will retain access to your account data for 30 days",
        ],
      },
      {
        title: "Refund Eligibility",
        content: "Refunds may be considered in the following cases:",
        list: [
          "Technical issues that prevent you from using the service, which our support team cannot resolve",
          "Duplicate charges or billing errors",
          "Service outages exceeding 48 hours",
          "Requests made within 7 days of the initial purchase (first-time subscribers only)",
        ],
      },
      {
        title: "How to Request a Refund",
        content:
          "To request a refund, please contact us at lxusbrain@gmail.com with your account details, transaction ID, and reason for the refund request. We will review your request and respond within 5-7 business days. Approved refunds will be processed to the original payment method within 5-10 business days.",
      },
      {
        title: "Non-Refundable Items",
        content: "The following are not eligible for refunds:",
        list: [
          "Lifetime license purchases (after 7-day cooling period)",
          "Subscription renewals (cancellation is the appropriate action)",
          "Partial month usage",
          "Account termination due to Terms of Service violations",
        ],
      },
      {
        title: "Chargebacks",
        content:
          "If you initiate a chargeback with your bank or payment provider instead of contacting us for a refund:",
        list: [
          "Your account may be suspended pending investigation",
          "You may be required to provide documentation to support your claim",
          "If the chargeback is found to be invalid, you may be liable for any fees incurred",
          "We encourage you to contact us directly at lxusbrain@gmail.com before initiating a chargeback",
        ],
      },
      {
        title: "Refund Processing",
        content:
          "All refunds are processed through Razorpay to the same payment method used for the original transaction. The time for the refund to reflect in your account depends on your bank or payment provider, typically 5-10 business days.",
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    lastUpdated: "Dec 29, 2025",
    sections: [
      {
        title: null,
        content:
          "LxusBrain provides digital software products and services. As such, our delivery policy pertains to digital delivery only.",
      },
      {
        title: "Digital Delivery",
        content: "Our products are delivered digitally:",
        list: [
          "Access is granted immediately upon successful payment",
          "Download links and account credentials are sent to your registered email",
          "License keys (if applicable) are delivered within minutes of purchase",
          "Desktop applications can be downloaded from your account dashboard",
        ],
      },
      {
        title: "Delivery Confirmation",
        content: "You will receive an email confirmation containing:",
        list: [
          "Purchase receipt and invoice",
          "Instructions for accessing your account",
          "Download links for desktop applications",
          "License activation instructions",
        ],
      },
      {
        title: "Delivery Issues",
        content:
          "If you do not receive your purchase confirmation within 30 minutes of payment, please check your spam folder first. If still not received, contact us at lxusbrain@gmail.com with your transaction ID.",
      },
      {
        title: "No Physical Shipping",
        content:
          "We do not ship any physical products. All our offerings are cloud-based services or downloadable software applications.",
      },
    ],
  },
};

type LegalType = keyof typeof legalContent;

export function LegalPage() {
  const { type } = useParams<{ type: string }>();
  const content = legalContent[type as LegalType];

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            Go back home
          </Link>
        </div>
      </div>
    );
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
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-indigo-500/[0.02]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,200,200,0.05),rgba(255,255,255,0))]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 outline-none focus:outline-none"
            >
              <LxusBrainLogo size={28} className="sm:w-8 sm:h-8" />
              <LxusBrainTitle height={20} className="hidden sm:block" />
            </Link>
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link
                to="/"
                className="text-white/60 hover:text-white transition text-sm sm:text-base"
              >
                Home
              </Link>
              <Link
                to="/termivoxed"
                className="text-white/60 hover:text-white transition text-sm sm:text-base"
              >
                TermiVoxed
              </Link>
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
                    <li
                      key={i}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
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
                        <li
                          key={i}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
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
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-medium text-foreground">LxusBrain</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  Aravind Santhosh Illam, Gudiyattam South
                  <br />
                  Tamil Nadu 632602, India
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <a
                  href="tel:+918667429016"
                  className="hover:text-cyan-400 transition"
                >
                  +91 8667429016
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <a
                  href="mailto:lxusbrain@gmail.com"
                  className="hover:text-cyan-400 transition"
                >
                  lxusbrain@gmail.com
                </a>
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
                © {new Date().getFullYear()} LxusBrain
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link
                to="/legal/terms"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Terms
              </Link>
              <Link
                to="/legal/privacy"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Privacy
              </Link>
              <Link
                to="/legal/refund"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Refund Policy
              </Link>
              <Link
                to="/legal/shipping"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Shipping
              </Link>
              <a
                href="mailto:lxusbrain@gmail.com"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Contact
              </a>
              <Link
                to="/termivoxed"
                className="text-muted-foreground hover:text-foreground transition flex items-center gap-1"
              >
                TermiVoxed <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LegalPage;
