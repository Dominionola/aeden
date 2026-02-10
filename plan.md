# AEDEN - PROJECT STATUS & ROADMAP

> **"Stop overthinking posts. Start sharing progress."**  
> Multi-Persona, Threads-First Build-in-Public Tool

---

## 🎯 CORE VISION

**Market Pivot**: From GitHub-only (80K devs) → Universal work signals (15M+ users)

**Target Users**:
- **Developers** (GitHub commits → code progress)
- **Designers** (Figma updates → design process)
- **Founders** (Notion/Stripe → startup journey)
- **Product Managers** (Linear/Jira → product progress)
- **Content Creators** (YouTube/Substack → content promotion)
- **Anyone** (Manual input → engaging posts)

**Key Differentiator**: Manual input is PRIMARY feature (works for everyone), integrations are OPTIONAL convenience.

---

## 📊 QUICK STATUS

| Phase | Status | Progress | Priority |
|-------|--------|----------|----------|
| **Foundation** | ✅ Complete | 100% | P0 |
| **Dashboard UI** | ✅ Complete | 100% | P0 |
| **Manual Input (KILLER FEATURE)** | 🔄 In Progress | 70% | P0 |
| **Image Upload** | ⏳ Not Started | 0% | P0 |
| **Save to Database** | ⏳ Not Started | 0% | P0 |
| **Threads Publishing** | 🔄 In Progress | 20% | P0 |
| **Post Listing** | ⏳ Not Started | 0% | P0 |
| **Basic Analytics** | ⏳ Not Started | 0% | P0 |
| **GitHub Integration** | ⏳ Not Started | 0% | P1 |
| **Notion Integration** | ⏳ Not Started | 0% | P1 |
| **Persona Training** | ⏳ Not Started | 0% | P1 |

**Overall MVP Progress: ~45%**  
**Target MVP Launch**: 8 weeks from project start (March 15, 2026)

---

## ✅ PHASE 1: FOUNDATION (COMPLETE)

### Project Setup
- [x] Next.js 16 + TypeScript + Tailwind CSS
- [x] shadcn/ui components initialized
- [x] Lucide React icons
- [x] Geist font implemented
- [x] Environment variables configured

