# Folding Vectors

Multi-perspective document analysis. Fold complexity into clarity.

## What is Folding Vectors?

It feels good to be right. We gravitate toward perspectives that confirm what we already believe. But when stakes are high, confirmation bias becomes expensive.

Every contract has clauses that favor the other party. Every investment has risks the pitch deck glosses over. Every strategy has blind spots the advocates cannot see.

Folding Vectors forces confrontation with contrarian views. Upload a document, select perspectives that challenge your assumptions, and receive analysis from voices you might otherwise ignore.

If you are looking for frictionless intelligence, think again.

There is no shortcut to expertise and no substitute for judgment. Do not look for an answering machine but a sparring partner for your mind. You still decide. You always will. But you will do it with open eyes.

## Features

- **20+ Built-in Perspectives** - From Investor to Ethicist, Legal Counsel to Devil's Advocate
- **Custom Perspectives** - Create your own analysis perspectives tailored to your needs
- **Synthesis View** - See where perspectives agree and where they clash
- **Professional Export** - Memo-style PDF and Word documents
- **Shareable Links** - Share read-only analysis results with others
- **File Upload** - Support for PDF, DOCX, and TXT files (up to 50,000 characters)
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

### Database Setup

Run the SQL migrations in `supabase/migrations/` in your Supabase SQL Editor:
1. `add_share_token.sql` - Enables shareable analysis links
2. `add_custom_perspectives.sql` - Enables custom user perspectives

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link, Password, Google OAuth)
- **AI**: Anthropic Claude API (Claude Sonnet)
- **PDF Export**: jsPDF
- **Word Export**: docx

## Perspectives

### Built-in Perspectives

Organized into 5 categories:

| Category | Perspectives |
|----------|-------------|
| Business | Investor, Customer, Competitor, Financial Analyst |
| Strategic | Strategy, Innovation, Operations, Risk Manager |
| Compliance | Legal, Regulatory, Privacy, Security |
| Technical | Technical, Data, Systems, Architecture |
| Human | Ethicist, Employee, Skeptic, Devil's Advocate, Historian |

### Custom Perspectives

Create your own perspectives in the "Custom" tab:
- Give it a name (e.g., "Sustainability Expert")
- Write a prompt describing how it should analyze documents
- Output is automatically structured with Summary, Key Insights, Opportunities, Risks, Questions, and Recommendations

## Legal

- [Terms of Service](https://foldingvectors.com/terms)
- [Privacy Policy](https://foldingvectors.com/privacy)
- [Cookie Policy](https://foldingvectors.com/cookies)

## License

MIT

## Contact

- Website: [foldingvectors.com](https://foldingvectors.com)
- Email: hello@foldingvectors.com
- Twitter: [@foldingvectors](https://x.com/foldingvectors)
- LinkedIn: [Folding Vectors](https://linkedin.com/company/folding-vectors/)
- GitHub: [foldingvectors/folding-vectors](https://github.com/foldingvectors/folding-vectors)

