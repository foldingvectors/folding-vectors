# Changelog

All notable changes to Folding Vectors will be documented in this file.

## [0.3.0] - 2026-02-01

### Added
- Brutalist homepage design with bold typography and animations
- Scrolling marquee with perspective names
- Rename analysis feature from results page and dashboard
- In-app confirmation modals (replacing browser dialogs)
- EditIcon component for rename buttons

### Changed
- Homepage manifesto text updated
- Feature cards now use text headers (EXPAND, COMPARE, SHARE) instead of numbers
- PerspectiveSelector completely rewritten with fixed-height layout for smooth UX
- Removed category descriptions from perspective selector tabs
- Footer layout improved for mobile responsiveness
- All buttons now mobile-friendly with proper wrapping

### Fixed
- PerspectiveSelector vertical height consistency across all category tabs
- Long unbreakable text in analysis titles now properly wraps
- PDF/Word export now includes full synthesis quotes
- Mobile spacing and padding throughout the app

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
