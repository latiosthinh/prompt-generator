# Phase 4: Multi-Turn Refinement & Local Persistence - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous smart discuss)

<domain>
## Phase Boundary

User can progressively refine existing prompts across multiple turns, adjust prior answers, and safely manage persisted session history offline in the browser via LocalStorage with LRU quota management.

</domain>

<decisions>
## Implementation Decisions

### 1. Progressive Refinement Engine ("Keep Building Context")
- Add `/api/refine-questions` or expand `/api/generate-questions` with `currentPrompt`, previous questions, and previous answers.
- Generates 2-4 deeper, high-precision follow-up questions to drill into subtleties (e.g. specific color palettes, rendering engines, edge cases, error recovery scenarios).
- Allows user to either append new answers or modify existing questionnaire answers and re-synthesize prompt.

### 2. Hydration-Safe LocalStorage Session Store
- Custom store using `useSyncExternalStore` (or safe client-only hook) to prevent SSR hydration mismatches.
- Data model: `Session = { id, title, domain, seed, rounds: [{ questions, answers, prompt }], createdAt, updatedAt }`.
- LRU caching / limit to max 50 sessions to stay well below 5MB LocalStorage quota.

### 3. Session Sidebar & History Management
- Collapsible sidebar with:
  - "New Chat" button
  - Search / filter by title or domain badge
  - Session list with relative timestamp (e.g. "Just now", "2 hours ago")
  - Quick action: Delete session, Rename session, Clear all
- Selecting a session instantly restores full questions, selected answers, and generated prompt.

</decisions>

<code_context>
## Existing Code Insights
- Phases 1, 2, 3 have established the core domain selector, question engine, and streaming prompt viewer.
</code_context>

<specifics>
## Specific Requirements
- REF-01: User can trigger *"Keep Building Context"* to generate follow-up clarifying questions.
- REF-02: User can edit existing answers and re-synthesize prompt variants.
- SESS-01: Automatically persist chat sessions in browser `LocalStorage`.
- SESS-02: Sidebar lists past sessions with domain badges, search, and delete/clear.
- SESS-03: Includes automatic schema versioning and LRU storage pruning.

</specifics>