### Supabase Integration
- [x] [lib/supabase/client.ts](file:///c:/Users/Olatheruler/Nova/lib/supabase/client.ts) - Browser client
- [x] [lib/supabase/server.ts](file:///c:/Users/Olatheruler/Nova/lib/supabase/server.ts) - Server client with cookies
- [x] [lib/supabase/middleware.ts](file:///c:/Users/Olatheruler/Nova/lib/supabase/middleware.ts) - Auth helpers
- [x] [middleware.ts](file:///c:/Users/Olatheruler/Nova/middleware.ts) - Session refresh

### Database Schema
- [x] [supabase/migrations/001_initial_schema.sql](file:///c:/Users/Olatheruler/Nova/supabase/migrations/001_initial_schema.sql)
  - `work_sources` - Universal integration system (manual, github, notion, figma, linear, youtube, stripe, etc.)
  - `social_accounts` - Threads tokens (Twitter/LinkedIn later)
  - `posts` - All posts with engagement metrics (likes, comments, shares, impressions)
  - `user_preferences` - Persona training (user_type, tone, creator_bookmarks, brand_guidelines, voice_analysis)

### Auth Pages
- [x] [app/(auth)/login/page.tsx](file:///c:/Users/Olatheruler/Nova/app/(auth)/login/page.tsx)
- [x] [app/(auth)/signup/page.tsx](file:///c:/Users/Olatheruler/Nova/app/(auth)/signup/page.tsx)
- [x] Auth layout with styling

### Design System
- [x] [style_guide.md](file:///c:/Users/Olatheruler/Nova/style_guide.md) - Design system (Geist font, Blue primary)
- [x] [tone.md](file:///c:/Users/Olatheruler/Nova/tone.md) - Voice & tone guide
- [x] [app/globals.css](file:///c:/Users/Olatheruler/Nova/app/globals.css) - CSS variables

---

## ✅ PHASE 2: DASHBOARD UI (COMPLETE)

### Layout & Navigation
- [x] [app/dashboard/layout.tsx](file:///c:/Users/Olatheruler/Nova/app/dashboard/layout.tsx) - Sidebar + header
- [x] [components/dashboard/sidebar.tsx](file:///c:/Users/Olatheruler/Nova/components/dashboard/sidebar.tsx) - Navigation with "New Post" CTA
- [x] [components/dashboard/header.tsx](file:///c:/Users/Olatheruler/Nova/components/dashboard/header.tsx) - User menu, notifications

### Dashboard Home
- [x] [app/dashboard/page.tsx](file:///c:/Users/Olatheruler/Nova/app/dashboard/page.tsx)
  - Stats: Posts This Week, Total Impressions, Engagement Rate, Connected Sources
  - Recent Posts list (Draft/Published/Scheduled)
  - Quick Actions: New Post, Connect Source, Train Voice
  - Sources panel: Manual (always active), GitHub, Notion
  - Threads connection prompt

---

## 🔄 PHASE 3: MANUAL INPUT (70% COMPLETE) - PRIORITY 1

> **THIS IS THE KILLER FEATURE.** Works for EVERYONE. No integrations needed. Validates AI quality immediately.

### AI Integration ✅
- [x] [lib/ai/google.ts](file:///c:/Users/Olatheruler/Nova/lib/ai/google.ts) - Gemini 2.0 Flash client
- [x] [lib/ai/anthropic.ts](file:///c:/Users/Olatheruler/Nova/lib/ai/anthropic.ts) - Claude Sonnet client
- [x] [lib/ai/client.ts](file:///c:/Users/Olatheruler/Nova/lib/ai/client.ts) - Unified AI interface
- [x] [app/api/generate/route.ts](file:///c:/Users/Olatheruler/Nova/app/api/generate/route.ts) - Generation endpoint

### Post Creation ✅
- [x] [app/dashboard/posts/new/page.tsx](file:///c:/Users/Olatheruler/Nova/app/dashboard/posts/new/page.tsx) - "What did you work on?" input
- [x] [components/dashboard/post-editor.tsx](file:///c:/Users/Olatheruler/Nova/components/dashboard/post-editor.tsx) - Edit + preview + tone selector

### PENDING (Critical for MVP)

- [x] **Image Upload** - `app/api/upload/route.ts`
  - Upload to Supabase Storage bucket: `post-images`
  - Max 5MB, JPEG/PNG/GIF/WebP
  - Return public URL

- [x] **Save to Database** - `app/api/posts/route.ts`
  - POST: Create draft post
  - PUT: Update post
  - DELETE: Delete post
  - Save `source_type: 'manual'`, `source_data: {manual_input}`

- [ ] **Post Listing** - `app/dashboard/posts/page.tsx`
  - Show all posts (drafts, scheduled, published)
  - Filter by status
  - Search
  - Bulk actions

- [ ] **Edit Post** - `app/dashboard/posts/[id]/page.tsx`
  - Load existing post
  - Edit content, image
  - Update tone
  - Regenerate

---

## ⏳ PHASE 4: THREADS PUBLISHING (PRIORITY 1)

> **Why Threads-first**: FREE API, unlimited posts. Twitter = $100/month. LinkedIn = V2.

### OAuth Flow ✅
- [x] `app/api/threads/auth/route.ts` - Initiate Meta OAuth
- [x] `app/api/threads/callback/route.ts` - Exchange code for tokens
- [x] Store in `social_accounts` table
- [x] `app/dashboard/settings/connections/page.tsx` - Manage connected accounts

### Publishing
- [ ] `lib/threads/client.ts` - Threads API wrapper
  ```typescript
  publishToThreads({
    accessToken,
    userId,
    text,
    imageUrl  // Optional
  })
  ```
- [ ] `app/api/posts/publish/route.ts`
  - Get post from DB
  - Publish to Threads
  - Update post: `status='published'`, `platform_post_id`, `platform_post_url`

### Engagement Sync
- [ ] `app/api/posts/sync-engagement/route.ts`
  - Run every 6 hours
  - Fetch likes, comments, views from Threads
  - Update posts table

---

## ⏳ PHASE 5: BASIC ANALYTICS (PRIORITY 1)

### Dashboard
- [ ] `app/dashboard/analytics/page.tsx`
  - Total posts, total impressions, avg engagement rate
  - Chart: Engagement over time (last 30 days)
  - Top performing posts (by likes)
  - Best posting times

---

## ⏳ PHASE 6: GITHUB INTEGRATION (PRIORITY 2)

> For developers. Turns commits into posts.

### OAuth & Sync
- [ ] `app/api/github/auth/route.ts` - OAuth (scopes: repo, read:user)
- [ ] `app/api/github/callback/route.ts` - Store tokens
- [ ] `lib/github/client.ts`
  - `fetchRepos(accessToken)` - List user's repos
  - `fetchCommits(accessToken, owner, repo)` - Last 20 commits
  - Filter trivial commits (typos, merges, deps)

### Auto-Generation
- [ ] `app/api/github/sync/route.ts`
  - Manual trigger: User clicks "Sync GitHub"
  - Fetch commits since last sync
  - Generate draft posts
  - Save with `source_type='github'`, `source_data={commits}`

### UI
- [ ] `app/dashboard/sources/github/page.tsx`
  - Select repos to track
  - Manual sync button
  - Last synced timestamp

---

## ⏳ PHASE 7: NOTION INTEGRATION (PRIORITY 2)

> For everyone. Universal work tracking.

### OAuth & Sync
- [ ] `app/api/notion/auth/route.ts` - Notion OAuth
- [ ] `lib/notion/client.ts`
  - `fetchDatabases(accessToken)` - List accessible databases
  - `fetchUpdates(accessToken, databaseId)` - Recent page updates

### Auto-Generation
- [ ] `app/api/notion/sync/route.ts`
  - Fetch completed tasks/updated pages
  - Generate drafts
  - Save with `source_type='notion'`

---

## ⏳ PHASE 8: PERSONA TRAINING (PRIORITY 2)

> **Purpose**: AI learns user's voice. Three-layer system.

### Layer 1: Quick Setup (MVP)
- [ ] `app/dashboard/settings/voice/page.tsx`
  - User type selector: Developer, Designer, Founder, Creator, PM, Other
  - Tone picker: Casual, Professional, Technical, Humorous, Inspirational
  - Save to `user_preferences`

### Layer 2: Creator Bookmarks (MVP)
- [ ] Add inspiration sources (URLs)
- [ ] `app/api/persona/bookmark/route.ts`
  - Save to `creator_bookmarks` JSONB
  - Example: `[{url: "threads.net/@levelsio", username: "@levelsio", platform: "threads"}]`
- [ ] AI prompt includes: "Blend storytelling patterns from @levelsio..."

### Layer 3: Voice Analysis (V1.5)
- [ ] `app/api/persona/analyze/route.ts`
  - User uploads past 50 posts
  - Claude analyzes: tone, sentence length, emoji usage, patterns
  - Save to `voice_analysis` JSONB
  - AI matches exactly

### Brand Guidelines (For Teams - V1.5)
- [ ] Textarea: "Always use 'we', max 2 emojis, must mention product name"
- [ ] AI enforces strictly

---

## ⏳ PHASE 9: ONBOARDING (PRIORITY 3)

### 3-Step Flow
- [ ] `app/onboarding/welcome/page.tsx`
  - "What type of work do you do?"
  - [Developer] [Designer] [Founder] [Creator] [Other]
- [ ] `app/onboarding/connect/page.tsx`
  - Show relevant integrations based on user type
  - "Skip for now - I'll enter manually" button (most will choose this)
- [ ] `app/onboarding/first-post/page.tsx`
  - "What did you work on this week?"
  - Generate first post
  - Immediate value in 30 seconds

---

## 📋 ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (Choose one or both)
ANTHROPIC_API_KEY=              # Claude Sonnet 4
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini 2.0 Flash

# Threads (Meta) - PRIORITY 1
THREADS_APP_ID=
THREADS_APP_SECRET=
NEXT_PUBLIC_THREADS_REDIRECT_URI=

# GitHub - Optional for MVP
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Notion - Optional for MVP
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
```

---

## 🎯 MVP SCOPE (8 WEEKS)

### ✅ MUST HAVE (P0 - Week 1-8)
| Feature | Status | Week |
|---------|--------|------|
| Manual input → AI generation | 🔄 70% | Week 3 ✅ |
| Image upload | ⏳ 0% | Week 3-4 |
| Save to database | ⏳ 0% | Week 3-4 |
| Post listing & editing | ⏳ 0% | Week 4 |
| Threads OAuth | ✅ Done | Week 4 |
| Threads publishing | ⏳ 0% | Week 4-5 |
| Basic analytics | ⏳ 0% | Week 7 |
| Engagement sync | ⏳ 0% | Week 7 |
| Tone selector (basic persona) | ✅ Done | Week 7 |

### 📦 SHOULD HAVE (P1 - Week 5-8)
- GitHub integration (optional)
- Notion integration (optional)
- Creator bookmarks (persona)
- Post scheduling UI

### 🚫 WON'T HAVE (Post-MVP)
- ❌ **Twitter/X** (V2 - $100/month API)
- ❌ **LinkedIn** (V2)
- ❌ **Figma** (V1.5)
- ❌ **Linear/Jira** (V2)
- ❌ **YouTube** (V2)
- ❌ **Stripe** (V2)
- ❌ **Automated scheduling**
- ❌ **AI-generated images**
- ❌ **Team features** (V3)

---

## 📅 8-WEEK TIMELINE

```
Week 1-2: Foundation ✅ COMPLETE
- Project setup, Supabase, database schema, auth, dashboard UI

Week 3: Manual Input (PRIORITY 1) 🔄 IN PROGRESS
- Complete image upload
- Save posts to database
- Post listing page

Week 4: Threads Publishing (PRIORITY 1) 🔄 IN PROGRESS
- Meta Developer App setup ✅
- OAuth flow ✅
- Publishing API

Week 5: GitHub Integration (OPTIONAL)
- OAuth
- Commit fetching
- Auto-generation from commits

Week 6: Notion Integration (OPTIONAL)
- OAuth
- Database/page tracking
- Auto-generation from tasks

Week 7: Polish & Analytics
- Engagement sync
- Basic analytics dashboard
- Persona settings (tone + bookmarks)

Week 8: Testing & Launch
- End-to-end testing
- Bug fixes
- Deploy to production
- Beta user testing
```

---

## 🚀 LAUNCH CHECKLIST

### Before Public Launch
- [ ] All P0 features working end-to-end
- [ ] Manual input → Generate → Edit → Publish to Threads ✅
- [ ] Image upload working
- [ ] Post listing & editing working
- [ ] Analytics showing real data
- [ ] Tested on Chrome, Safari, Firefox
- [ ] Tested on iOS and Android
- [ ] Error tracking (Sentry)
- [ ] Analytics (Plausible/Posthog)
- [ ] Custom domain configured
- [ ] HTTPS enforced
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Landing page live
- [ ] Pricing page live
- [ ] Product Hunt submission ready

---

## 💰 PRICING STRATEGY

```
FREE TIER:
- 10 AI posts/month
- Manual input only
- Threads posting
- Basic analytics

STARTER ($15/month):
- 50 AI posts/month
- 1 integration (GitHub OR Notion)
- Image upload
- Engagement analytics

PRO ($29/month):
- Unlimited AI posts
- 3 integrations
- Threads + Twitter (when added)
- Persona training
- Advanced analytics

BUSINESS ($79/month):
- Everything in Pro
- 5 team members
- Brand guidelines
- Priority support
```

---

## 📈 POST-MVP ROADMAP

### V1.5 (Month 3-4)
- Figma integration (designers)
- Voice analysis (learn from past posts)
- AI image suggestions
- Scheduled posting
- Enhanced analytics

### V2 (Month 5-6)
- Twitter integration
- Linear/Jira integration (PMs)
- YouTube integration (creators)
- Stripe milestones (founders)
- LinkedIn integration

### V3 (Month 7+)
- Team features
- Webflow/Bubble integration
- Substack integration
- Brand guidelines enforcement
- White-label option

---

## 🎯 SUCCESS METRICS

### MVP Complete When:
- [ ] User can signup and login
- [ ] User can manually input work
- [ ] AI generates post (< 5 seconds)
- [ ] User can edit post
- [ ] User can upload image
- [ ] User can save draft
- [ ] User can publish to Threads
- [ ] Published post appears in dashboard
- [ ] Engagement metrics sync and display
- [ ] User can select tone (basic persona)
- [ ] Mobile responsive (all pages)
- [ ] No critical bugs

### Launch Success:
- 50+ signups in first week
- 10+ published posts to Threads
- 5+ users post >3 times
- NPS score > 40
- < 5% error rate

---

## 💡 KEY INSIGHTS

1. **Manual input is PRIMARY, not secondary**
   - Works for everyone (developers, designers, founders, creators)
   - Zero setup, immediate value
   - Validates AI quality instantly

2. **Threads-first is SMART**
   - FREE API (unlimited posts)
   - Twitter = $100/month (prohibitive for MVP)
   - Add Twitter in V2 when profitable

3. **Multi-persona market = 100x bigger**
   - Expanded from 80K devs → 15M+ users
   - GitHub is ONE option, not THE product

4. **Persona training = moat**
   - AI learns user's voice over time
   - Gets better with feedback
   - Competitors don't have this

5. **Ship fast, iterate faster**
   - 8 weeks to MVP, not 8 months
   - Launch with bugs
   - Talk to users early

---

## 📝 NEXT IMMEDIATE STEPS

### This Week (Week 3):
- [x] Build `app/api/upload/route.ts` (image upload to Supabase Storage)
- [x] Build `app/api/posts/route.ts` (CRUD operations)
- [x] Build `app/dashboard/posts/page.tsx` (post listing)
- [x] Build `app/dashboard/posts/[id]/page.tsx` (edit post)
- [x] Set Up Meta Developer Account for Threads

### Next Week (Week 4):
- [x] Build Threads OAuth flow
- [ ] Build `lib/threads/client.ts` (Publishing logic pending)
- [ ] Build `app/api/posts/publish/route.ts`
- [ ] Test end-to-end: Manual input → Generate → Publish

---

*Last Updated: February 10, 2026*  
*Project Start: January 20, 2026*  
*Target MVP Launch: March 15, 2026 (8 weeks)*  
*Current Week: Week 4*
