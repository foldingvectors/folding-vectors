'use client'

import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function TermsOfServicePage() {
  const router = useRouter()
  const lastUpdated = 'January 31, 2025'

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-sm opacity-60 hover:opacity-100 transition"
          >
            Folding Vectors
          </button>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm opacity-60 mb-8">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Agreement */}
          <section>
            <h2 className="text-lg font-medium mb-3">1. Agreement to Terms</h2>
            <p className="opacity-80">
              By accessing or using Folding Vectors (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p className="opacity-80 mt-3">
              We may modify these Terms at any time. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-lg font-medium mb-3">2. Description of Service</h2>
            <p className="opacity-80">
              Folding Vectors is an AI-powered document analysis service that provides multi-perspective analysis of documents using artificial intelligence. The Service allows users to:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1 mt-2">
              <li>Upload or paste text documents for analysis</li>
              <li>Receive AI-generated analyses from multiple professional perspectives</li>
              <li>Save, export, and share analysis results</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-lg font-medium mb-3">3. Account Registration</h2>
            <p className="opacity-80">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1 mt-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="opacity-80 mt-3">
              You must be at least 16 years old to use this Service.
            </p>
          </section>

          {/* Subscription and Payments */}
          <section>
            <h2 className="text-lg font-medium mb-3">4. Subscriptions and Payments</h2>

            <h3 className="font-medium mt-4 mb-2">4.1 Free Tier</h3>
            <p className="opacity-80">
              The free tier provides limited analyses per month. Usage limits may change at our discretion.
            </p>

            <h3 className="font-medium mt-4 mb-2">4.2 Paid Subscriptions</h3>
            <p className="opacity-80">
              Paid subscriptions provide additional features and higher usage limits. By subscribing, you agree to pay all applicable fees. Subscriptions automatically renew unless cancelled before the renewal date.
            </p>

            <h3 className="font-medium mt-4 mb-2">4.3 Refunds</h3>
            <p className="opacity-80">
              Subscription fees are generally non-refundable. However, you may request a refund within 14 days of your initial subscription if you have not extensively used the Service. Contact support for refund requests.
            </p>

            <h3 className="font-medium mt-4 mb-2">4.4 Price Changes</h3>
            <p className="opacity-80">
              We may change subscription prices with 30 days&apos; notice. Price changes take effect at the start of your next billing cycle.
            </p>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-lg font-medium mb-3">5. User Content</h2>

            <h3 className="font-medium mt-4 mb-2">5.1 Your Content</h3>
            <p className="opacity-80">
              You retain ownership of all documents and content you upload to the Service (&quot;User Content&quot;). By uploading content, you grant us a limited license to process your content for the purpose of providing the Service.
            </p>

            <h3 className="font-medium mt-4 mb-2">5.2 Content Restrictions</h3>
            <p className="opacity-80 mb-2">You agree not to upload content that:</p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>Violates any applicable law or regulation</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Is defamatory, obscene, or promotes illegal activities</li>
              <li>Contains personal data of others without their consent</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">5.3 AI Processing</h3>
            <p className="opacity-80">
              Your documents are processed by third-party AI services (Anthropic&apos;s Claude). By using the Service, you consent to this processing. Do not upload highly sensitive or classified information.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-lg font-medium mb-3">6. Intellectual Property</h2>
            <p className="opacity-80">
              The Service, including its design, features, and content (excluding User Content), is owned by Folding Vectors and protected by intellectual property laws. You may not copy, modify, or reverse engineer any part of the Service.
            </p>
            <p className="opacity-80 mt-3">
              Analysis results generated by the Service are provided for your use. You may use, share, and export your analysis results as you see fit.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-lg font-medium mb-3">7. Acceptable Use</h2>
            <p className="opacity-80 mb-2">You agree not to:</p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to circumvent usage limits or security measures</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service to generate spam or misleading content</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-lg font-medium mb-3">8. Disclaimers</h2>

            <h3 className="font-medium mt-4 mb-2">8.1 AI-Generated Content</h3>
            <p className="opacity-80">
              Analysis results are generated by artificial intelligence and should not be considered professional advice. The Service does not provide legal, financial, medical, or other professional advice. Always consult qualified professionals for important decisions.
            </p>

            <h3 className="font-medium mt-4 mb-2">8.2 No Warranty</h3>
            <p className="opacity-80">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="font-medium mt-4 mb-2">8.3 Accuracy</h3>
            <p className="opacity-80">
              We do not guarantee the accuracy, completeness, or reliability of any analysis results. AI-generated content may contain errors, biases, or hallucinations. You are responsible for verifying any information before acting on it.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-lg font-medium mb-3">9. Limitation of Liability</h2>
            <p className="opacity-80">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FOLDING VECTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="opacity-80 mt-3">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-lg font-medium mb-3">10. Indemnification</h2>
            <p className="opacity-80">
              You agree to indemnify and hold harmless Folding Vectors and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-lg font-medium mb-3">11. Termination</h2>
            <p className="opacity-80">
              You may terminate your account at any time through your account settings. We may suspend or terminate your access to the Service at our discretion, including for violation of these Terms.
            </p>
            <p className="opacity-80 mt-3">
              Upon termination, your right to use the Service ceases immediately. We may delete your data in accordance with our Privacy Policy.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-lg font-medium mb-3">12. Governing Law and Disputes</h2>
            <p className="opacity-80">
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Delaware, and you consent to personal jurisdiction in such courts.
            </p>
            <p className="opacity-80 mt-3">
              For EU users: Nothing in these Terms affects your statutory rights under EU consumer protection laws.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-lg font-medium mb-3">13. Severability</h2>
            <p className="opacity-80">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-lg font-medium mb-3">14. Entire Agreement</h2>
            <p className="opacity-80">
              These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Folding Vectors regarding the Service.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-medium mb-3">15. Contact</h2>
            <p className="opacity-80">
              For questions about these Terms, please contact us at:
            </p>
            <p className="opacity-80 mt-2">
              Email: legal@foldingvectors.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm opacity-60 hover:opacity-100 transition"
          >
            Back to Folding Vectors
          </button>
        </div>
      </div>
    </div>
  )
}
