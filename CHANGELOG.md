# Changelog

All notable changes to Folding Vectors will be documented in this file.

## [0.2.0] - 2025-01-31

### Added
- Landing page for logged-out users with manifesto and feature overview
- 20+ analysis perspectives across 5 categories (Business, Strategic, Compliance, Technical, Human)
- Synthesis view showing agreements and tensions between perspectives
- Numeric scoring system (X/10) for each perspective
- Expandable insights in synthesis view
- Professional memo-style PDF and Word exports
- Synthesis export (PDF and Word)
- File upload support (PDF, DOCX, TXT)
- Dark/light mode toggle with persistence
- Examples dropdown for sample documents
- Social links in footer (LinkedIn, GitHub, X)

### Changed
- Redesigned UI to minimalist black/white aesthetic
- Replaced visual map with synthesis view
- Updated footer with contact information
- Improved perspective selector with category tabs and search

### Fixed
- Perspective hover colors in both light and dark modes
- JSON key capitalization for proper export formatting

## [0.1.0] - 2025-01-30

### Added
- Initial release
- Core analysis engine with Claude API integration
- 3 perspectives: Investor, Legal, Strategy
- Supabase authentication with magic links
- Parallel perspective processing
- Structured results display
- Sample documents for testing
- Copy to clipboard functionality
- Daily usage limits (10 analyses per day)
- User dashboard with analysis history

### Infrastructure
- Registered domain: foldingvectors.com
- Cloudflare DNS and email forwarding
- Deployed to Vercel
