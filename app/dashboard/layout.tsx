import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Folding Vectors',
  description: 'View and manage your document analyses. Access past analyses and insights.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
