# Phase 3: Prompt Synthesis & Domain Formatters - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous smart discuss)

<domain>
## Phase Boundary

User can generate, stream, inspect, copy, and export optimized domain-compliant prompts synthesized from their answers and seed idea.

</domain>

<decisions>
## Implementation Decisions

### 1. Synthesis Route Handler (`/api/generate-prompt`)
- Accepts `{ seed, domain, answers: { questionId, questionText, selectedValues, customText }, previousPrompt? }`.
- System instructions tailored per domain:
  - Image: Rich visual descriptors, lighting, aspect ratios (`--ar 16:9`), camera/lens settings, negative prompt block.
  - Coding: Target language, architecture constraints, input/output schemas, test cases, docstrings.
  - Writing/Marketing: Tone, audience, format, structure, hooks, CTA.
  - Agent/System: Persona, behavioral constraints, markdown output rules, few-shot examples.
- Uses streaming response (`ReadableStream` / Server-Sent Events / raw text stream) for real-time typewriter feedback.

### 2. Prompt Viewer & Formatting UI
- Syntax highlighting / structured sections display (System / Main Prompt / Parameters / Negative Prompt / Explanatory notes).
- One-click copy with toast/badge confirmation.
- Export/Download prompt as `.md` or `.txt`.

</decisions>

<code_context>
## Existing Code Insights
- Phase 2 has built the questionnaire form and answers state ready to submit to `/api/generate-prompt`.
</code_context>

<specifics>
## Specific Requirements
- SYN-01: Synthesizes rich, structured prompts incorporating all answered dimensions and domain standards.
- SYN-02: Displays generated prompt in dedicated `PromptViewer` with copy feedback and download buttons.
- SYN-03: Streams synthesized prompt generation or displays progressive loading states.

</specifics>

<deferred>
## Deferred Ideas
- Multi-round refinement flow ("Keep Building Context") (Phase 4).
- LocalStorage session sidebar (Phase 4).
</deferred>
