import { NextRequest, NextResponse } from 'next/server';
import { mimoClient, MIMO_DEFAULT_MODEL } from '@/lib/mimo';
import { extractJsonPayload } from '@/lib/json-parser';
import {
  DeconstructMediaRequestSchema,
  DeconstructMediaResponseSchema,
} from '@/types/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = DeconstructMediaRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { attachments, seed, domain, locale = 'vi' } = parseResult.data;
    const isVi = locale === 'vi';

    const systemPrompt = `You are a multimodal reverse-prompt engineering specialist.
Your goal is to inspect attached media (images, concept sketches, visual references, text specifications) and deconstruct them into a cohesive, high-quality seed prompt idea and detected attribute parameters (aspect ratio, resolution, motion, camera style, lighting, art style).

${
  isVi
    ? 'All deconstructed descriptions, subject breakdowns, and seed ideas MUST BE WRITTEN IN VIETNAMESE (tiếng Việt).'
    : 'All deconstructed descriptions, subject breakdowns, and seed ideas MUST BE WRITTEN IN ENGLISH.'
}

Output MUST be a valid JSON object matching this schema:
{
  "seed": "Comprehensive synthesized prompt idea describing the subject, mood, environment, style, lighting, and composition",
  "suggestedDomain": "${domain || 'image-generation'}",
  "detectedAttributes": {
    "aspectRatio": "16:9 or 1:1 or 9:16 or 4:3 or 21:9",
    "resolution": "HD or FullHD or 2K or 4K",
    "motion": "Subtle or Moderate or Dynamic or Hyper-speed",
    "camera": "Static or Pan/Tilt or Tracking or FPV Drone or Orbit",
    "stylePreset": "Photorealistic or Anime or Digital Art or 3D Render or Cinematic"
  },
  "breakdown": {
    "subject": "Primary subject and action details",
    "style": "Visual or artistic style description",
    "lighting": "Lighting environment and color tones",
    "camera": "Camera shot type and angle",
    "composition": "Visual balance, framing, and depth of field"
  }
}`;

    // Build user content parts with OpenAI vision format
    type ContentPart =
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } };

    const contentParts: ContentPart[] = [];

    let textSummary = `Initial user seed: "${seed || 'None provided'}"\nDomain: ${domain || 'Auto-detect'}\n\nAttached Files:\n`;

    attachments.forEach((att, idx) => {
      textSummary += `File ${idx + 1}: ${att.name} (${att.type}, ${Math.round(att.size / 1024)} KB)\n`;
      if (att.textContent) {
        textSummary += `Text Content:\n"""\n${att.textContent.slice(0, 4000)}\n"""\n\n`;
      }
    });

    contentParts.push({ type: 'text', text: textSummary });

    // Attach image data URLs if available
    attachments.forEach((att) => {
      if (att.dataUrl && att.dataUrl.startsWith('data:image/')) {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: att.dataUrl,
          },
        });
      }
    });

    const completion = await mimoClient.chat.completions.create({
      model: MIMO_DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: contentParts as unknown as string,
        },
      ],
      temperature: 0.5,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    const extractionResult = extractJsonPayload(responseContent, DeconstructMediaResponseSchema);

    if (!extractionResult.success) {
      console.error('LLM JSON parse error in deconstruct-media:', extractionResult.error, 'Raw:', responseContent);
      return NextResponse.json(
        { error: extractionResult.error, raw: responseContent },
        { status: 502 }
      );
    }

    return NextResponse.json(extractionResult.data);
  } catch (error: unknown) {
    console.error('Error in deconstruct-media route:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
