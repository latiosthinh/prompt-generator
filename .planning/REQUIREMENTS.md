# Requirements: PromptGenerator

## Overview

PromptGenerator transforms brief, raw user prompts into comprehensive, high-quality prompts tailored to specific domains (Image Generation, Coding, LLM Prompts, Copywriting, System Prompts). It uses dynamic clarifying questions powered by the Xiaomi-MiMo API, allowing granular customization with single-select, multi-select, and custom "Other" text inputs, followed by iterative refinement and local session persistence.

## v1 Requirements

### Domain & Seed Input
- [ ] **DOM-01**: User can select a prompt domain when starting a new chat (Image Generation, Coding/Tech, Writing/Copywriting, Agent/System Prompts, General/Custom).
- [ ] **DOM-02**: User can submit a seed idea/prompt with real-time character count and fast example suggestions per domain.

### Dynamic Clarification Engine
- [ ] **QUES-01**: Application dynamically generates 3-6 domain-aware clarifying questions based on the user's seed prompt via Xiaomi-MiMo API.
- [ ] **QUES-02**: Questionnaire renders single-select (radio) and multi-select (checkbox) options with clear descriptive tags.
- [ ] **QUES-03**: Every question provides an editable *"Other — type in"* freeform input that persists user text without losing UI focus.
- [ ] **QUES-04**: User can choose *"Let AI decide"* or skip optional questions to accelerate prompt generation.
- [ ] **QUES-05**: Robust JSON parser and Zod validator handle raw model output, automatically stripping markdown fences and recovering from malformed payloads.

### Prompt Synthesis & Presentation
- [ ] **SYN-01**: Synthesizes rich, structured prompts incorporating all answered dimensions, custom inputs, and target domain conventions (e.g., Midjourney parameters, Claude XML tags, Markdown formatting).
- [ ] **SYN-02**: Displays generated prompt in a dedicated `PromptViewer` with syntax highlighting, copy-to-clipboard button with visual feedback, and plain text/markdown download.
- [ ] **SYN-03**: Streams synthesized prompt generation or displays immediate progressive updates with loading state indicators.

### Iterative Refinement & Context Building
- [ ] **REF-01**: User can trigger *"Keep Building Context"* to generate follow-up clarifying questions building on top of previous answers.
- [ ] **REF-02**: User can edit existing answers or adjust specific constraints and re-synthesize prompt variants without starting over.

### Sessions & Local Persistence
- [ ] **SESS-01**: Automatically persists chat sessions, questions, answers, and synthesized prompts in browser `LocalStorage` using a hydration-safe store.
- [ ] **SESS-02**: Sidebar lists past sessions with domain badges, timestamp, seed title, search/filter, and one-click delete/clear.
- [ ] **SESS-03**: Includes automatic schema versioning and LRU storage pruning to keep LocalStorage under safe limits.

### Infrastructure & Configuration
- [ ] **INFRA-01**: Next.js App Router project configured with latest TypeScript, Tailwind CSS, and Lucide React icons.
- [ ] **INFRA-02**: Server-side Route Handlers securely proxy requests to Xiaomi-MiMo (`https://token-plan-sgp.xiaomimimo.com/v1`) using `.env` (`XIAOMI_MIMO_BASE_URL`, `XIAOMI_MIMO_API_KEY`, `XIAOMI_MIMO_MODEL`).

## v2 Requirements (Deferred)
- Preset custom templates saved across sessions by the user.
- Multi-model comparator (compare prompt results across Midjourney vs DALL-E vs Flux syntax).
- Export prompt directly to webhook or external API.

## Out of Scope
- Direct image generation / GPU rendering (focus is prompt engineering).
- Mandatory user login / database backend (LocalStorage satisfies zero-friction offline requirements).

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOM-01 | Phase 2 | Pending |
| DOM-02 | Phase 2 | Pending |
| QUES-01 | Phase 2 | Pending |
| QUES-02 | Phase 2 | Pending |
| QUES-03 | Phase 2 | Pending |
| QUES-04 | Phase 2 | Pending |
| QUES-05 | Phase 1 | Pending |
| SYN-01 | Phase 3 | Pending |
| SYN-02 | Phase 3 | Pending |
| SYN-03 | Phase 3 | Pending |
| REF-01 | Phase 4 | Pending |
| REF-02 | Phase 4 | Pending |
| SESS-01 | Phase 4 | Pending |
| SESS-02 | Phase 4 | Pending |
| SESS-03 | Phase 4 | Pending |
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |

---
*Last updated: 2026-08-26*
