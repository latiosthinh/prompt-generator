import { NextRequest, NextResponse } from 'next/server';
import { mimoClient, MIMO_DEFAULT_MODEL } from '@/lib/mimo';
import {
  GeneratePromptRequestSchema,
  Question,
  UserAnswer,
  PinnedAttributes,
  Attachment,
} from '@/types/schemas';

function getDomainSystemPrompt(domain: string, locale: string = 'vi'): string {
  const d = domain.toLowerCase();
  const isVi = locale === 'vi';

  let domainRules = '';
  if (d.includes('video') || d.includes('video-generation')) {
    domainRules = `### DOMAIN RULES (VIDEO GENERATION):
- Synthesize an ultra-detailed, cinematic video generation prompt tailored for modern AI video engines (Runway Gen-3 Alpha, Kling 1.5, OpenAI Sora, Luma Dream Machine, Pika 2.0).
- Explicitly detail:
  1. Main Subject & Temporal Action: Exact subject description, start state, physical movement progression, micro-expressions, clothing physics.
  2. Camera Trajectory & Movement: Dynamic camera path (Pan, Tilt, Tracking follow, Orbit 360, FPV Drone fly-through, Crane shot), lens focal length, zoom speed.
  3. Pacing, Speed & Dynamics: Frame rate (24fps cinematic, 60fps fluid), playback speed (slow-motion, hyper-lapse, real-time), motion intensity and natural physics.
  4. Environment & Lighting Dynamics: Atmospheric effects (fog, rain, volumetric light shafts), time-of-day progression, reflections, particle systems.
  5. Cinematic Style & Audio/SFX Cues: Color grading, film stock (35mm, IMAX), aesthetic mood, and ambient sound/music cue suggestions if applicable.
- If applicable, format platform-specific CLI parameters or camera tags (e.g. \`--ar 16:9 --motion 5 --camera zoom-in\`).`;
  } else if (d.includes('hình ảnh') || d.includes('image')) {
    domainRules = `### DOMAIN RULES (IMAGE GENERATION):
- Synthesize an ultra-detailed, highly effective image generation prompt (Midjourney v6/v7, DALL-E 3, Stable Diffusion XL/Flux style).
- Include precise specifications for:
  1. Main Subject & Action: Anatomy, pose, expression, clothing/materials, fine details.
  2. Environment & Background: Architecture, weather, depth of field, atmosphere, volumetric lighting.
  3. Lighting & Color Palette: Directional light, color grading, shadows, mood.
  4. Camera, Lens & Rendering: Shot type (macro, wide-angle, telephoto), f-stop, rendering engine (Octane, Unreal Engine 5, 35mm film).
- Provide the Primary Prompt formatted ready for copy-paste in English for maximum AI image generator rendering accuracy.
- If applicable, include recommended negative prompts and CLI parameters (e.g., \`--ar 16:9 --v 6.1 --stylize 250\`).`;
  } else if (d.includes('lập trình') || d.includes('code') || d.includes('tech')) {
    domainRules = `### DOMAIN RULES (CODING & TECH):
- Synthesize a comprehensive, production-grade LLM coding prompt specification.
- Structure logically:
  1. Task & Role: Specific senior engineer persona and core goal.
  2. Tech Stack & Dependencies: Explicit versions, frameworks, and library choices.
  3. Architecture & Functional Requirements: Concrete data flow, API specs, schemas.
  4. Constraints & Non-negotiables: Typing strictness, error handling, performance targets, testing rules.
  5. Output Format: Exact code structure required (clean runnable code, no fluff).`;
  } else if (d.includes('viết') || d.includes('writing') || d.includes('copy')) {
    domainRules = `### DOMAIN RULES (WRITING & COPY):
- Synthesize a high-impact creative/copywriting prompt.
- Detail:
  1. Target Audience Persona & Psychographics.
  2. Core Value Proposition & Message Hook.
  3. Tone of Voice, Cadence, and Reading Level.
  4. Structure, Section Blueprint & Word Count Constraints.
  5. Negative Constraints (clichés to eliminate, jargon to avoid).`;
  } else if (d.includes('agent') || d.includes('system')) {
    domainRules = `### DOMAIN RULES (AGENT & SYSTEM PROMPT):
- Synthesize a robust system prompt for an autonomous AI agent or structured LLM workflow.
- Include:
  1. System Identity, Mission & Scope boundaries.
  2. Core Capabilities & Step-by-Step Reasoning Flow.
  3. Tool Calling & Input/Output Contracts (strict JSON/schema enforcement).
  4. Guardrails, Edge-Case Handling & Fallback Behavior.
  5. Self-Correction & Verification Checklist.`;
  } else {
    domainRules = `### DOMAIN RULES (GENERAL / MULTI-PURPOSE):
- Synthesize a clear, highly structured master prompt.
- Include:
  1. Persona & Objective.
  2. Background Context.
  3. Explicit Instructions & Step-by-Step Methodology.
  4. Constraints, Quality Criteria & Expected Output Format.`;
  }

  const langDirective = isVi
    ? 'All synthesized prompt content, instructions, parameters, guidelines, criteria, and explanations MUST BE ENTIRELY WRITTEN IN VIETNAMESE (100% tiếng Việt). For image and video generation prompts, provide the main copy-paste ready prompt in English or dual-language (English + Vietnamese explanation) for maximum AI engine rendering accuracy, but all explanations, breakdowns, and parameters MUST be in Vietnamese.'
    : 'Synthesize the output entirely in English.';

  return `You are a world-class Prompt Engineer and Prompt Synthesizer.
Your goal is to transform the user's initial seed idea, pinned domain attributes, and answered clarification questions into a master-class, production-ready final prompt.
${langDirective}

${domainRules}

### FORMATTING GUIDELINES:
- Output clean, beautifully formatted Markdown.
- Structure with clear headers, bullet points, and code blocks where appropriate.
- Make the primary generated prompt distinct and effortless to copy or use directly.
- Include a brief section explaining why key design choices were made based on the user's answers and pinned attributes.`;
}

