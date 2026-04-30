# Aeden - Context & Work Log

> This file provides context on recent changes and the current state of the project for AI-assisted development.

---

## March 26, 2026 - Google AI SDK Migration

**What was done:**
- Migrated the project from the deprecated `@google/generative-ai` SDK to the new, unified `@google/genai` SDK.
- Updated `tech_stack.md` and `system_arch.md` to reflect the new dependency.
- Re-implemented AI logic in `lib/ai/google.ts` and `lib/ai/file-extractor.ts` to use the new SDK's API, ensuring features like native file extraction for the Knowledge Vault remain functional.
- Created this `context.md` file to track development sessions.