# Feature Landscape: PromptGenerator

**Domain:** Multi-Domain Interactive Prompt Engineering & Clarification System
**Researched:** 2026-08-26
**Confidence:** HIGH

---

## Table Stakes

Features users expect in prompt generation / prompt refinement tools. Missing these makes the tool feel broken or useless.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Domain-Specific Presets / Categories** | Image Gen, Coding, Marketing, System Prompt have totally different syntax & conventions. | Low | Must change system instructions and question strategy per domain (e.g. Midjourney needs aspect ratio/lens, Coding needs stack/runtime/error handling). |
| **Interactive Clarifying Questionnaire** | Core premise: convert vague 1-line input into detailed intent. | Medium | 3–6 generated questions with single/multi-choice options. |
| **"Other" Freeform Field Per Question** | AI option suggestions never cover 100% of user edge cases. | Low | Radio/checkbox lists must include fallback text input to prevent lock-in. |
| **Structured Prompt Synthesis** | Raw text is hard to read; users need clean prompt output with target parameters separated. | Medium | Output system prompt / user prompt / negative prompt / flags (`--ar 16:9`, `--v 6.0`, markdown blocks). |
| **One-Click Copy to Clipboard** | Primary user goal is pasting prompt into destination tool (Midjourney, ChatGPT, Claude, IDE). | Low | Include visual toast feedback on copy. |
| **Session / History Persistence (LocalStorage)** | Losing generated prompts on page reload destroys trust. | Low | Store chat sessions, Q&A state, and outputs locally without auth wall. |
| **Markdown / Code Block Export** | Users need formatted exports for files or team sharing. | Low | Export as `.md` or raw text. |
| **Error Handling & Retry on Bad JSON** | LLM outputs for questionnaires can sometimes fail schema validation. | Medium | Auto-repair or retry loop with user-visible retry action. |

---

## Differentiators

Features that elevate PromptGenerator above basic static prompt templates or generic LLM chat wrappers.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Progressive Elaboration ("Keep Building Context")** | Allows infinite drill-down. Generates secondary follow-up questions based on previous answers without restarting. | Medium | Deepens prompt nuance (e.g., Round 1: lighting/setting → Round 2: camera lens depth of field/color grade). |
| **Target Tool Syntax Adaptor** | Outputs exact syntax for specific engines (e.g. Midjourney `--ar --s --stylize`, Stable Diffusion weights `(masterpiece:1.2)`, Claude XML tags `<context>`, ChatGPT Markdown). | Medium | Switch target syntax on the fly without re-answering questions. |
| **Prompt Breakdown / Explanation View** | Shows *why* parts of the prompt were constructed (e.g. "Added negative prompt for chromatic aberration because lens choice was vintage 35mm"). | Low | Teaches prompt engineering principles to user. |
| **Prompt Variation Generator** | Produces 2-3 stylistic variations (e.g. Minimalist, Hyper-detailed, Creative) from the same answers. | Low | Gives user instant creative options in one turn. |
| **Token / Parameter Estimate & Warning** | Warns if prompt exceeds context limits or contains contradictory instructions. | Low | Useful for complex System Prompts and LLM workflows. |
| **Question Answer Skips / Smart Defaults** | User can choose "Let AI Decide" on questions they don't care about, speeding up flow. | Low | Essential for low-friction user experience. |

---

## Anti-Features

Features to explicitly NOT build. These cause bloat, infrastructure complexity, or scope creep without serving core value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Direct Image Rendering / Model Execution** | Requires expensive GPU backend, API keys for Midjourney/Flux/OpenAI DALL-E, massive latency, and billing complexity. | Focus purely on generating superior prompt text; provide instant copy button. |
| **Cloud User Auth & Database Backend (v1)** | Adds Supabase/PostgreSQL/NextAuth setup, login walls, GDPR/privacy overhead, and onboarding friction. | Use browser `LocalStorage` for zero-friction instant offline session management. |
| **Complex Visual Drag-and-Drop Node Workflow** | Over-engineers a simple clarification workflow into slow, clunky canvas UI (like ComfyUI). | Use fast, clean conversational Q&A wizard UI. |
| **Social Feed / Public Prompt Sharing Network** | High moderation overhead, DB costs, spam vectors, premature optimization before product-market fit. | Allow clean Markdown/JSON file export or shareable URL hashes if needed later. |
| **Custom Fine-Tuning or LoRA Training Management** | Completely different domain and infra requirement. | Include LoRA syntax tags in generated prompts (`<lora:name:0.8>`) without managing files. |

---

## Feature Dependencies

```
[Domain Selection] ──> [Seed Input] ──> [API Question Generator]
                                                │
                                                ▼
                                    [Interactive Question Form]
                                     (Single/Multi + "Other")
                                                │
                                                ▼
                                    [Prompt Synthesis Engine]
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
            [Structured Output View]                     [Iterative Refinement]
            - Markdown / Copy blocks                     - "Keep Building Context"
            - Tool syntax flags                          - Follow-up Q&A
                          │                                           │
                          └─────────────────────┬─────────────────────┘
                                                ▼
                                   [LocalStorage Session Store]
```

---

## MVP Recommendation

### Prioritize for v1:
1. **Multi-Domain Selector**: Art/Image, Code, Writing/Marketing, System Prompt.
2. **Dynamic Questionnaire Engine**: 3–6 targeted questions with single/multi choices + "Other" text input + "Let AI Decide" option.
3. **Structured Prompt Synthesizer**: Output formatted prompt, system vs user instructions, parameters (`--ar`, negative prompt, etc.).
4. **Iterative Refinement Flow**: "Keep Building Context" button to ask follow-up questions.
5. **Session Management**: Sidebar with LocalStorage persistence, session renaming, deletion, and one-click copy.
6. **Robust Schema Recovery**: Graceful handling of Xiaomi-MiMo response formatting.

### Defer to v2+:
- **Target Syntax Switcher Matrix**: Generating 5 different engine outputs simultaneously.
- **Prompt Token Counter & Linter**: Advanced context budget warnings.
- **Export to URL hash**: Stateless prompt sharing via link.

---

## Sources

- Domain analysis of prompt engineering tools (PromptBase, Midjourney Helper, Anthropic Prompt Generator, OpenAI Prompt Optimizer)
- Project specification in `.planning/PROJECT.md`
- Next.js 15+ / React 19 architecture patterns for conversational wizards
