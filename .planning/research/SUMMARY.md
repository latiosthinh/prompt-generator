# Executive Summary: PromptGenerator

**Project:** PromptGenerator  
**Date:** 2026-08-26  
**Confidence:** HIGH  

PromptGenerator is a fullstack web application that transforms vague, single-line concepts into rich, domain-optimized prompts (Image Generation, Coding, Writing/Marketing, System Prompts). The system guides users through an AI-generated dynamic clarifying questionnaire before synthesizing clean, formatted prompt outputs with engine-specific parameters.

The recommended technical architecture pairs Next.js 16 App Router (React 19, TypeScript, Tailwind CSS v4) with an OpenAI-compatible client routing requests to the Xiaomi-MiMo API endpoint (`https://token-plan-sgp.xiaomimimo.com/v1`). Client state relies on browser `localStorage` wrapped in a hydration-safe store (`useSyncExternalStore`), eliminating auth and database overhead for v1.

Core risks center on LLM JSON schema divergence, focus thrashing during questionnaire inputs, and perceived generation latency. These are mitigated via server-side Zod validation with markdown fence stripping, memoized form state with deterministic element IDs, and streamed prompt synthesis via Server-Sent Events.

---

## Key Findings by Area

### 1. Technology Stack (`STACK.md`)
- **Framework & UI:** Next.js `16.3.3` (App Router), React `19.2.8`, TypeScript `5.8.0`, Tailwind CSS `4.3.3`.
- **AI Integration:** Official `openai` SDK (`^7.5.0`) configured with custom `baseURL: "https://token-plan-sgp.xiaomimimo.com/v1"` and `server-only` proxying.
- **Validation:** `zod` (`^4.4.3`) for dynamic question schema parsing and API input sanitization.
- **State & Storage:** Browser `localStorage` with `useSyncExternalStore` or `zustand` (`^5.0.15`) for zero-latency, local-only session persistence.

### 2. Feature Landscape (`FEATURES.md`)
- **Table Stakes (Must-Have):**
  - Multi-domain selection (Image Gen, Code, Writing/Marketing, System Prompt).
  - 3–6 dynamic clarifying questions with single/multi-choice options.
  - "Other" freeform text inputs for every question.
  - Formatted prompt synthesis (separated system/user directives, negative prompts, CLI flags like `--ar 16:9`).
  - One-click copy with toast notifications and Markdown/raw text export.
  - LocalStorage chat history and session management.
- **Differentiators (Should-Have):**
  - Progressive elaboration ("Keep Building Context") for multi-turn deep dives.
  - Target engine syntax adapters (Midjourney, Stable Diffusion, Claude XML, ChatGPT).
  - Smart skips ("Let AI Decide") for low-friction answers.
- **Anti-Features (Out of Scope for v1):**
  - Direct image rendering / model execution APIs.
  - Cloud user authentication / SQL databases.
  - Drag-and-drop node graph canvas UI.

### 3. Architecture Patterns (`ARCHITECTURE.md`)
- **Server API Proxy:** Next.js Route Handlers (`/api/generate-questions`, `/api/generate-prompt`, `/api/refine-prompt`) protect API keys and isolate LLM requests.
- **Strict Boundary Validation:** Markdown fence extraction and `Zod.safeParse()` on all AI structured outputs to prevent 500 crashes on format drift.
- **Hydration-Safe Persistence:** `useSyncExternalStore` pattern prevents React hydration mismatches on initial render of stored sessions.

### 4. Critical Pitfalls & Mitigations (`PITFALLS.md`)
- **Schema Divergence / Broken JSON:** Strip markdown backticks before `JSON.parse`; enforce fallback questionnaires if parsing fails.
- **Focus Thrashing in "Other" Inputs:** Assign deterministic keys (`q_${id}`) and memoize question cards to prevent re-render focus loss.
- **Session State Loss:** Model sessions as immutable chains of turns containing question snapshots, answers, and synthesized prompts.
- **High Latency:** Cap question generation tokens (max 300 tokens) and stream prompt synthesis completions.
- **Storage Quota Exceeded:** Implement LRU pruning (cap at 50 sessions) and catch `DOMException` on write.

---

## Implications for Roadmap

### Suggested Phase Structure

1. **Phase 1: Project Scaffold & Secure LLM Proxy**
   - *Rationale:* Sets up the runtime, styling, and server-side connection to the Xiaomi-MiMo endpoint before UI development.
   - *Delivers:* Next.js 16 + Tailwind CSS v4 setup, environment configuration, server-only Xiaomi-MiMo client wrapper, JSON extraction helper, and health check route.
   - *Pitfalls avoided:* API key exposure, unhandled upstream API errors.

2. **Phase 2: Dynamic Questionnaire Engine**
   - *Rationale:* Core differentiator and prerequisite for prompt synthesis.
   - *Delivers:* Domain selector UI, seed input card, `/api/generate-questions` endpoint with Zod validation, dynamic question form (single/multi-select, "Other" input, "Let AI Decide").
   - *Pitfalls avoided:* Focus loss on text inputs, schema parsing errors.

3. **Phase 3: Prompt Synthesis & Domain Formatters**
   - *Rationale:* Produces the primary user deliverable (the optimized prompt).
   - *Delivers:* `/api/generate-prompt` endpoint, streamed output response, `PromptViewer` component with syntax highlights, copy-to-clipboard actions, and Midjourney/Claude/ChatGPT formatting adaptors.
   - *Pitfalls avoided:* Blocked UI on slow completions, domain syntax hallucination.

4. **Phase 4: Multi-Turn Refinement & Local Session Persistence**
   - *Rationale:* Completes full end-to-end workflow and enables retention.
   - *Delivers:* "Keep Building Context" iterative refinement loop, hydration-safe `localStorage` session store with LRU pruning, session sidebar (new, rename, delete, export).
   - *Pitfalls avoided:* State loss across turns, storage quota overflow.

---

## Research Flags & Confidence

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified compatible versions (Next.js 16, React 19, Tailwind v4, official OpenAI SDK). |
| Features | HIGH | Table stakes, differentiators, and explicit anti-features clearly defined. |
| Architecture | HIGH | Clean separation between client UI, Route Handlers, and Xiaomi-MiMo endpoint. |
| Pitfalls | HIGH | Specific mitigations identified for all common LLM and form-state pitfalls. |

### Research Needs
- **Phases 1, 2, 4:** Standard web development patterns (skip deep research).
- **Phase 3:** Low-complexity research on exact prompt syntax rules per target engine (Midjourney v6 parameters, Claude XML structure).

---

## Sources

- Next.js App Router Documentation (`next/server`, Server-Only)
- OpenAI Node SDK v4+ / v7+ Specification & Custom BaseURL Handling
- React 19 `useSyncExternalStore` & Controlled Form Patterns
- Tailwind CSS v4 Setup Guide
- Xiaomi-MiMo API Endpoint Specification (`https://token-plan-sgp.xiaomimimo.com/v1`)
