# Aeden - System Architecture

> Build-in-Public AI Tool | Technical Architecture & Code Standards

## Overview

Aeden transforms work signals (GitHub commits, Notion tasks, manual input) into engaging Threads posts using AI. This document defines the system architecture and coding standards based on the **Google TypeScript Style Guide**.

---

## Directory Structure

```
aeden/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   ├── posts/
│   │   │   ├── page.tsx          # Post list
│   │   │   └── new/page.tsx      # Create post
│   │   ├── analytics/page.tsx
│   │   ├── sources/page.tsx      # Work sources
│   │   └── settings/
│   │       └── voice/page.tsx    # Persona settings
│   ├── api/                      # API routes
│   │   ├── generate/route.ts     # AI generation
│   │   ├── posts/
│   │   │   ├── route.ts          # CRUD posts
│   │   │   └── publish/route.ts  # Publish to Threads
│   │   ├── threads/
│   │   │   ├── auth/route.ts
│   │   │   └── callback/route.ts
│   │   ├── github/
│   │   │   ├── auth/route.ts
│   │   │   └── sync/route.ts
│   │   ├── notion/
│   │   │   ├── auth/route.ts
│   │   │   └── sync/route.ts
│   │   ├── preferences/route.ts
│   │   └── upload/route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to dashboard
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── dashboard/
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── post-card.tsx
│       ├── post-editor.tsx
│       └── metric-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Session refresh
│   ├── ai/
│   │   ├── google.ts             # Gemini client
│   │   ├── anthropic.ts          # Claude client
│   │   ├── client.ts             # Unified interface
│   │   └── prompts.ts            # Generation prompts
│   ├── threads/
│   │   └── client.ts             # Threads API
│   ├── github/
│   │   └── client.ts             # GitHub API
│   ├── notion/
│   │   └── client.ts             # Notion API
│   └── utils.ts                  # Shared utilities
├── types/
│   ├── database.ts               # Supabase types
│   ├── api.ts                    # API request/response
│   └── index.ts                  # Re-exports
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment variables
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Naming Conventions (Google Style)

### Files & Directories
| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `post-editor.tsx` |
| Pages | `page.tsx` (Next.js) | `app/posts/page.tsx` |
| API Routes | `route.ts` | `app/api/generate/route.ts` |
| Libraries | `kebab-case.ts` | `lib/ai/client.ts` |
| Types | `kebab-case.ts` | `types/database.ts` |

### TypeScript Identifiers
| Type | Convention | Example |
|------|------------|---------|
| Classes | `UpperCamelCase` | `PostEditor` |
| Interfaces | `UpperCamelCase` | `PostData` (no `I` prefix) |
| Type Aliases | `UpperCamelCase` | `GenerateRequest` |
| Functions | `lowerCamelCase` | `generatePost()` |
| Variables | `lowerCamelCase` | `postContent` |
| Constants | `CONSTANT_CASE` | `MAX_POST_LENGTH` |
| Enum Values | `UpperCamelCase` | `PostStatus.Published` |

### Naming Rules
```typescript
// ✅ Good
const errorCount = 0;
const dnsConnectionIndex = 1;
const customerId = "abc123";

// ❌ Bad
const n = 0;              // Meaningless
const nErr = 0;           // Ambiguous
const customerID = "";    // Use customerId
```

---

## Component Architecture

### Server vs Client Components
```
┌─────────────────────────────────────────────────────────┐
│                    Server Components                     │
│  (Default - data fetching, no interactivity)            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Client Components                    │   │
│  │  ("use client" - interactivity, hooks, events)   │   │
│  │                                                   │   │
│  │  • PostEditor (forms, state)                      │   │
│  │  • Sidebar (navigation state)                     │   │
│  │  • MetricCard (animations)                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  • DashboardPage (data fetching)                        │
│  • PostsPage (list rendering)                           │
│  • AnalyticsPage (server-side data)                     │
└─────────────────────────────────────────────────────────┘
```

### Component Pattern
```typescript
// components/dashboard/post-card.tsx
"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/types/database";

interface PostCardProps {
  post: Post;
  onEdit?: (id: string) => void;
}

export function PostCard({ post, onEdit }: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        <Badge>{post.status}</Badge>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
      </CardContent>
    </Card>
  );
}
```

---

## Data Flow

```
┌────────────┐     ┌────────────┐     ┌────────────────┐
│   Client   │────▶│  API Route │────▶│   Supabase     │
│ Component  │     │  (Server)  │     │   Database     │
└────────────┘     └────────────┘     └────────────────┘
      │                   │
      │                   ▼
      │            ┌────────────┐
      │            │   AI APIs  │
      │            │ (Gemini/   │
      │            │  Claude)   │
      │            └────────────┘
      │                   │
      ▼                   ▼
┌────────────────────────────────────┐
│         External Services          │
│  • Threads API (Publishing)        │
│  • GitHub API (Commits)            │
│  • Notion API (Tasks)              │
└────────────────────────────────────┘
```

---

## API Design

### Route Handler Pattern
```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePost } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await generatePost(body);
    
    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate post" },
      { status: 500 }
    );
  }
}
```

### Error Response Format
```typescript
interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

