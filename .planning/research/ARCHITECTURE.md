# Architecture Patterns: PromptGenerator

**Domain:** Interactive AI-Driven Prompt Generation & Context Disambiguation Web App
**Researched:** 2026-08-26
**Framework:** Next.js App Router (TypeScript) + React 19 + Tailwind CSS

---

## Recommended Architecture

Fullstack Next.js App Router architecture with client-side session state (LocalStorage) and secure server-side API proxy routing to OpenAI-compatible Xiaomi-MiMo endpoint (`https://token-plan-sgp.xiaomimimo.com/v1`).

```
[Browser Client: Next.js Client Components]
  ├── State Layer: Custom Store / Hook (useChatStore) + `useSyncExternalStore`
  ├── LocalStorage Sync (sessions, current session, prompt draft)
  ├── UI: Category Picker -> Seed Input -> Dynamic Question Form -> Prompt Display -> Refine Flow
  │
  ▼ [HTTP POST with JSON payloads]
[Next.js App Router Route Handlers (/app/api/*)]
  ├── /api/generate-questions (Validates domain + seed -> Calls Xiaomi-MiMo JSON mode)
  ├── /api/generate-prompt (Validates answers + seed -> Calls Xiaomi-MiMo markdown/text mode)
  └── /api/refine-prompt (Validates existing prompt + instructions -> Calls Xiaomi-MiMo)
  │
  ▼ [Server-Side OpenAI Client / Fetch with Process Env]
[Xiaomi-MiMo Endpoint] (https://token-plan-sgp.xiaomimimo.com/v1)
```

---

## Component Boundaries & Responsibilities

| Component / Layer | Responsibility | Communicates With |
|-------------------|----------------|-------------------|
| `app/page.tsx` (Client Shell) | Main layout, sidebar session toggle, current step router | `useSessionStore`, Chat Sidebar, Workspace Panel |
| `components/chat/Sidebar.tsx` | Lists historical sessions, creates new chat, deletes/exports sessions | `useSessionStore`, LocalStorage |
| `components/chat/Workspace.tsx` | Renders active step: (1) Domain & Seed Input, (2) Question Form, (3) Generated Prompt Result, (4) Refinement | `useSessionStore`, API Handlers |
| `components/questionnaire/DynamicForm.tsx` | Renders AI-generated questions (single-select, multi-select, custom "Other" text input) | Form State, Answer Aggregator |
| `components/prompt/PromptViewer.tsx` | Syntax-highlighted output, domain copy presets (Midjourney args, system/user split), copy/export buttons | Clipboard API, Export Utils |
| `lib/api/mimo-client.ts` | Server-only wrapper for Xiaomi-MiMo API calls with timeout, retry, structured JSON schema handling | Route Handlers, Xiaomi-MiMo API |
| `lib/schema/*.ts` (Zod) | Shared runtime type validation for API requests, responses, questions, and stored sessions | Route Handlers, Client Forms, Storage Engine |
| `lib/storage/local-storage.ts` | Type-safe LocalStorage adapter with migration check, quota safeguard, hydration guard | React `useSyncExternalStore` / hooks |

---

## Data Flow

### 1. Dynamic Question Generation
1. User selects domain (`image`, `code`, `writing`, `system_prompt`, `custom`) and enters seed text.
2. Client posts `{ domain, seedPrompt }` to `/api/generate-questions`.
3. Server validates request with `QuestionRequestSchema`.
4. Server queries Xiaomi-MiMo using structured system prompt + `response_format: { type: "json_object" }` (or JSON schema).
5. Server validates model JSON output with `QuestionListSchema` (ensuring 3–6 questions, question types `single` | `multi`, options array).
6. Client receives questions and updates active session state in LocalStorage.

### 2. Prompt Synthesis
1. User answers questions (including free-form text in "Other" inputs).
2. Client posts `{ domain, seedPrompt, answers, systemDirectives }` to `/api/generate-prompt`.
3. Server compiles context into domain-optimized synthesis prompt.
4. Server requests completion from Xiaomi-MiMo.
5. Server returns `{ prompt, metadata: { domain, negativePrompt?, parameters?, instructions? } }`.
6. Client displays result in `PromptViewer` and persists updated turn to LocalStorage.

### 3. Iterative Refinement
1. User enters follow-up clarification or requests additional questions.
2. If asking follow-up questions: client calls `/api/generate-questions` with `{ seedPrompt, previousAnswers, currentPrompt }`.
3. If direct tweak: client calls `/api/refine-prompt` with `{ currentPrompt, instructions }`.
4. Updates saved session history.

