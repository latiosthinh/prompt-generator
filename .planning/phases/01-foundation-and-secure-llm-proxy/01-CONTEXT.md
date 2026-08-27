# Phase 1: Foundation & Secure LLM Proxy - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous smart discuss)

<domain>
## Phase Boundary

Developer and system can execute verified, resilient structured calls to Xiaomi-MiMo backend through secure server route handlers. Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Zod schema validation, and OpenAI SDK proxy configured.

</domain>

<decisions>
## Implementation Decisions

### 1. Framework & Tooling Setup
- Initialize Next.js with App Router, TypeScript, Tailwind CSS v4, and Lucide React.
- Package Manager: `npm` with clean dependency resolution.

### 2. Xiaomi-MiMo Backend Route Handler
- Base URL configured from `XIAOMI_MIMO_BASE_URL` (default: `https://token-plan-sgp.xiaomimimo.com/v1`).
- API Key from `XIAOMI_MIMO_API_KEY` (never exposed to client).
- Model selector defaulting to `XIAOMI_MIMO_MODEL` (fallback `mimo-v1` or configured OpenAI-compatible chat model).
- Server route handler: `/api/chat` or `/api/generate-questions` with error handling and status code normalization.

### 3. JSON Sanitization & Zod Schema Validation
- Helper function `extractJsonPayload(rawText)` to strip markdown code blocks (```json ... ```) and extract clean JSON strings.
- Zod schemas for question payloads (`QuestionSchema`, `OptionSchema`, `ClarificationFormSchema`).
- Graceful error recovery: if LLM returns non-JSON or invalid schema, return clear structured error or fallback structure.

</decisions>

<code_context>
## Existing Code Insights

Greenfield phase. No legacy code.
</code_context>

<specifics>
## Specific Requirements
- INFRA-01: Next.js App Router project configured with latest TypeScript, Tailwind CSS v4, and Lucide React.
- INFRA-02: Server-side Route Handlers securely proxy requests to Xiaomi-MiMo (`https://token-plan-sgp.xiaomimimo.com/v1`).
- QUES-05: Robust JSON parser and Zod validator handle raw model output, stripping markdown fences.

</specifics>

<deferred>
## Deferred Ideas
- Client UI and form rendering (Phase 2).
- Multi-turn refinement flow (Phase 4).
</deferred>
