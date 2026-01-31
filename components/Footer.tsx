import Link from 'next/link'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`border-t border-[var(--border)] ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-xs opacity-60">
            {currentYear} Folding Vectors. All rights reserved.
          </div>

          {/* Legal Links */}
          <nav className="flex items-center gap-6 text-xs">
            <Link
              href="/terms"
              className="opacity-60 hover:opacity-100 transition"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="opacity-60 hover:opacity-100 transition"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookies"
              className="opacity-60 hover:opacity-100 transition"
            >
              Cookie Policy
            </Link>
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-xs opacity-40 text-center md:text-left">
          Folding Vectors uses AI to generate analyses. Results are not professional advice.
          Always consult qualified professionals for important decisions.
        </div>
      </div>
    </footer>
  )
}
