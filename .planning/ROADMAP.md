# Roadmap: PromptGenerator

## Overview

Transform vague 1-line user inputs into production-ready prompts via dynamic clarifying questionnaires powered by Xiaomi-MiMo API, complete with custom inputs, rich domain formatting, multi-turn refinement, and hydration-safe local persistence.

---

## Phases

- [x] **Phase 1: Foundation & Secure LLM Proxy** - Scaffolds Next.js 16 app with Tailwind CSS v4, secure Xiaomi-MiMo proxy, and robust JSON extraction/Zod schema validation.
- [x] **Phase 2: Dynamic Clarification & Questionnaire Engine** - Delivers domain selection, seed idea submission, dynamic AI questionnaire generation, and interactive form controls.
- [x] **Phase 3: Prompt Synthesis & Domain Formatters** - Delivers streaming prompt synthesis engine, domain syntax adapters, and dedicated prompt viewer with copy/export capabilities.
- [x] **Phase 4: Multi-Turn Refinement & Local Persistence** - Implements progressive context expansion, hydration-safe LocalStorage session store, LRU pruning, and sidebar session management.
- [x] **Phase 5: Media Attachments, Video & Attributes** - Adds drag-and-drop file attachments, video prompt generation domain, reverse prompt deconstruction from files, and per-domain pinned attribute radio presets.

---

## Phase Details

### Phase 1: Foundation & Secure LLM Proxy
**Goal**: Developer and system can execute verified, resilient structured calls to Xiaomi-MiMo backend through secure server route handlers.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, QUES-05
**Success Criteria** (what must be TRUE):
  1. Next.js app builds and runs cleanly with Tailwind CSS v4 and TypeScript.
  2. Server route securely proxies requests to Xiaomi-MiMo endpoint using `.env` configuration without exposing API keys to client.
  3. JSON extraction helper parses raw LLM completions, cleanly strips markdown code fences, and validates payloads against Zod schemas without crashing on malformed output.
**Plans**: TBD

### Phase 2: Dynamic Clarification & Questionnaire Engine
**Goal**: User can pick a domain, input a seed concept, and interactively answer AI-generated clarifying questions with single/multi choices and custom text.
**Depends on**: Phase 1
**Requirements**: DOM-01, DOM-02, QUES-01, QUES-02, QUES-03, QUES-04
**Success Criteria** (what must be TRUE):
  1. User can choose a target domain (Image, Code, Writing, System Prompt, Custom) and submit a seed prompt with character counts and example hints.
  2. System fetches and renders 3-6 targeted dynamic questions with single-select (radio) and multi-select (checkbox) tags based on the seed.
  3. Every question card has a functioning "Other — type in" input that retains focus and value while typing.
  4. User can click "Let AI decide" or skip questions to advance without being blocked.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Prompt Synthesis & Domain Formatters
**Goal**: User can generate, stream, inspect, copy, and export optimized domain-compliant prompts synthesized from their answers.
**Depends on**: Phase 2
**Requirements**: SYN-01, SYN-02, SYN-03
**Success Criteria** (what must be TRUE):
  1. User can trigger prompt generation and see real-time streaming output or responsive loading indicators.
  2. Generated prompt incorporates all user selections, custom "Other" inputs, and domain-specific rules (e.g. Midjourney parameters, Claude XML tags, Markdown structure).
  3. Prompt displays in a syntax-highlighted viewer with one-click copy feedback and markdown/plain text file download.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Multi-Turn Refinement & Local Persistence
**Goal**: User can progressively refine existing prompts across multiple turns and manage persisted session history safely offline in browser.
**Depends on**: Phase 3
**Requirements**: REF-01, REF-02, SESS-01, SESS-02, SESS-03
**Success Criteria** (what must be TRUE):
  1. User can click "Keep Building Context" to receive follow-up clarifying questions building on previous answers and regenerate prompt variants.
  2. User can modify prior answers and re-synthesize prompt without starting a new chat.
  3. Chat sessions, questionnaires, answers, and prompt results persist automatically across browser reloads via hydration-safe LocalStorage.
  4. Sidebar displays past sessions with domain badges, search/filter, rename, and delete actions, with LRU storage pruning enforcing safe quota limits.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Media Attachments, Video & Attributes
**Goal**: User can attach files (drag-drop or picker), generate video prompts, reverse-engineer prompts from attachments, and pin per-domain attributes (ratio, resolution, motion, camera) via radio presets.
**Depends on**: Phase 4
**Requirements**: MEDIA-01, MEDIA-02, VID-01, ATTR-01
**Success Criteria** (what must be TRUE):
  1. User can attach files via file picker or drag-and-drop with image previews and text extraction, within size/count limits.
  2. Video Generation domain is selectable and produces prompts with camera, motion, and cinematic video rules.
  3. User can trigger reverse prompt deconstruction of attached files to populate seed idea and detected attributes.
  4. Per-domain pinned attribute radio presets (aspect ratio, resolution, motion, camera) flow into prompt generation and persist with sessions.
**Plans**: 05-01-PLAN.md (backend/schemas, wave 1), 05-02-PLAN.md (UI/integration, wave 2)
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. Foundation & Secure LLM Proxy | 1/1 | Complete | 2026-08-26 |
| 2. Dynamic Clarification & Questionnaire Engine | 1/1 | Complete | 2026-08-26 |
| 3. Prompt Synthesis & Domain Formatters | 1/1 | Complete | 2026-08-26 |
| 4. Multi-Turn Refinement & Local Persistence | 1/1 | Complete | 2026-08-26 |
| 5. Media Attachments, Video & Attributes | 2/2 | Complete | 2026-08-29 |
