import { z } from 'zod';

/**
 * Strips markdown code fences (e.g. ```json ... ```) and parses/validates JSON against a Zod schema.
 */
export function extractJsonPayload<T>(text: string, schema: z.ZodType<T>): { success: true; data: T } | { success: false; error: string } {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'Empty or invalid response from model' };
  }

  let cleaned = text.trim();

  // Strip markdown code block if present
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(markdownRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else {
    // If not enclosed in backticks, find first { or [ and last } or ]
    const firstBrace = cleaned.search(/[\{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    const parsed = JSON.parse(cleaned);
    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      return { success: false, error: `Schema validation failed: ${validated.error.message}` };
    }
    return { success: true, data: validated.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown JSON parse error';
    return { success: false, error: `Failed to parse JSON: ${message}` };
  }
}
