# PromptGenerator

## What This Is

PromptGenerator is an interactive Next.js web application that transforms brief user ideas into detailed, production-ready prompts through dynamic AI-driven clarification questionnaires. It supports multi-domain prompt generation (Image Gen like Midjourney/Flux, Coding, Writing/LLMs, Marketing, Art, System Prompts), asks tailored multi-choice questions with custom "Other" inputs, gathers rich context, and leverages the Xiaomi-MiMo API endpoint (`https://token-plan-sgp.xiaomimimo.com/v1`) to synthesize comprehensive, high-fidelity prompts with iterative refinement.

## Core Value

Turn raw, vague 1-line ideas into rich, precise, structured prompts with zero effort by dynamically asking the right clarifying questions and allowing seamless progressive elaboration.

## User Journey

1. **Category & Intent Selection**: User starts a new chat, selects a domain/field (e.g. Art & Image Gen, Software Development, Copywriting & Marketing, Academic & Research, System Prompt / Agent Persona) or provides custom intent.
2. **Initial Seed Input**: User types initial prompt idea (e.g., *"generate an image of a girl holding a can of Coke"*).
3. **Dynamic Questioning & Disambiguation**: The system contacts Xiaomi-MiMo to analyze the seed and produce 3-6 targeted dynamic questions (e.g. setting/environment, lighting, subject age/ethnicity, coke can condition/condensation, art style/lens choice) with predefined checkboxes/radio buttons PLUS an *"Other — type in"* freeform input for each question.
4. **Prompt Synthesis**: User selects choices, fills inputs, and clicks generate. Xiaomi-MiMo synthesizes an optimized, formatted prompt (with support for domain-specific syntax like negative prompts, parameters `--ar 16:9`, system vs user prompts, etc.).
5. **Iterative Refinement**: User can copy, export, test variations, or click *"Keep Building Context"* to generate follow-up clarifying questions for deeper layers of detail.
6. **Chat History & Persistence**: Sessions and generated prompts are automatically saved locally in browser LocalStorage.

## Tech Stack & Architecture

- **Framework**: Next.js (App Router, latest), React 19, TypeScript
- **Styling & UI**: Tailwind CSS (latest), Lucide React icons, polished modern dark/light UI
- **AI Integration**: Xiaomi-MiMo API (`https://token-plan-sgp.xiaomimimo.com/v1`) via Next.js Route Handlers (`/api/generate-questions`, `/api/generate-prompt`, `/api/refine-prompt`)
- **State & Storage**: Browser `LocalStorage` for zero-friction chat history, session state, and saved prompts
- **Configuration**: `.env` file supporting `XIAOMI_MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1`, `XIAOMI_MIMO_API_KEY`, and model selector

## Requirements

### Validated

(None yet — greenfield project)

### Active

- [ ] Next.js project setup with latest dependencies, Tailwind CSS, TypeScript, and environment config for Xiaomi-MiMo API
- [ ] API proxy / service integration with Xiaomi-MiMo (`https://token-plan-sgp.xiaomimimo.com/v1`) for streaming/structured JSON completions
- [ ] Multi-domain category selector for new chat creation (Art/Image, Tech/Coding, Writing/Marketing, Custom)
- [ ] Dynamic questionnaire engine: parses seed prompt, generates structured questions with single-select, multi-select, and "Other - custom input" fields
- [ ] Prompt synthesis engine: combines answers, context, and selected domain standards into a complete, rich prompt
- [ ] Progressive context builder: iterative refinement flow to add more nuance or follow-up questions
- [ ] Chat session manager with sidebar, local history persistence (LocalStorage), copy to clipboard, and markdown export
- [ ] Responsive, clean, modern UI with polished micro-interactions and error recovery

### Out of Scope

- Multi-tenant cloud user authentication (v1 uses client-side LocalStorage)
- Direct image rendering / executing generated prompts on external GPU clusters (app focuses on prompt engineering & generation)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router (latest) + Tailwind | Fast fullstack development, server-side API proxy for API keys, great DX | Active |
| Xiaomi-MiMo API via `.env` | User requirement (`https://token-plan-sgp.xiaomimimo.com/v1`) | Active |
| Dynamic Question Form with "Other" input | Ensures user can either click quick suggestions or customize specific details | Active |
| LocalStorage for Chat History | Zero config, private, instant offline recall | Active |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

---
*Last updated: 2026-08-26 after initialization*
