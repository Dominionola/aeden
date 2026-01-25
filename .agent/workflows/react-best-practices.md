---
description: Apply React and Next.js performance best practices when building components
---

# React Best Practices Workflow

Use this workflow when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns.

## Steps

1. **Load React Best Practices Skill**
   - Read the skill: `.agent/skills/vercel-labs-agent-skills/skills/react-best-practices/SKILL.md`
   - Reference full compiled document: `.agent/skills/vercel-labs-agent-skills/skills/react-best-practices/AGENTS.md`

2. **Priority Categories to Check**

   ### CRITICAL Priority
   - **Eliminating Waterfalls** (`async-*` rules)
     - Move await into branches where actually used
     - Use Promise.all() for independent operations
     - Start promises early, await late in API routes
     - Use Suspense to stream content
   
   - **Bundle Size Optimization** (`bundle-*` rules)
     - Import directly, avoid barrel files
     - Use next/dynamic for heavy components
     - Load analytics/logging after hydration
     - Use conditional module loading

   ### HIGH Priority
   - **Server-Side Performance** (`server-*` rules)
     - Authenticate server actions like API routes
     - Use React.cache() for per-request deduplication
     - Minimize data passed to client components
     - Restructure components to parallelize fetches

   ### MEDIUM-HIGH Priority
   - **Client-Side Data Fetching** (`client-*` rules)
     - Use SWR for automatic request deduplication
     - Deduplicate global event listeners
     - Use passive listeners for scroll events

   ### MEDIUM Priority
   - **Re-render Optimization** (`rerender-*` rules)
     - Don't subscribe to state only used in callbacks
     - Extract expensive work into memoized components
     - Use primitive dependencies in effects
     - Derive state during render, not effects

3. **Apply Project Style Guide**
   - Reference `style_guide.md` for component patterns
   - Use shadcn/ui components per Section 7
   - Follow animation patterns per Section 10

4. **Output Findings**
   - Report issues grouped by priority (CRITICAL → LOW)
   - Include rule ID (e.g., `bundle-barrel-imports`)
   - Provide before/after code examples when applicable

## Triggers

Use this workflow when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times
- Creating dashboard features
