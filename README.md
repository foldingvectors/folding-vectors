# Folding Vectors

Multi-perspective document analysis. Fold complexity into clarity.

## What is Folding Vectors?

Folding Vectors analyzes documents from multiple professional perspectives simultaneously. Upload a contract, investment memo, or strategy document and receive analysis from viewpoints you might otherwise ignore: the skeptic, the ethicist, the adversary, the regulator.

The goal is not to change your mind. It is to ensure that when you decide, you decide with open eyes.

## Features

- **20+ Perspectives** - From Investor to Ethicist, Legal Counsel to Devil's Advocate
- **Synthesis View** - See where perspectives agree and where they clash
- **Professional Export** - Memo-style PDF and Word documents
- **File Upload** - Support for PDF, DOCX, and TXT files
- **Dark/Light Mode** - Clean black and white aesthetic

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Anthropic API key

### Environment Variables

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude API
- **PDF Export**: jsPDF
- **Word Export**: docx

## Perspectives

Perspectives are organized into 5 categories:

| Category | Perspectives |
|----------|-------------|
| Business | Investor, Customer, Competitor, Financial Analyst |
| Strategic | Strategy, Innovation, Operations, Risk Manager |
| Compliance | Legal, Regulatory, Privacy, Security |
| Technical | Technical, Data, Systems, Architecture |
| Human | Ethicist, Employee, Skeptic, Devil's Advocate, Historian |

## License

MIT

## Contact

- Website: [foldingvectors.com](https://foldingvectors.com)
- Email: hello@foldingvectors.com
- Twitter: [@foldingvectors](https://x.com/foldingvectors)
- LinkedIn: [Folding Vectors](https://linkedin.com/company/folding-vectors/)
