export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="text-center px-8 max-w-4xl">
        {/* Logo/Name */}
        <div className="mb-8">
          <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
            Folding Vectors
          </h1>
          <div className="h-1 w-24 bg-blue-500 mx-auto"></div>
        </div>

        {/* Tagline */}
        <p className="text-3xl text-slate-300 mb-6 font-light">
          Fold complexity into clarity
        </p>

        {/* Description */}
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Multi-perspective analysis for important documents.
          <br />
          See any document through investor, legal, strategy, and operational lenses.
          <br />
          Catch what you'd miss with a single viewpoint.
        </p>

        {/* Status */}
        <div className="inline-block bg-slate-800/50 border border-slate-700 rounded-full px-6 py-3 mb-8">
          <p className="text-slate-300 text-sm font-medium">
            🚧 Building in public • Launching Q1 2025
          </p>
        </div>

        {/* CTA */}
        <div>
          <a 
            href="mailto:hello@foldingvectors.com?subject=Early Access Request"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
          >
            Request Early Access
          </a>
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-center gap-6 text-slate-500">
          <a href="https://twitter.com/foldingvectors" target="_blank" className="hover:text-slate-300 transition">
            Twitter
          </a>
          <span>•</span>
          <a href="https://linkedin.com/company/folding-vectors" target="_blank" className="hover:text-slate-300 transition">
            LinkedIn
          </a>
          <span>•</span>
          <a href="https://github.com/foldingvectors" target="_blank" className="hover:text-slate-300 transition">
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}