---

## AI Integration

### Unified Client Interface
```typescript
// lib/ai/client.ts
export type AiModel = "gemini" | "claude";

export interface GenerateOptions {
  input: string;
  tone: string;
  model: AiModel;
  creatorBookmarks?: string[];
  brandGuidelines?: string;
}

export async function generate(options: GenerateOptions): Promise<string> {
  if (options.model === "gemini") {
    return generateWithGemini(options);
  }
  return generateWithClaude(options);
}
```

### Model Selection Strategy
| Use Case | Preferred Model | Reason |
|----------|-----------------|--------|
| Default generation | Gemini 2.0 Flash | Speed, cost |
| Complex persona matching | Claude Sonnet | Quality |
| High-volume batch | Gemini | Rate limits |

---

## Database Schema

### Database Schema Rules

#### Modular Migration Files
To facilitate easy copying to the Supabase SQL Editor, migration files should be split by "implementation steps" or logical layers rather than monolithic files.

**Recommended Splitting Structure:**
1.  **Tables**: Base structure (`001a_tables.sql`)
2.  **Indexes**: Performance optimizations (`001b_indexes.sql`)
3.  **RLS Policies**: Security rules (`001c_rls.sql`)
4.  **Triggers/Functions**: Automation & Logic (`001d_triggers.sql`)

This specific order ensures dependencies (tables exist before policies/triggers) are respected when running scripts sequentially.

---

### Tables Overview
```
┌─────────────────┐     ┌─────────────────┐
│   work_sources  │     │  social_accounts│
│─────────────────│     │─────────────────│
│ id              │     │ id              │
│ user_id (FK)    │     │ user_id (FK)    │
│ source_type     │     │ platform        │
│ access_token    │     │ access_token    │
│ is_active       │     │ account_handle  │
└─────────────────┘     └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │    posts    │
              │─────────────│
              │ id          │
              │ user_id(FK) │
              │ content     │
              │ platform    │
              │ status      │
              │ source_type │
              │ likes       │
              │ comments    │
              └─────────────┘
                     │
              ┌──────▼──────────┐
              │ user_preferences│
              │─────────────────│
              │ user_id (FK)    │
              │ user_type       │
              │ tone            │
              │ creator_bookmarks│
              │ brand_guidelines │
              └─────────────────┘
```

### Row Level Security (RLS)
All tables enforce user isolation:
```sql
CREATE POLICY "users_own_data" ON posts
  FOR ALL USING (auth.uid() = user_id);
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GOOGLE_GENERATIVE_AI_API_KEY=
ANTHROPIC_API_KEY=

# Integrations
THREADS_APP_ID=
THREADS_APP_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
```

---

## Error Handling

### Patterns
```typescript
// Use custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
  }
}

// Throw with context
throw new ApiError("Post not found", 404, "POST_NOT_FOUND");
```

### Logging
```typescript
// Structured logging
console.error("Generation failed", {
  userId: user.id,
  input: input.substring(0, 100),
  model,
  error: error.message,
});
```

---


## Testing Strategy

> **See `/testing-workflow` for detailed guidelines on when and how to run tests.**

### Test Organization
```
components/
  ui/
    __tests__/
      button.test.tsx
  dashboard/
    __tests__/
      post-card.test.tsx
app/
  api/
    generate/
      __tests__/
        route.test.ts
lib/
  ai/
    __tests__/
      prompts.test.ts
```

### Unit Tests
**Tools**: Vitest + React Testing Library  
**Run**: `npm run test` (watch mode) or `npx vitest run` (single run)

- AI prompt generation (`lib/ai/prompts.ts`)
- Utility functions (`lib/utils.ts`)
- Type validations
- Component rendering and props handling

### Integration Tests
**Focus**: API routes and database interactions

- API route handlers (`app/api/**/route.ts`)
- Supabase queries (with mocked connections)
- External API mocking (Threads, GitHub, Notion)
- Authentication flows

### E2E Tests
**Tools**: Playwright (future implementation)  
**Focus**: Critical user journeys

- Auth flow (sign up, login, logout)
- Post creation → Publishing to Threads
- GitHub sync workflow
- Persona training flow

### Testing Workflow
1. **During Development**: Run `npm run test` in watch mode
2. **Before Commit**: Run `npx vitest run` to verify all tests pass
3. **Pre-deployment**: Full test suite + build verification
4. **CI/CD**: Automated testing on every push/PR


---

## Performance Considerations

| Area | Strategy |
|------|----------|
| AI Calls | Cache prompts, stream responses |
| Database | Use indexes on `user_id`, `status` |
| Images | Supabase Storage with CDN |
| API Routes | Edge runtime where possible |
| Client | Lazy load dashboard components |

---

## Security Checklist

- [x] RLS enabled on all tables
- [x] API routes check `auth.getUser()`
- [x] Environment variables not exposed to client
- [x] OAuth tokens encrypted at rest
- [x] Rate limiting on AI generation endpoints
- [x] Input sanitization for post content
