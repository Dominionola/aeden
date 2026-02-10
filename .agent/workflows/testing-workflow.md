---
description: Testing workflow and best practices for Aeden project
---

# Testing Workflow

## When to Run Tests

### 1. **During Development** (Continuous)
Run tests in watch mode while coding:
```bash
npm run test
```
- Vitest will automatically re-run tests when you save files
- Provides immediate feedback on breaking changes
- Helps with TDD (Test-Driven Development) if you write tests first

### 2. **Before Committing** (Pre-commit)
Always run tests before committing:
```bash
npx vitest run
```
- Ensures you don't commit broken code
- Quick sanity check (< 5 seconds for small test suites)
- **Recommended**: Set up a git pre-commit hook (see below)

### 3. **Feature Completion** (Pre-PR)
Before marking a feature as complete:
```bash
npm run test        # All unit/integration tests
npm run build       # Verify TypeScript compilation
npm run lint        # Code quality check
```

### 4. **CI/CD Pipeline** (Automated)
Tests should run automatically on:
- Every push to GitHub
- Every pull request
- Before deployment to production

---

## Testing Strategy by Component Type

### UI Components
**Location**: `components/**/__tests__/*.test.tsx`

**What to test:**
- ✅ Component renders without errors
- ✅ Props are handled correctly
- ✅ User interactions (clicks, inputs)
- ✅ Conditional rendering
- ❌ Styling/CSS (use visual regression instead)

**Example:**
```typescript
// components/dashboard/__tests__/post-card.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '../post-card';

describe('PostCard', () => {
  it('displays post status badge', () => {
    const mockPost = { status: 'published', content: 'Test post' };
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('published')).toBeInTheDocument();
  });
});
```

### API Routes
**Location**: `app/api/**/__tests__/*.test.ts`

**What to test:**
- ✅ Authentication checks
- ✅ Input validation
- ✅ Error handling
- ✅ Response formats
- ✅ Database interactions (mocked)

**Example:**
```typescript
// app/api/generate/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/generate', () => {
  it('returns 401 if user not authenticated', async () => {
    const req = new NextRequest('http://localhost/api/generate');
    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});
```

### Utility Functions
**Location**: `lib/**/__tests__/*.test.ts`

**What to test:**
- ✅ Input/output correctness
- ✅ Edge cases (empty, null, undefined)
- ✅ Error handling

---

## Git Hooks (Optional but Recommended)

### Install Husky for Pre-commit Hooks
```bash
npm install -D husky lint-staged
npx husky init
```

### Configure `.husky/pre-commit`
```bash
#!/usr/bin/env sh
npx lint-staged
```

### Configure `package.json`
```json
{
  "scripts": {
    "test": "vitest"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

This will:
- Run ESLint on staged files
- Run tests for files related to your changes
- Block commit if tests fail

---

## Coverage Reports (Future)

To track test coverage:
```bash
npx vitest --coverage
```

This generates a report showing which lines of code are tested.

**Recommended targets:**
- Utility functions: **80%+** coverage
- API routes: **70%+** coverage
- Components: **60%+** coverage

---

## Testing Checklist

When implementing a new feature:

- [ ] Write unit tests for new utility functions
- [ ] Write component tests for new UI components
- [ ] Write integration tests for new API routes
- [ ] Run `npx vitest run` to verify all tests pass
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Run `npm run lint` to ensure code quality
- [ ] Commit changes

---

## Related Workflows

- `/aeden-dev` - Main development workflow
- `/react-best-practices` - React component patterns
- `/supabase-best-practices` - Database testing patterns