---

## Key Design Patterns to Follow

### Pattern 1: Safe SSR / Hydration-Safe LocalStorage Store
**What:** Use React 19 / 18 `useSyncExternalStore` for LocalStorage access to avoid React hydration mismatch errors.
**When:** Any client component reading saved sessions on initial render.
**Example:**
```typescript
// lib/storage/use-session-store.ts
import { useSyncExternalStore } from "react";
import { SessionStorageEngine, SessionState } from "./storage-engine";

export function useSessionStore() {
  const state = useSyncExternalStore(
    SessionStorageEngine.subscribe,
    SessionStorageEngine.getSnapshot,
    SessionStorageEngine.getServerSnapshot
  );

  return {
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,
    activeSession: state.sessions.find(s => s.id === state.activeSessionId),
    createSession: SessionStorageEngine.createSession,
    updateSession: SessionStorageEngine.updateSession,
    deleteSession: SessionStorageEngine.deleteSession,
    setActiveSession: SessionStorageEngine.setActiveSession,
  };
}
```

### Pattern 2: Strict Zod Schema Boundary on AI Outputs
**What:** Enforce runtime schema validation on AI JSON outputs to handle missing fields or schema drift from the LLM.
**When:** In `/api/generate-questions` before returning data to client.
**Example:**
```typescript
// lib/schema/questions.ts
import { z } from "zod";

export const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const QuestionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["single", "multi"]),
  options: z.array(QuestionOptionSchema).min(2),
  allowCustom: z.boolean().default(true),
  customPlaceholder: z.string().optional().default("Other (type custom detail)..."),
});

export const GeneratedQuestionsSchema = z.object({
  domain: z.string(),
  summary: z.string(),
  questions: z.array(QuestionItemSchema).min(2).max(6),
});
```

### Pattern 3: Server-Only LLM Client Wrapper
**What:** Isolate `XIAOMI_MIMO_API_KEY` and base URL calls to `server-only` modules. Never expose API key to browser.
**When:** All LLM invocations.
**Example:**
```typescript
// lib/api/mimo-server.ts
import "server-only";

export async function callMimoChat({
  messages,
  responseFormat,
  temperature = 0.7,
}: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  responseFormat?: { type: "json_object" };
  temperature?: number;
}) {
  const baseUrl = process.env.XIAOMI_MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
  const apiKey = process.env.XIAOMI_MIMO_API_KEY;

  if (!apiKey) throw new Error("XIAOMI_MIMO_API_KEY is not configured.");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.XIAOMI_MIMO_MODEL || "mimo-v1",
      messages,
      temperature,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiMo API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## Anti-Patterns to Avoid

### 1. Direct LLM Calls from Client Components
- **Why bad:** Exposes `XIAOMI_MIMO_API_KEY` in browser network tab; breaches security.
- **Instead:** Call Next.js Route Handlers (`/api/*`) that read environment variables server-side.

### 2. Naive `JSON.parse` on LLM Outputs Without Validation
- **Why bad:** LLM may output markdown code blocks (`\`\`\`json ... \`\`\``) or omit keys, causing client crash.
- **Instead:** Strip markdown code fences, run `JSON.parse`, and validate against `GeneratedQuestionsSchema.safeParse()`. If parse fails, fallback or retry once.

### 3. Storing Unbounded Chat Data in Raw `useEffect` LocalStorage
- **Why bad:** Exceeds 5MB browser quota, causes hydration flickers, loses data on storage events across tabs.
- **Instead:** Use typed `LocalStorageEngine` with max session caps (e.g., 50 latest sessions) and `useSyncExternalStore`.

---

## Scalability & Local Data Considerations

| Metric / Concern | Approach |
|------------------|----------|
| **Session Capacity** | Max 50 sessions stored in LocalStorage. Prune oldest sessions when nearing 3MB. Export to JSON/Markdown for backup. |
| **API Latency / Stream** | For question generation: use JSON mode (synchronous fetch is fast for small JSON). For prompt synthesis: support text streaming via `ReadableStream` or direct text response. |
| **Domain Syntax Expansion** | Store domain prompt templates in static config map (`lib/domains/*.ts`) for zero overhead addition of new domains (Midjourney, Stable Diffusion, Claude Artifacts, SQL, etc.). |

---

## Sources

- Next.js App Router Route Handlers & Server-Only Docs (`next/server`, `server-only`)
- React 19 `useSyncExternalStore` client store subscription pattern
- OpenAI API Compatible Specification for Chat Completions & JSON Mode