function formatUserContext(
  seed: string,
  domain: string,
  questions?: Question[],
  answers?: UserAnswer[],
  pinnedAttributes?: PinnedAttributes,
  attachments?: Attachment[],
  additionalContext?: string
): string {
  let context = `## Domain: ${domain}\n`;
  context += `## Initial Seed Idea:\n${seed}\n\n`;

  if (pinnedAttributes && Object.keys(pinnedAttributes).length > 0) {
    context += `## Pinned Domain Attributes:\n`;
    if (pinnedAttributes.aspectRatio) context += `- Aspect Ratio: ${pinnedAttributes.aspectRatio}\n`;
    if (pinnedAttributes.resolution) context += `- Resolution / Quality: ${pinnedAttributes.resolution}\n`;
    if (pinnedAttributes.motion) context += `- Motion Dynamics: ${pinnedAttributes.motion}\n`;
    if (pinnedAttributes.camera) context += `- Camera Movement: ${pinnedAttributes.camera}\n`;
    if (pinnedAttributes.stylePreset) context += `- Style Preset: ${pinnedAttributes.stylePreset}\n`;
    if (pinnedAttributes.fps) context += `- Frame Rate: ${pinnedAttributes.fps}\n`;
    if (pinnedAttributes.lighting) context += `- Lighting: ${pinnedAttributes.lighting}\n`;
    context += '\n';
  }

  if (attachments && attachments.length > 0) {
    context += `## Attached References (${attachments.length} files):\n`;
    attachments.forEach((att, idx) => {
      context += `- File ${idx + 1}: ${att.name} (${att.type})\n`;
      if (att.textContent) {
        context += `  Extracted Text: "${att.textContent.slice(0, 1000)}"\n`;
      }
    });
    context += '\n';
  }

  if (questions && questions.length > 0) {
    context += `## Clarification Q&A / Refinements:\n`;
    const answerMap = new Map((answers || []).map((a) => [a.questionId, a]));

    questions.forEach((q, idx) => {
      const ans = answerMap.get(q.id);
      const selectedLabels: string[] = [];

      if (ans && ans.selectedOptionIds && ans.selectedOptionIds.length > 0) {
        ans.selectedOptionIds.forEach((optId) => {
          const opt = q.options.find((o) => o.id === optId);
          if (opt) selectedLabels.push(opt.label);
        });
      }

      let answerText = '';
      if (selectedLabels.length > 0) {
        answerText += selectedLabels.join(', ');
      }
      if (ans && ans.customText && ans.customText.trim()) {
        answerText += answerText ? ` (Custom: ${ans.customText.trim()})` : ans.customText.trim();
      }

      context += `Question ${idx + 1}: "${q.text}"\n`;
      context += `User Answer: ${answerText || 'Auto-decide by AI (pick optimal value)'}\n\n`;
    });
  }

  if (additionalContext) {
    context += `## Additional Context / Notes:\n${additionalContext}\n`;
  }

  return context;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = GeneratePromptRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const {
      seed,
      domain,
      questions,
      answers,
      pinnedAttributes,
      attachments,
      additionalContext,
      locale = 'vi',
    } = parseResult.data;

    const systemPrompt = getDomainSystemPrompt(domain, locale);
    const userPrompt = formatUserContext(
      seed,
      domain,
      questions,
      answers,
      pinnedAttributes,
      attachments,
      additionalContext
    );

    const stream = await mimoClient.chat.completions.create({
      model: MIMO_DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (streamErr) {
          console.error('Error during LLM streaming:', streamErr);
          controller.error(streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: unknown) {
    console.error('Error in generate-prompt route:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

