import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Folding Vectors',
  description: 'Sign in to Folding Vectors to analyze documents from multiple perspectives.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
