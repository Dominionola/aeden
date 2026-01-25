# AEDEN Project - Installed Agent Skills

> Skills directory: `.agent/skills/`

## Installed Skills Overview

### 1. Vercel Labs Agent Skills
**Location:** `.agent/skills/vercel-labs-agent-skills/`

| Skill | Description | Usage |
|-------|-------------|-------|
| **react-best-practices** | 57 rules across 8 categories for React/Next.js performance | Writing, reviewing, or refactoring React code |
| **web-design-guidelines** | 100+ UI rules for accessibility, performance, UX | UI reviews, accessibility audits |
| **vercel-deploy-claimable** | Deploy apps to Vercel from agent | Deploying to production |

### 2. Anthropics Skills
**Location:** `.agent/skills/anthropics-skills/`

| Skill | Description | Usage |
|-------|-------------|-------|
| **frontend-design** | Create distinctive, production-grade frontends | Building UI components, pages, dashboards |
| **brand-guidelines** | Brand consistency and identity | Maintaining brand coherence |
| **mcp-builder** | Build MCP servers | Creating integrations |
| **web-artifacts-builder** | Create web artifacts | Generating HTML/CSS/JS |
| *...and 270+ more* | Various development and productivity skills | See full list in skills directory |

### 3. Supabase Agent Skills
**Location:** `.agent/skills/supabase-agent-skills/`

| Skill | Description | Usage |
|-------|-------------|-------|
| **postgres-best-practices** | Database optimization, security, schema design | SQL queries, migrations, RLS policies |

---

## Available Workflows

### `/aeden-dev` ⭐ (Main Workflow)
Main development workflow that references ALL project documentation and activates relevant skills.

**Always run before major development work.**

**References:**
- `plan.md` - Project status & roadmap
- `style_guide.md` - Design system
- `system_arch.md` - Architecture
- `tech_stack.md` - Technologies
- `tone.md` - Voice standards
- `gemini.md` - Session logs

**Triggers:** Starting any development task, "Build [feature]", resuming work

### `/design-review`
Reviews UI code against web interface guidelines and project style guide.

**Triggers:** "Review my UI", "Check accessibility", "Audit design"

### `/react-best-practices`
Applies React/Next.js performance patterns from Vercel Engineering.

**Triggers:** Writing components, data fetching, performance optimization

### `/supabase-best-practices`
Applies database best practices for Postgres and Supabase.

**Triggers:** SQL queries, schema design, RLS policies, migrations

---

## Quick Reference

```bash
# Design review
/design-review

# React performance check
/react-best-practices

# Database optimization
/supabase-best-practices
```

## Integration with Style Guide

All skills reference the project's `style_guide.md` for:
- Color palette (Primary Blue #3b82f6)
- Typography (Tiempos Headline + Inter)
- Component sources (shadcn/ui, 21st.dev)
- Animation patterns and timing
- Responsive breakpoints
