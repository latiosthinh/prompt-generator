import { NextRequest, NextResponse } from 'next/server';
import { mimoClient, MIMO_DEFAULT_MODEL } from '@/lib/mimo';
import { extractJsonPayload } from '@/lib/json-parser';
import { GenerateQuestionsResponseSchema, GenerateQuestionsRequestSchema } from '@/types/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = GenerateQuestionsRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { seed, domain, previousPrompt, previousAnswers, previousQuestions, locale = 'vi' } = parseResult.data;

    const isVi = locale === 'vi';
    const langInstruction = isVi
      ? 'The questions, analysis, and options MUST be written in Vietnamese (tiếng Việt).'
      : 'The questions, analysis, and options MUST be written in English.';

    const domainContext = domain ? `Domain context: "${domain}".` : 'Domain: General / Multi-purpose.';

    let refinementPrompt = '';
    if (previousPrompt && previousPrompt.trim()) {
      let qaSummary = '';
      if (previousQuestions && previousQuestions.length > 0) {
        qaSummary = `\nPreviously answered aspects:\n` + previousQuestions.map((q) => {
          const ans = previousAnswers?.find((a) => a.questionId === q.id);
          const labels = ans?.selectedOptionIds.map((optId) => q.options.find((o) => o.id === optId)?.label).filter(Boolean);
          const custom = ans?.customText ? `(Custom: ${ans.customText})` : '';
          return `- ${q.text}: ${labels?.join(', ') || 'AI Decision'} ${custom}`;
        }).join('\n');
      }

      refinementPrompt = `\n### REFINEMENT / FOLLOW-UP MODE:
The user is iteratively refining an existing synthesized prompt.
Current Synthesized Prompt:
"""
${previousPrompt.slice(0, 2000)}
"""
${qaSummary}

TASK: Generate 2 to 4 deeper, high-precision follow-up questions to drill into advanced nuances, micro-details, edge cases, negative constraints, or styling specifics that can make this prompt significantly better.
DO NOT repeat the basic questions already answered. Focus on elevated craftsmanship, subtle constraints, delivery format, and exact execution specs.`;
    }

    const systemPrompt = `You are an expert prompt engineer and question designer.
Your role is to analyze the user's initial idea/seed and generate targeted clarification questions.
${langInstruction}
Each question must help specify critical nuances (style, atmosphere, constraints, formatting, target platform, technical parameters).

For each question:
- Provide an ID (e.g. "q1", "q2")
- Provide clear question text in ${isVi ? 'Vietnamese' : 'English'}
- Specify type ("single" for single choice, "multi" for multiple choice)
- Provide 3 to 5 distinct, high-quality, practical options with ID and label in ${isVi ? 'Vietnamese' : 'English'}
- Always ensure allowOther is true

${domainContext}
${refinementPrompt}

You MUST return ONLY a valid JSON object matching this schema:
{
  "analysis": "1-sentence analysis of what can be refined or deepened",
  "suggestedDomain": "${domain || 'General'}",
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "type": "single",
      "allowOther": true,
      "options": [
        { "id": "opt1", "label": "Option 1" },
        { "id": "opt2", "label": "Option 2" }
      ]
    }
  ]
}`;

    const completion = await mimoClient.chat.completions.create({
      model: MIMO_DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Seed prompt: "${seed}"${previousPrompt ? '\nRefining existing generated prompt.' : ''}` },
      ],
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    const extractionResult = extractJsonPayload(responseContent, GenerateQuestionsResponseSchema);

    if (!extractionResult.success) {
      console.error('LLM JSON parse/schema error:', extractionResult.error, 'Raw response:', responseContent);
      return NextResponse.json(
        { error: extractionResult.error, raw: responseContent },
        { status: 502 }
      );
    }

    return NextResponse.json(extractionResult.data);
  } catch (error: unknown) {
    console.error('Error in generate-questions route:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
