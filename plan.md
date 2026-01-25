# Aeden - Project Status & Roadmap

> **"Stop overthinking posts. Start sharing progress."**  
> Multi-Persona, Threads-First Build-in-Public Tool

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| **Foundation** | ✅ Complete | 100% |
| **Dashboard UI** | 🔄 Needs Revision | 60% |
| **Manual Input** | 🔄 In Progress | 70% |
| **Threads Publishing** | ⏳ Not Started | 0% |
| **GitHub Integration** | ⏳ Not Started | 0% |
| **Notion Integration** | ⏳ Not Started | 0% |
| **Analytics** | ⏳ Not Started | 0% |
| **Persona Training** | ⏳ Not Started | 0% |

**Overall MVP Progress: ~30%**

---

## Phase 1: Foundation ✅

### Project Setup
- [x] Next.js 16 + TypeScript + Tailwind CSS
- [x] shadcn/ui components initialized
- [x] Lucide React icons
- [x] Environment variables configured

### Supabase Integration
- [x] [lib/supabase/client.ts](file:///c:/Users/Olatheruler/Nova/lib/supabase/client.ts) - Browser client
- [x] [lib/supabase/server.ts](file:///c:/Users/Olatheruler/Nova/lib/supabase/server.ts) - Server client with cookies
- [x] [lib/supabase/middleware.ts](file:///c:/Users/Olatheruler/Nova/lib/supabase/middleware.ts) - Auth helpers
- [x] [middleware.ts](file:///c:/Users/Olatheruler/Nova/middleware.ts) - Session refresh

### Database Schema
- [x] [supabase/migrations/001_initial_schema.sql](file:///c:/Users/Olatheruler/Nova/supabase/migrations/001_initial_schema.sql)
  - `work_sources` - Integration configs
  - `social_accounts` - Threads/Twitter tokens  
  - `posts` - All user posts (with analytics: likes, comments, shares, impressions)
  - `user_preferences` - Persona settings (tone, bookmarks, brand guidelines)

### Auth Pages
- [x] [app/(auth)/login/page.tsx](file:///c:/Users/Olatheruler/Nova/app/(auth)/login/page.tsx)
- [x] [app/(auth)/signup/page.tsx](file:///c:/Users/Olatheruler/Nova/app/(auth)/signup/page.tsx)
- [x] Auth layout with styling

---

## Phase 2: Dashboard UI 🔄

> ⚠️ **NEEDS REVISION**: Current dashboard has e-commerce metrics (Page Views, $446.7K) copied from Shopeers reference. Must be updated to show Aeden-relevant metrics.

### Layout & Navigation ✅
- [x] [app/dashboard/layout.tsx](file:///c:/Users/Olatheruler/Nova/app/dashboard/layout.tsx) - Sidebar + header layout
- [x] [components/dashboard/sidebar.tsx](file:///c:/Users/Olatheruler/Nova/components/dashboard/sidebar.tsx) - White sidebar, blue active states
- [x] [components/dashboard/header.tsx](file:///c:/Users/Olatheruler/Nova/components/dashboard/header.tsx) - User menu, actions

### Dashboard Home - NEEDS UPDATE
- [x] Basic layout and card structure
- [ ] **Replace metrics** with Aeden-relevant stats:
  - Posts This Week (not "Page Views")
  - Total Impressions (from Threads)
  - Engagement Rate (likes + comments / impressions)
  - Connected Sources (GitHub, Notion, etc.)
- [ ] **Recent Posts** table with actual post data
- [ ] **Quick Actions**: "Create Post" prominent CTA
- [ ] Remove: "$446.7K", "Visitors", "Click" (e-commerce metrics)
- [ ] Remove: "Most Active Days" bar chart (not MVP)
- [ ] Remove: "Return Visitor Rate" donut (not relevant)

### Design System ✅
- [x] [style_guide.md](file:///c:/Users/Olatheruler/Nova/style_guide.md) - Design documentation
- [x] [app/globals.css](file:///c:/Users/Olatheruler/Nova/app/globals.css) - CSS variables
- [x] [tone.md](file:///c:/Users/Olatheruler/Nova/tone.md) - Voice & messaging

---

## Phase 3: Manual Input 🔄

### AI Integration ✅
- [x] [lib/ai/google.ts](file:///c:/Users/Olatheruler/Nova/lib/ai/google.ts) - Gemini 2.0 Flash client
- [x] [lib/ai/anthropic.ts](file:///c:/Users/Olatheruler/Nova/lib/ai/anthropic.ts) - Claude Sonnet client
- [x] [lib/ai/client.ts](file:///c:/Users/Olatheruler/Nova/lib/ai/client.ts) - Unified AI interface
- [x] [app/api/generate/route.ts](file:///c:/Users/Olatheruler/Nova/app/api/generate/route.ts) - Generation endpoint

### Post Creation
- [x] [app/dashboard/posts/new/page.tsx](file:///c:/Users/Olatheruler/Nova/app/dashboard/posts/new/page.tsx) - "What did you work on?" input
- [x] [components/dashboard/post-editor.tsx](file:///c:/Users/Olatheruler/Nova/components/dashboard/post-editor.tsx) - Edit + preview + tone selector

### Pending
- [ ] Image upload to Supabase Storage (`app/api/upload/route.ts`)
- [ ] Save post to database (`app/api/posts/route.ts`)
- [ ] Post listing page (`app/dashboard/posts/page.tsx`)
- [ ] Edit existing post (`app/dashboard/posts/[id]/page.tsx`)

---

## Phase 4: Threads Publishing ⏳

### OAuth Flow
- [ ] `app/api/threads/auth/route.ts` - Initiate OAuth
- [ ] `app/api/threads/callback/route.ts` - Store tokens
- [ ] `app/dashboard/settings/connections/page.tsx` - Manage accounts

### Publishing
- [ ] `lib/threads/client.ts` - API wrapper
- [ ] `app/api/posts/publish/route.ts` - Publish to Threads
- [ ] Update post status after publish

---

## Phase 5: GitHub Integration ⏳

- [ ] `app/api/github/auth/route.ts` - OAuth (repo, read:user)
- [ ] `lib/github/client.ts` - Fetch commits
- [ ] `app/api/github/sync/route.ts` - Sync commits → drafts
- [ ] Filter trivial commits ("fix typo", "merge", etc.)

---

## Phase 6: Notion Integration ⏳

- [ ] `app/api/notion/auth/route.ts` - OAuth
- [ ] `lib/notion/client.ts` - Track databases/pages
- [ ] `app/api/notion/sync/route.ts` - Tasks → drafts
- [ ] Notion webhook for real-time sync

---

## Phase 7: Persona Training ⏳

> **Purpose**: Train the AI to generate content in the user's unique voice, based on their type, tone preferences, and creator inspirations.

### Database Model (Already Created)
The `user_preferences` table stores persona data:

```sql
user_preferences (
  user_type: 'developer' | 'designer' | 'founder' | 'creator' | 'pm' | 'other'
  tone: 'casual' | 'professional' | 'technical' | 'humorous' | 'inspirational'
  creator_bookmarks: JSONB  -- Inspiration accounts (e.g., @levelsio)
  brand_guidelines: TEXT    -- Custom voice instructions
  voice_analysis: JSONB     -- AI-analyzed voice patterns
  preferred_ai_model: 'gemini' | 'claude'
)
```

### Voice Settings UI
- [ ] `app/dashboard/settings/voice/page.tsx`
  - User type selector (Developer, Designer, Founder, etc.)
  - Tone slider/picker
  - Creator bookmarks - add URLs to inspirational creators
  - Brand guidelines textarea - custom instructions
  - Preview generated content with current settings

### API Endpoints
- [ ] `app/api/preferences/route.ts` - CRUD user preferences
- [ ] `app/api/persona/bookmark/route.ts` - Add/remove creator bookmarks
- [ ] `app/api/persona/analyze/route.ts` - Analyze bookmarked creators' style

### How Persona Affects Generation
The AI generation prompt includes:
1. **User type** → Adjusts vocabulary and topics
2. **Tone** → Controls formality and style
3. **Creator bookmarks** → AI studies these for style patterns
4. **Brand guidelines** → Direct instructions to the AI

---

## Phase 8: Analytics ⏳

### Engagement Tracking
- [ ] `app/api/cron/sync-engagement/route.ts` - Fetch metrics from Threads
- [ ] `app/dashboard/analytics/page.tsx` - Analytics dashboard
  - Charts: impressions over time
  - Engagement rate trends
  - Best posting times

---

## Phase 9: Onboarding ⏳

### 3-Step Flow
- [ ] `app/onboarding/page.tsx`
  1. "What type of work do you do?" → [Developer] [Designer] [Founder] [Creator] [Other]
  2. "Connect a source" (optional) → Show relevant integrations
  3. "Create your first post" → Immediate value in 30 seconds

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Threads (Meta)
THREADS_APP_ID=
THREADS_APP_SECRET=

# GitHub (Optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Notion (Optional)
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
```

---

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
```

---

## MVP Scope

| Feature | Status | Priority |
|---------|--------|----------|
| Manual input → AI post | 🔄 In Progress | P0 |
| Threads publishing | ⏳ Not Started | P0 |
| Dashboard UI (scoped) | 🔄 Needs Revision | P0 |
| GitHub integration | ⏳ Not Started | P1 |
| Notion integration | ⏳ Not Started | P1 |
| Persona training | ⏳ Not Started | P1 |
| Analytics | ⏳ Not Started | P2 |
| Onboarding flow | ⏳ Not Started | P2 |

### Out of Scope (Post-MVP)
- ❌ Twitter/X (V2 API is paid)
- ❌ Figma, Linear, YouTube integrations
- ❌ Scheduled posting
- ❌ AI-generated images
- ❌ Team/collaboration features

---

## Next Steps

1. **Fix Dashboard** - Replace e-commerce metrics with Aeden-relevant stats (Posts, Impressions, Sources)
2. **Complete Manual Input** - Image upload, save to DB, post listing
3. **Threads OAuth** - Set up Meta Developer App, implement OAuth flow

---

*Last Updated: January 26, 2026*
