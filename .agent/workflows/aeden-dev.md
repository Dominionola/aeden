---
description: Main development workflow for Aeden - references all project docs and skills
---

# Aeden Development Workflow

> **ALWAYS run this workflow before making changes to the codebase.**

This workflow ensures all work follows project standards, references documentation, and tracks progress.

---

## Pre-Work Checklist

Before starting any development task, load these reference documents:

// turbo-all

### 1. Load Project Documentation

1. **Read [plan.md](file:///c:/Users/Olatheruler/Nova/plan.md)**
   - Check current project status and progress
   - Identify which phase/task you're working on
   - Update checkboxes as you complete items

2. **Read [style_guide.md](file:///c:/Users/Olatheruler/Nova/style_guide.md)**
   - Follow dashboard design reference (Shopeers-inspired)
   - Use correct color palette (Primary Blue #3b82f6)
   - Apply typography (Tiempos Headline + Inter)
   - Use shadcn/ui components
   - Follow animation patterns

3. **Read [system_arch.md](file:///c:/Users/Olatheruler/Nova/system_arch.md)**
   - Follow file structure conventions
   - Use correct component patterns
   - Reference API route patterns
   - Follow database schema

4. **Read [tech_stack.md](file:///c:/Users/Olatheruler/Nova/tech_stack.md)**
   - Use approved technologies only
   - Follow installation patterns
   - Reference correct package versions

5. **Read [tone.md](file:///c:/Users/Olatheruler/Nova/tone.md)**
   - Apply voice and messaging standards
   - Use preferred vocabulary
   - Avoid forbidden words
   - Follow UI microcopy patterns

### 2. Activate Skills (as needed)

**For UI/Frontend Work:**
```
.agent/skills/vercel-labs-agent-skills/skills/react-best-practices/SKILL.md
.agent/skills/vercel-labs-agent-skills/skills/web-design-guidelines/SKILL.md
.agent/skills/anthropics-skills/skills/frontend-design/SKILL.md
```

**For Database/Supabase Work:**
```
.agent/skills/supabase-agent-skills/skills/postgres-best-practices/SKILL.md
```

---

## During Development

### UI Components
1. Use shadcn/ui components from `@/components/ui/`
2. Follow style_guide.md for colors, spacing, typography
3. Apply Shopeers dashboard reference patterns
4. Use Lucide React icons
5. Ensure responsive design (mobile-first)

### Code Quality
1. TypeScript strict mode - no `any` types
2. Follow React best practices (from skills)
3. Use Server Components by default
4. Mark client components with `"use client"`
5. Handle loading and error states

### Database
1. Follow RLS policies for all tables
2. Use typed queries with generated types
3. Handle errors gracefully
4. Reference schema in migrations folder

---

## Post-Work Checklist

After completing any task:

### 1. Update plan.md

Mark completed items:
- Change `[ ]` to `[x]` for completed tasks
- Change `[ ]` to `[/]` for in-progress tasks
- Update phase progress percentages
- Update "Last Updated" date

### 2. Record Progress (Session Log)

Append to [gemini.md](file:///c:/Users/Olatheruler/Nova/gemini.md):

```markdown
## [DATE] - [SHORT DESCRIPTION]

### What was done:
- [List changes made]

### Files modified:
- [file1.tsx]
- [file2.ts]

### Status:
- [Current state]
- [Any blockers]
```

### 3. Verify

```bash
npm run build    # Check for TypeScript errors
npm run lint     # Check code quality
```

---

## Workflow Triggers

Use this workflow when:
- Starting any development task
- "Build [feature]"
- "Implement [component]"
- "Fix [bug]"
- "Create [page]"
- Resuming work on the project

---

## Quick Reference

| Document | Purpose |
|----------|---------|
| [plan.md](file:///c:/Users/Olatheruler/Nova/plan.md) | Project status & roadmap |
| [style_guide.md](file:///c:/Users/Olatheruler/Nova/style_guide.md) | Design system & UI patterns |
| [system_arch.md](file:///c:/Users/Olatheruler/Nova/system_arch.md) | Architecture & file structure |
| [tech_stack.md](file:///c:/Users/Olatheruler/Nova/tech_stack.md) | Technologies & dependencies |
| [tone.md](file:///c:/Users/Olatheruler/Nova/tone.md) | Voice & messaging standards |
| [gemini.md](file:///c:/Users/Olatheruler/Nova/gemini.md) | Session logs & progress notes |

---

## Related Workflows

- `/design-review` - Review UI against best practices
- `/react-best-practices` - Apply React performance patterns
- `/supabase-best-practices` - Database optimization
