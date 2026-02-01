'use client'

import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function PrivacyPolicyPage() {
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

        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm opacity-60 mb-8">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="text-lg font-medium mb-3">1. Introduction</h2>
            <p className="opacity-80">
              Folding Vectors (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our document analysis service.
            </p>
            <p className="opacity-80 mt-3">
              This policy applies to all users worldwide and is designed to comply with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable privacy laws.
            </p>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-lg font-medium mb-3">2. Data Controller</h2>
            <p className="opacity-80">
              Folding Vectors is the data controller responsible for your personal data. For any privacy-related inquiries, please contact us at:
            </p>
            <p className="opacity-80 mt-2">
              Email: hello@foldingvectors.com
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-lg font-medium mb-3">3. Information We Collect</h2>

            <h3 className="font-medium mt-4 mb-2">3.1 Information You Provide</h3>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>Account information: email address when you create an account</li>
              <li>Documents: text content you upload or paste for analysis</li>
              <li>Analysis preferences: perspectives and settings you select</li>
              <li>Payment information: processed securely by Stripe (we do not store card details)</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">3.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>Device information: browser type, operating system</li>
              <li>Usage data: pages visited, features used, analysis history</li>
              <li>Log data: IP address, access times, referring URLs</li>
              <li>Cookies and similar technologies (see our Cookie Policy)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-lg font-medium mb-3">4. How We Use Your Information</h2>
            <p className="opacity-80 mb-3">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>To provide and maintain our document analysis service</li>
              <li>To process your analyses using AI technology</li>
              <li>To manage your account and subscription</li>
              <li>To process payments through our payment provider</li>
              <li>To send service-related communications</li>
              <li>To improve and optimize our service</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Legal Basis for Processing (GDPR) */}
          <section>
            <h2 className="text-lg font-medium mb-3">5. Legal Basis for Processing (GDPR)</h2>
            <p className="opacity-80 mb-3">Under GDPR, we process your data based on:</p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Contract:</strong> Processing necessary to provide our service to you</li>
              <li><strong>Legitimate interests:</strong> Improving our service, preventing fraud</li>
              <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing)</li>
              <li><strong>Legal obligation:</strong> Compliance with applicable laws</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-lg font-medium mb-3">6. Data Sharing and Disclosure</h2>
            <p className="opacity-80 mb-3">We may share your information with:</p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>AI Service Providers:</strong> We use Anthropic&apos;s Claude API to process document analyses. Documents are sent to their API for processing.</li>
              <li><strong>Infrastructure Providers:</strong> Supabase (database), Vercel (hosting)</li>
              <li><strong>Payment Processors:</strong> Stripe processes all payment transactions</li>
              <li><strong>Analytics:</strong> We may use privacy-respecting analytics tools</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="opacity-80 mt-3">
              We do not sell your personal data to third parties.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-lg font-medium mb-3">7. Data Retention</h2>
            <p className="opacity-80">
              We retain your personal data for as long as your account is active or as needed to provide our services. You may delete your analyses at any time through your dashboard. Upon account deletion, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-lg font-medium mb-3">8. Your Rights</h2>

            <h3 className="font-medium mt-4 mb-2">8.1 GDPR Rights (EU/EEA Users)</h3>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">8.2 CCPA Rights (California Residents)</h3>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Right to Know:</strong> What personal information we collect and how it&apos;s used</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (we do not sell data)</li>
              <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>

            <p className="opacity-80 mt-4">
              To exercise any of these rights, please contact us at hello@foldingvectors.com.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-lg font-medium mb-3">9. International Data Transfers</h2>
            <p className="opacity-80">
              Your data may be transferred to and processed in countries outside your jurisdiction, including the United States. We ensure appropriate safeguards are in place, including Standard Contractual Clauses where required, to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-lg font-medium mb-3">10. Data Security</h2>
            <p className="opacity-80">
              We implement appropriate technical and organizational security measures to protect your personal data, including encryption in transit (TLS) and at rest, secure authentication, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-lg font-medium mb-3">11. Children&apos;s Privacy</h2>
            <p className="opacity-80">
              Our service is not intended for children under 16 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-lg font-medium mb-3">12. Changes to This Policy</h2>
            <p className="opacity-80">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-medium mb-3">13. Contact Us</h2>
            <p className="opacity-80">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="opacity-80 mt-2">
              Email: hello@foldingvectors.com
            </p>
            <p className="opacity-80 mt-2">
              For GDPR-related inquiries, you also have the right to lodge a complaint with your local supervisory authority.
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
