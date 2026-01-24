# AEDEN - Tech Stack & Dependencies

> Comprehensive list of all technologies, libraries, and tools used in the project for fast installation and management.

## 1. Core Framework
- **Framework:** [Next.js 14+](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Package Manager:** `npm`

## 2. Frontend & UI
- **Component Library:** [shadcn/ui](https://ui.shadcn.com)
- **Premium Components:** [21st.dev](https://21st.dev) (Marketplace)
- **Icons:** [Lucide React](https://lucide.dev)
- **Fonts:**
  - `Inter` (Body/UI) - via `next/font/google`
  - `Tiempos Headline` (Headers) - Local/Licensed `.woff2`
- **Utilities:**
  - `clsx` - Class conditional logic
  - `tailwind-merge` - Class merging (standard with shadcn)
  - `class-variance-authority` - Component variants

## 3. Backend & Database
- **BaaS:** [Supabase](https://supabase.com)
  - Database: PostgreSQL
  - Auth: Supabase Auth (GitHub, Email)
  - Storage: Supabase Storage
- **Client Libraries:**
  - `@supabase/supabase-js` - Core client
  - `@supabase/ssr` - Server-side cookie handling

## 4. AI & Intelligence
- **LLM Provider:** [Anthropic](https://www.anthropic.com)
- **Model:** Claude 3.5 Sonnet (referred to as Sonnet 4 in SOP)
- **SDK:** `@anthropic-ai/sdk`

## 5. Third-Party Integrations (APIs)
- **Meta Threads:** Threads API (v1.0)
- **GitHub:**
  - REST/GraphQL API
  - OAuth App
  - SDK: `octokit` (likely needed for robust integration)
- **Notion:**
  - Notion API
  - SDK: `@notionhq/client`

## 6. Dev Tools & Quality
- **Linting:** ESLint
- **Formatting:** Prettier (recommended)
- **Deployment:** Vercel

## 7. Installation Manifest (Copy-Paste)

### Core & UI
```bash
npx create-next-app@latest . --typescript --tailwind --eslint
# Select: Yes to App Router, No to src directory (optional), Yes to import alias (@/*)

# Initialize shadcn/ui
npx shadcn@latest init

# Install UI Utilities & Icons
npm install lucide-react clsx tailwind-merge class-variance-authority
```

### Supabase
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### AI SDK
```bash
npm install @anthropic-ai/sdk
```

### Integration SDKs
```bash
npm install octokit @notionhq/client
```

### Required shadcn Components (Base Set)
```bash
npx shadcn@latest add button card input textarea badge avatar dropdown-menu dialog tabs select separator toast sonner skeleton switch label
```
