# AEDEN - Style Guide

> Design System for the Multi-Persona Build-in-Public Tool

---

## 1. Brand Identity

### Name & Tagline
- **Name:** Aeden
- **Tagline:** "Stop overthinking posts. Start sharing progress."
- **Voice:** Friendly, empowering, action-oriented

### Logo Usage
- Primary: Aeden wordmark in primary blue
- Icon: "A" lettermark for favicons and app icons
- Min size: 24px height

---

## 2. Color Palette

### Primary Colors
```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Primary Blue */
--primary-600: #2563eb;  /* Primary Hover */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Neutral Colors
```css
--gray-50: #f9fafb;   /* Background Light */
--gray-100: #f3f4f6;  /* Card Background */
--gray-200: #e5e7eb;  /* Borders */
--gray-300: #d1d5db;  /* Disabled */
--gray-400: #9ca3af;  /* Placeholder */
--gray-500: #6b7280;  /* Secondary Text */
--gray-600: #4b5563;  /* Body Text */
--gray-700: #374151;  /* Headings */
--gray-800: #1f2937;  /* Dark Text */
--gray-900: #111827;  /* Darkest */
```

### Semantic Colors
```css
--success-500: #22c55e;  /* Green - Published */
--warning-500: #f59e0b;  /* Amber - Scheduled */
--error-500: #ef4444;    /* Red - Failed */
--info-500: #3b82f6;     /* Blue - Draft */
```

### Dark Mode
```css
--dark-bg: #0f172a;
--dark-surface: #1e293b;
--dark-border: #334155;
--dark-text: #f1f5f9;
--dark-muted: #94a3b8;
```

---

## 3. Typography

### Font Families
```css
/* Headers - Premium serif for editorial feel */
--font-heading: "Tiempos Headline Regular", "Tiempos Headline Regular Placeholder", Georgia, serif;

/* Body - Clean sans-serif for readability */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code - Monospace for technical content */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Loading
```html
<!-- Add to <head> or use next/font -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Tiempos Headline: Self-host or use font service (licensed font) -->
<style>
  @font-face {
    font-family: 'Tiempos Headline Regular';
    src: url('/fonts/TiemposHeadline-Regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
  }
</style>
```

### Type Scale
| Name | Size | Weight | Line Height | Font | Usage |
|------|------|--------|-------------|------|-------|
| `display` | 48px | 400 | 1.1 | Tiempos | Hero headings |
| `h1` | 36px | 400 | 1.2 | Tiempos | Page titles |
| `h2` | 28px | 400 | 1.25 | Tiempos | Section headers |
| `h3` | 22px | 400 | 1.3 | Tiempos | Card titles |
| `h4` | 18px | 400 | 1.35 | Tiempos | Subsections |
| `body-lg` | 16px | 400 | 1.6 | Inter | Lead paragraphs |
| `body` | 14px | 400 | 1.6 | Inter | Body text |
| `body-sm` | 13px | 400 | 1.5 | Inter | Secondary text |
| `caption` | 12px | 500 | 1.4 | Inter | Labels, badges |
| `overline` | 11px | 600 | 1.3 | Inter | Category labels |

### CSS Classes
```css
/* Headings - Tiempos */
.heading-display { font-family: var(--font-heading); font-size: 48px; line-height: 1.1; }
.heading-1 { font-family: var(--font-heading); font-size: 36px; line-height: 1.2; }
.heading-2 { font-family: var(--font-heading); font-size: 28px; line-height: 1.25; }
.heading-3 { font-family: var(--font-heading); font-size: 22px; line-height: 1.3; }
.heading-4 { font-family: var(--font-heading); font-size: 18px; line-height: 1.35; }

/* Body - Inter */
.body-lg { font-family: var(--font-sans); font-size: 16px; line-height: 1.6; }
.body { font-family: var(--font-sans); font-size: 14px; line-height: 1.6; }
.body-sm { font-family: var(--font-sans); font-size: 13px; line-height: 1.5; }
.caption { font-family: var(--font-sans); font-size: 12px; font-weight: 500; }
```

