---
description: Review UI/UX design against best practices and style guide
---

# Design Review Workflow

Use this workflow to review frontend code for design quality, accessibility, and best practices compliance.

## Steps

1. **Load Style Guide Context**
   - Read the project's `style_guide.md` for design tokens, color palette, typography, and component guidelines
   - Ensure all design decisions align with the established design system

2. **Apply Web Design Guidelines**
   - Read the skill: `.agent/skills/vercel-labs-agent-skills/skills/web-design-guidelines/SKILL.md`
   - Fetch latest guidelines from: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
   - Check files against 100+ rules covering:
     - Accessibility (aria-labels, semantic HTML, keyboard handlers)
     - Focus States (visible focus, focus-visible patterns)
     - Forms (autocomplete, validation, error handling)
     - Animation (prefers-reduced-motion, compositor-friendly transforms)
     - Typography (curly quotes, ellipsis, tabular-nums)
     - Images (dimensions, lazy loading, alt text)
     - Performance (virtualization, layout thrashing, preconnect)
     - Dark Mode & Theming

3. **Apply Frontend Design Principles**
   - Read the skill: `.agent/skills/anthropics-skills/skills/frontend-design/SKILL.md`
   - Ensure designs are:
     - Distinctive and memorable (avoid generic AI aesthetics)
     - Using appropriate typography (avoid Inter, Roboto, Arial defaults - use Tiempos Headline per style guide)
     - Implementing proper motion and animations
     - Following the established color theme

4. **Output Findings**
   - Report issues in terse `file:line` format
   - Group by severity: CRITICAL, HIGH, MEDIUM, LOW
   - Include actionable fix recommendations

## Triggers

Use this workflow when:
- "Review my UI"
- "Check accessibility"
- "Audit design"
- "Review UX"
- "Check against best practices"
- Building new dashboard pages
- Creating new components
