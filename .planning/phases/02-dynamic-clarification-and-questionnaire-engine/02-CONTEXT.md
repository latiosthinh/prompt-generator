# Phase 2: Dynamic Clarification & Questionnaire Engine - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous smart discuss)

<domain>
## Phase Boundary

User can pick a domain, input a seed concept, and interactively answer AI-generated clarifying questions with single/multi choices and custom text inputs.

</domain>

<decisions>
## Implementation Decisions

### 1. Domain Selector & Seed Input
- Predefined domains with custom badges: Image Generation (Midjourney/Flux/SD), Tech/Coding, Writing/Copywriting, Agent/System Prompts, General/Custom.
- Seed input with live character counter, example prompts per domain for one-click testing.

### 2. Dynamic Questionnaire UI Components
- Render dynamic list of questions returned by `/api/generate-questions`.
- Support single-select (`radio`) and multi-select (`checkbox`) types.
- Every question includes an *"Other — type in"* custom input option. When typed, auto-checks the "Other" option without losing input focus.
- "Let AI Decide" fast action button on each question to accept default recommendation or skip.

### 3. State Management
- Local component or Zustand state storing question answers `{ [questionId]: string | string[] }` and custom text entries `{ [questionId]: string }`.

</decisions>

<code_context>
## Existing Code Insights
- `src/types/schemas.ts` and `src/app/api/generate-questions/route.ts` already implemented and verified in Phase 1.
</code_context>

<specifics>
## Specific Requirements
- DOM-01: User can select a prompt domain when starting a new chat.
- DOM-02: User can submit seed idea with example suggestions.
- QUES-01: Application generates 3-6 domain-aware clarifying questions.
- QUES-02: Renders single-select and multi-select options.
- QUES-03: Every question provides an editable *"Other — type in"* input that persists user text.
- QUES-04: User can choose *"Let AI decide"* or skip questions.

</specifics>

<deferred>
## Deferred Ideas
- Streaming prompt synthesis (Phase 3).
- LocalStorage chat history sidebar (Phase 4).
</deferred>
