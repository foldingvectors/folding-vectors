import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Folding Vectors - Multi-Perspective Document Analysis",
  description: "Analyze any document through 20+ expert perspectives including investor, legal, strategy, and more. Get AI-powered insights from multiple viewpoints.",
  keywords: ["document analysis", "AI analysis", "multi-perspective", "investor analysis", "legal review", "strategy analysis", "due diligence"],
  authors: [{ name: "Folding Vectors" }],
  creator: "Folding Vectors",
  publisher: "Folding Vectors",
  metadataBase: new URL("https://foldingvectors.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://foldingvectors.com",
    siteName: "Folding Vectors",
    title: "Folding Vectors - Multi-Perspective Document Analysis",
    description: "Analyze any document through 20+ expert perspectives. Get AI-powered insights from investor, legal, strategy, and other viewpoints.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Folding Vectors - Multi-Perspective Document Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Folding Vectors - Multi-Perspective Document Analysis",
    description: "Analyze any document through 20+ expert perspectives. Get AI-powered insights from multiple viewpoints.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>

        <Analytics />

      </body>
    </html>
  );
}
