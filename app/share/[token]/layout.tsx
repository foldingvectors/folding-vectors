import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Analysis - Folding Vectors',
  description: 'View a shared multi-perspective document analysis.',
  openGraph: {
    title: 'Shared Analysis - Folding Vectors',
    description: 'View a shared multi-perspective document analysis.',
    type: 'article',
  },
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