### Font Weights
```css
/* Tiempos only uses Regular (400) - no bold variants */
--font-heading-weight: 400;

/* Inter supports full range */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Typography Pairing Notes
> **Why this combo works:**
> - **Tiempos Headline** = Premium, editorial, builds trust
> - **Inter** = Clean, readable, modern UI standard
> - Contrast between serif headers and sans body creates visual hierarchy

---

## 4. Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Icon gaps, inline spacing |
| `space-3` | 12px | Button padding |
| `space-4` | 16px | Card padding, form gaps |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Component margins |
| `space-8` | 32px | Major sections |
| `space-10` | 40px | Page sections |
| `space-12` | 48px | Large gaps |
| `space-16` | 64px | Hero spacing |

---

## 5. Border Radius

```css
--radius-sm: 4px;    /* Badges, small elements */
--radius-md: 8px;    /* Buttons, inputs */
--radius-lg: 12px;   /* Cards, modals */
--radius-xl: 16px;   /* Large cards */
--radius-2xl: 24px;  /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 6. Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## 7. Components

> **Rule:** All components come from **shadcn/ui** or **21st.dev** (premium shadcn marketplace).  
> No custom component CSS - only theme customization via CSS variables.

### Component Sources

| Source | URL | Use For |
|--------|-----|---------|
| **shadcn/ui** | [ui.shadcn.com](https://ui.shadcn.com) | Core primitives (Button, Card, Input, etc.) |
| **21st.dev** | [21st.dev](https://21st.dev) | Premium components (Charts, Dashboards, etc.) |

### Installation

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Install core components
npx shadcn@latest add button card input textarea badge avatar
npx shadcn@latest add dropdown-menu dialog tabs select separator
npx shadcn@latest add toast sonner skeleton switch label
```

### Required shadcn/ui Components

| Component | Usage in AEDEN |
|-----------|---------------|
| `Button` | Primary actions, form submits |
| `Card` | Post cards, metric cards, settings sections |
| `Input` | Form fields, search |
| `Textarea` | Post content input |
| `Badge` | Post status (Draft, Published, Failed) |
| `Avatar` | User profile, creator bookmarks |
| `DropdownMenu` | User menu, post actions |
| `Dialog` | Modals (confirm publish, delete) |
| `Tabs` | Settings sections, analytics views |
| `Select` | Tone selector, platform picker |
| `Separator` | Section dividers |
| `Toast/Sonner` | Success/error notifications |
| `Skeleton` | Loading states |
| `Switch` | Toggle settings |
| `Label` | Form labels |

### Recommended 21st.dev Components

| Component | URL | Usage |
|-----------|-----|-------|
| **Sidebar** | [21st.dev/sidebar](https://21st.dev) | Dashboard navigation |
| **Stats Card** | [21st.dev/stats](https://21st.dev) | Metric cards with trends |
| **Area Chart** | [21st.dev/charts](https://21st.dev) | Engagement analytics |
| **Data Table** | [21st.dev/table](https://21st.dev) | Post list, analytics |
| **Command** | [21st.dev/command](https://21st.dev) | Command palette (⌘K) |
| **Calendar** | [21st.dev/calendar](https://21st.dev) | Post scheduling |

### Button Variants (shadcn/ui)

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Badge Variants (Post Status)

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="secondary">Draft</Badge>      // Gray
<Badge variant="outline">Scheduled</Badge>    // Outlined
<Badge variant="default">Published</Badge>    // Primary (customize to green)
<Badge variant="destructive">Failed</Badge>   // Red
```

### Custom Badge Colors (globals.css)

```css
/* Extend badge variants for post status */
.badge-published {
  background-color: #dcfce7;
  color: #166534;
  border: none;
}

.badge-scheduled {
  background-color: #fef3c7;
  color: #92400e;
  border: none;
}
```

### Card Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle className="font-heading">Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Form Pattern

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

<div className="space-y-2">
  <Label htmlFor="content">What did you work on?</Label>
  <Textarea 
    id="content"
    placeholder="Built a new feature, fixed bugs..."
    className="min-h-[120px]"
  />
</div>
```

### Theme Customization (globals.css)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
    --border: 217.2 32.6% 17.5%;
  }
}
```

---

## 8. Layout

### Sidebar
- **Width (Expanded):** 260px
- **Width (Collapsed):** 72px
- **Background:** White (light) / `--dark-surface` (dark)
- **Border Right:** 1px solid `--gray-200`

### Header
- **Height:** 64px
- **Background:** White with subtle border-bottom
- **Content:** Search, notifications, user menu

### Content Area
- **Max Width:** 1280px (centered)
- **Padding:** 24px (desktop), 16px (mobile)

### Grid
```css
.dashboard-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

---

## 9. Icons

### Library
Use **Lucide React** for all icons.

### Sizes
| Context | Size |
|---------|------|
| Button icon | 16px |
| Navigation | 20px |
| Card icon | 24px |
| Empty state | 48px |

### Common Icons
| Action | Icon |
|--------|------|
| New Post | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Publish | `Send` |
| Settings | `Settings` |
| Analytics | `BarChart3` |
| GitHub | `Github` |
| Notion | `FileText` |
| Threads | Custom SVG |

---

## 10. Animations (Performance-Optimized)

> **Rule #1:** Only animate `transform` and `opacity` for 60fps.  
> These properties are GPU-accelerated and don't trigger layout/paint.

### Easing Curves (Cubic-Bezier)
```css
/* Use these instead of generic "ease" */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* Snappy deceleration */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* Smooth both ways */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy, playful */
--ease-gentle: cubic-bezier(0.4, 0, 0.2, 1);      /* Subtle, professional */
```

### Transition Durations
```css
--duration-fast: 150ms;   /* Micro-interactions (hover, focus) */
--duration-base: 200ms;   /* Standard transitions */
--duration-slow: 300ms;   /* Complex state changes */
--duration-slower: 400ms; /* Modal/drawer enter */
```

### GPU-Accelerated Transitions
```css
/* ✅ GOOD - Only animates transform/opacity */
.btn {
  transition: 
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: scale(0.98);
}

/* ❌ BAD - Animating layout properties (width, height, margin, padding) */
```

### will-change Hints
```css
/* Apply ONLY to elements that will animate frequently */
.sidebar { will-change: transform; }           /* Collapse/expand */
.modal { will-change: transform, opacity; }    /* Open/close */
.dropdown { will-change: transform, opacity; } /* Show/hide */

/* Remove after animation completes to free GPU memory */
.modal.closed { will-change: auto; }
```

### Keyframe Animations

#### Fade In/Out
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out) forwards;
}
```

#### Scale + Fade (Modals, Dropdowns)
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.modal-enter {
  animation: scaleIn var(--duration-slow) var(--ease-spring) forwards;
}

.modal-exit {
  animation: scaleOut var(--duration-fast) var(--ease-out) forwards;
}
```

#### Slide In (Sidebar, Drawers)
```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideInUp {
  from { 
    opacity: 0;
    transform: translateY(10px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
}

.slide-in-left {
  animation: slideInLeft var(--duration-slow) var(--ease-out) forwards;
}
```

#### Skeleton Loading Pulse
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
```

#### Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

#### Subtle Float (Empty States)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.float {
  animation: float 3s var(--ease-in-out) infinite;
}
```

### Micro-Interactions (Copy-Paste Ready)

#### Button Press
```css
.btn {
  transition: transform var(--duration-fast) var(--ease-out);
}

.btn:active {
  transform: scale(0.97);
}
```

#### Card Hover Lift
```css
.card-interactive {
  transition: 
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Link Underline Grow
```css
.link {
  position: relative;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-500);
  transition: width var(--duration-base) var(--ease-out);
}

.link:hover::after {
  width: 100%;
}
```

#### Input Focus Ring
```css
.input {
  transition: 
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

### Reduced Motion (Accessibility)
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Performance Checklist

| ✅ Do | ❌ Don't |
|-------|---------|
| Animate `transform` | Animate `width`, `height` |
| Animate `opacity` | Animate `margin`, `padding` |
| Use `will-change` sparingly | Apply `will-change` to everything |
| Use `cubic-bezier` curves | Use generic `ease` or `linear` |
| Keep animations under 300ms | Long animations (500ms+) feel sluggish |
| Add `prefers-reduced-motion` | Ignore accessibility preferences |

---

## 11. Responsive Breakpoints

```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Wide screens */
```

### Mobile-First Approach
```css
/* Base: Mobile */
.container { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { padding: 32px; }
}
```

---

## 12. Accessibility

### Focus States
All interactive elements must have visible focus rings:
```css
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Color Contrast
- All text must meet WCAG AA standards
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text (18px+)

### Keyboard Navigation
- All actions reachable via keyboard
- Logical tab order
- Escape to close modals

---

## 13. Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: { 500: '#22c55e' },
        warning: { 500: '#f59e0b' },
        error: { 500: '#ef4444' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
      },
    },
  },
}
```

---

## 14. shadcn/ui Customization

Override shadcn defaults in `globals.css`:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --destructive: 0 84.2% 60.2%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
}
```

---

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | `#3b82f6` |
| Font | Inter |
| Border Radius | 8px (buttons), 12px (cards) |
| Sidebar Width | 260px |
| Max Content | 1280px |
| Icon Library | Lucide React |
