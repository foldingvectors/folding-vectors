'use client'

import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function CookiePolicyPage() {
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

        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Cookie Policy</h1>
        <p className="text-sm opacity-60 mb-8">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="text-lg font-medium mb-3">1. What Are Cookies</h2>
            <p className="opacity-80">
              Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. This Cookie Policy explains how Folding Vectors uses cookies and similar technologies.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-lg font-medium mb-3">2. How We Use Cookies</h2>
            <p className="opacity-80 mb-3">We use cookies for the following purposes:</p>

            <h3 className="font-medium mt-4 mb-2">2.1 Essential Cookies (Required)</h3>
            <p className="opacity-80 mb-2">
              These cookies are necessary for the website to function and cannot be switched off. They include:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Authentication cookies:</strong> To keep you logged into your account</li>
              <li><strong>Session cookies:</strong> To maintain your session state</li>
              <li><strong>Security cookies:</strong> To protect against CSRF attacks</li>
              <li><strong>Preference cookies:</strong> To remember your theme preference (dark/light mode)</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">2.2 Functional Cookies (Optional)</h3>
            <p className="opacity-80 mb-2">
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Language preferences:</strong> To remember your language settings</li>
              <li><strong>UI preferences:</strong> To remember your interface customizations</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">2.3 Analytics Cookies (Optional)</h3>
            <p className="opacity-80 mb-2">
              These cookies help us understand how visitors interact with our website:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Usage analytics:</strong> To understand which features are most used</li>
              <li><strong>Performance monitoring:</strong> To identify and fix issues</li>
            </ul>
            <p className="opacity-80 mt-2">
              We use privacy-respecting analytics that do not track you across other websites.
            </p>
          </section>

          {/* Specific Cookies */}
          <section>
            <h2 className="text-lg font-medium mb-3">3. Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-[var(--border)] text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Purpose</th>
                    <th className="p-2 text-left">Duration</th>
                    <th className="p-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody className="opacity-80">
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-2">sb-*-auth-token</td>
                    <td className="p-2">Supabase authentication</td>
                    <td className="p-2">Session</td>
                    <td className="p-2">Essential</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-2">theme</td>
                    <td className="p-2">Dark/light mode preference</td>
                    <td className="p-2">1 year</td>
                    <td className="p-2">Essential</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-2">cookie-consent</td>
                    <td className="p-2">Cookie consent preference</td>
                    <td className="p-2">1 year</td>
                    <td className="p-2">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-lg font-medium mb-3">4. Third-Party Cookies</h2>
            <p className="opacity-80 mb-3">
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li><strong>Stripe:</strong> Payment processing (if you make a purchase)</li>
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>Vercel:</strong> Hosting and performance optimization</li>
            </ul>
            <p className="opacity-80 mt-3">
              These third parties have their own privacy and cookie policies. We encourage you to review them.
            </p>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-lg font-medium mb-3">5. Managing Cookies</h2>

            <h3 className="font-medium mt-4 mb-2">5.1 Browser Settings</h3>
            <p className="opacity-80 mb-2">
              You can control and delete cookies through your browser settings. Here are links to cookie management instructions for common browsers:
            </p>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>Chrome: chrome://settings/cookies</li>
              <li>Firefox: about:preferences#privacy</li>
              <li>Safari: Preferences &gt; Privacy</li>
              <li>Edge: edge://settings/privacy</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">5.2 Impact of Disabling Cookies</h3>
            <p className="opacity-80">
              If you disable essential cookies, some parts of our website may not function properly. You may not be able to log in, save preferences, or use certain features. Disabling optional cookies will not affect the core functionality of the service.
            </p>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-lg font-medium mb-3">6. Do Not Track</h2>
            <p className="opacity-80">
              We respect Do Not Track (DNT) signals sent by your browser. When we detect a DNT signal, we disable any non-essential tracking cookies.
            </p>
          </section>

          {/* Local Storage */}
          <section>
            <h2 className="text-lg font-medium mb-3">7. Local Storage</h2>
            <p className="opacity-80">
              In addition to cookies, we may use browser local storage to store preferences and cached data. This data remains on your device and is not transmitted to our servers. You can clear local storage through your browser&apos;s developer tools or settings.
            </p>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-lg font-medium mb-3">8. Updates to This Policy</h2>
            <p className="opacity-80">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We will update the &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-medium mb-3">9. Contact Us</h2>
            <p className="opacity-80">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p className="opacity-80 mt-2">
              Email: hello@foldingvectors.com
            </p>
          </section>

          {/* GDPR/ePrivacy */}
          <section>
            <h2 className="text-lg font-medium mb-3">10. Legal Compliance</h2>
            <p className="opacity-80">
              This Cookie Policy is designed to comply with the EU ePrivacy Directive (Cookie Law), GDPR, CCPA, and other applicable privacy regulations. We obtain consent for non-essential cookies where required by law and provide clear information about our cookie practices.
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
