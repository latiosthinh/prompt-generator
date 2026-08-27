# Domain Pitfalls

**Domain:** AI Prompt Generator & Dynamic Questionnaire UI
**Researched:** 2026-08-26
**Confidence:** HIGH

---

## Critical Pitfalls

Mistakes causing rewrites, broken generation flows, or UI failure.

### Pitfall 1: Schema Divergence & Fragile JSON Extraction from LLMs
**What goes wrong:** Next.js Route Handlers fail to parse questionnaire JSON from LLM completions. Returns 500 errors to frontend or crashes UI components expecting strict question/option shapes.
**Why it happens:** Custom or non-OpenAI endpoints (such as Xiaomi-MiMo) often output conversational preambles (`"Here are the clarifying questions:"`), wrap JSON in markdown fences (\`\`\`json ... \`\`\`), leave trailing commas, or use mismatched key names (`options` vs `choices`, `multiSelect` vs `isMultiple`).
**Consequences:** Blank questionnaire screens, broken form rendering, failed generation cycles.
**Prevention:**
- Wrap LLM outputs in robust JSON extractor: strip markdown fences with regex, extract substring between first `{` and last `}`.
- Enforce runtime validation using `Zod` schemas with `.safeParse()`.
- Define fallback recovery: if schema validation fails, attempt JSON fixup or return pre-computed domain-specific fallback questionnaire.
**Detection:** Sentry/console errors with `SyntaxError: Unexpected token`, `ZodError`, or empty question arrays.

### Pitfall 2: Focus Thrashing & Value Erasure in "Other" Custom Inputs
**What goes wrong:** When user selects "Other" and types into freeform input, input loses focus after every character, or custom text disappears when toggling other checkboxes.
**Why it happens:** Dynamic question components generate new random/index-based keys on re-render, or parent component re-renders entire questionnaire tree on single input change without controlled local state.
**Consequences:** Unusable questionnaire form, user frustration, lost inputs.
**Prevention:**
- Assign deterministic `id` to each question and option (e.g., `q_${index}` or hash of question title).
- Isolate question card state into separate memoized components (`React.memo`).
- Store answer state as structured map:
  ```typescript
  type AnswerState = Record<string, { selected: string[]; customValue?: string }>;
  ```
- Synthesize prompt from both `selected` options and `customValue` explicitly.
**Detection:** Input blur after single keypress in "Other" field; React profiler showing full-tree re-renders on keystroke.

### Pitfall 3: State Loss on Iterative Refinement & History Reload
**What goes wrong:** User clicks "Keep Building Context" or revisits saved chat session from LocalStorage; all previous answers, custom text, and question state reset to empty or cause runtime crashes due to outdated storage schema.
**Why it happens:** App state assumes linear single-turn flow; LocalStorage stores incomplete snapshot or deserializes without schema version check.
**Consequences:** Broken multi-turn prompt refinement, wiped user history on minor schema updates.
**Prevention:**
- Model sessions as immutable chain of turns: each turn stores `seedPrompt`, `questionnaireSnapshot`, `answersSnapshot`, and `synthesizedPrompt`.
- Use versioned LocalStorage schema with migration utility on app startup.
- Keep total payload small: store only text/JSON data, not bulky UI objects.
**Detection:** Missing form values on back-navigation; `TypeError: Cannot read properties of undefined` on loading old LocalStorage sessions.

### Pitfall 4: High Latency & Blocked UI in Two-Phase Generation
**What goes wrong:** User enters seed idea and waits 6-12 seconds staring at static spinner; then fills questionnaire and waits another 8-15 seconds for prompt synthesis. User assumes app is broken and abandons.
**Why it happens:** Sequential non-streaming round-trips to remote LLM endpoint with heavy prompt tokens.
**Consequences:** High drop-off rate, poor perceived performance.
**Prevention:**
- Phase 1 (Question Generation): Constrain LLM completion to max 300 tokens (3-5 tight questions). Render skeleton loaders immediately.
- Phase 2 (Prompt Synthesis): Stream output via Server-Sent Events (SSE) or `ReadableStream` into UI with copy button disabled until stream ends.
- Provide instant category suggestions/chips on seed input before network call.
**Detection:** TTFB > 4s on question endpoint; completion latency > 8s without streaming indicators.

---

## Moderate Pitfalls

### Pitfall 5: Domain Syntax Hallucination & Format Bleed
**What goes wrong:** AI generates Midjourney prompts containing markdown code blocks, puts `--ar 16:9` at the start of prompt (where Midjourney ignores it), or mixes coding system prompts with image generation tags.
**Why it happens:** Generic system prompts without strict domain formatting rules for image vs coding vs writing models.
**Prevention:**
- Inject domain-specific formatting constraints into synthesis system prompt (e.g., for Midjourney: comma-separated descriptive clauses, parameters `--v`, `--ar`, `--style` strictly at end; for System Prompts: XML tags `<role>`, `<constraints>`, `<output_format>`).
- Add post-processing cleanup regex to trim illegal prefixes/suffixes.

### Pitfall 6: Context Window Bloat & Repetition in Follow-up Rounds
**What goes wrong:** In round 2 or 3 of refinement, LLM asks duplicate questions or generates prompts that repeat earlier descriptors 4 times.
**Why it happens:** Appends full raw chat transcript blindly to subsequent LLM calls.
**Prevention:**
- Maintain canonical constraint accumulator: merge answers into structured key-value context (`{ style: "cyberpunk", lighting: "volumetric neon", subject: "..." }`) and send consolidated context to synthesis engine.

### Pitfall 7: LocalStorage Quota Overflow (5MB Limit)
**What goes wrong:** `QuotaExceededError` crashes app when user generates many prompts with large questionnaires.
**Why it happens:** Storing dozens of long session histories with raw responses without pruning or size checks.
**Prevention:**
- Implement LRU pruning (keep last 30-50 sessions).
- Catch `DOMException` on `localStorage.setItem` and notify user gracefully.

---

## Minor Pitfalls

### Pitfall 8: Single-Choice vs Multi-Choice Confusion
**What goes wrong:** Questionnaire UI displays checkboxes for mutually exclusive options (e.g., Day vs Night) or radio buttons for combinable traits (e.g., Camera Angle and Lighting).
**Prevention:** Explicit `type: "single" | "multiple"` in schema; render standard accessible radio groups vs checkbox groups accordingly.

### Pitfall 9: Unhandled Third-Party API Key & Rate Limit Errors
**What goes wrong:** Xiaomi-MiMo endpoint returns 401 (bad API key) or 429 (rate limit); UI displays generic "Something went wrong" or hangs indefinitely.
**Prevention:** Inspect API response status in Next.js route handler; return structured error codes (`INVALID_API_KEY`, `RATE_LIMITED`, `UPSTREAM_TIMEOUT`) so frontend can display actionable guidance.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| API Integration & Proxy | JSON parsing failure from non-OpenAI endpoints | Add Zod validator + regex fence stripper in route handler |
| Dynamic Questionnaire UI | Keystroke focus loss on "Other" inputs | Controlled component state + stable option keys |
| Prompt Synthesis Engine | Slow perceived response time | Implement SSE streaming response handler |
| Session & LocalStorage | Quota overflow & schema divergence across versions | Versioned storage schema + LRU cleanup |
| Domain Refinement & Syntax | Midjourney/Coding syntax errors | Dedicated domain prompt templates & post-formatters |

---

## Sources

- Next.js App Router streaming best practices (Vercel AI SDK patterns)
- Zod schema validation for LLM structured outputs
- Production LLM UI patterns (ChatGPT/Midjourney prompt builders)
- MDN Web Docs: Web Storage API quota limits & exception handling
