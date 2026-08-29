import { z } from 'zod';

export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  dataUrl: z.string().optional(),
  textContent: z.string().optional(),
});

export const PinnedAttributesSchema = z.object({
  aspectRatio: z.string().optional(),
  resolution: z.string().optional(),
  motion: z.string().optional(),
  camera: z.string().optional(),
  stylePreset: z.string().optional(),
  fps: z.string().optional(),
  lighting: z.string().optional(),
});

export const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['single', 'multi']),
  options: z.array(QuestionOptionSchema),
  allowOther: z.boolean().default(true),
  category: z.string().optional(),
});

export const GenerateQuestionsResponseSchema = z.object({
  analysis: z.string().optional(),
  questions: z.array(QuestionSchema).min(1),
  suggestedDomain: z.string().optional(),
});

export const UserAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionIds: z.array(z.string()).default([]),
  customText: z.string().optional(),
});

export const GenerateQuestionsRequestSchema = z.object({
  seed: z.string().min(1),
  domain: z.string(),
  previousPrompt: z.string().optional(),
  previousAnswers: z.array(UserAnswerSchema).optional(),
  previousQuestions: z.array(QuestionSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  pinnedAttributes: PinnedAttributesSchema.optional(),
  locale: z.enum(['vi', 'en']).optional(),
});

export const GeneratePromptRequestSchema = z.object({
  seed: z.string().min(1),
  domain: z.string(),
  questions: z.array(QuestionSchema).optional(),
  answers: z.array(UserAnswerSchema),
  attachments: z.array(AttachmentSchema).optional(),
  pinnedAttributes: PinnedAttributesSchema.optional(),
  additionalContext: z.string().optional(),
  locale: z.enum(['vi', 'en']).optional(),
});

export const DeconstructMediaRequestSchema = z.object({
  attachments: z.array(AttachmentSchema).min(1),
  seed: z.string().optional(),
  domain: z.string().optional(),
  locale: z.enum(['vi', 'en']).optional(),
});

export const DeconstructMediaResponseSchema = z.object({
  seed: z.string(),
  suggestedDomain: z.string().optional(),
  detectedAttributes: PinnedAttributesSchema.optional(),
  breakdown: z
    .object({
      subject: z.string().optional(),
      style: z.string().optional(),
      lighting: z.string().optional(),
      camera: z.string().optional(),
      composition: z.string().optional(),
    })
    .optional(),
});

export const GeneratePromptResponseSchema = z.object({
  primaryPrompt: z.string(),
  negativePrompt: z.string().optional(),
  parameters: z.record(z.string(), z.string()).optional(),
  explanation: z.string().optional(),
  suggestedFollowUps: z.array(z.string()).optional(),
});

export const SessionRoundSchema = z.object({
  id: z.string(),
  questions: z.array(QuestionSchema),
  answers: z.array(UserAnswerSchema),
  attachments: z.array(AttachmentSchema).optional(),
  pinnedAttributes: PinnedAttributesSchema.optional(),
  prompt: z.string(),
  createdAt: z.number(),
});

export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: z.string(),
  domainId: z.string(),
  seed: z.string(),
  rounds: z.array(SessionRoundSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;
export type PinnedAttributes = z.infer<typeof PinnedAttributesSchema>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type GenerateQuestionsResponse = z.infer<typeof GenerateQuestionsResponseSchema>;
export type UserAnswer = z.infer<typeof UserAnswerSchema>;
export type GenerateQuestionsRequest = z.infer<typeof GenerateQuestionsRequestSchema>;
export type GeneratePromptRequest = z.infer<typeof GeneratePromptRequestSchema>;
export type DeconstructMediaRequest = z.infer<typeof DeconstructMediaRequestSchema>;
export type DeconstructMediaResponse = z.infer<typeof DeconstructMediaResponseSchema>;
export type GeneratePromptResponse = z.infer<typeof GeneratePromptResponseSchema>;
export type SessionRound = z.infer<typeof SessionRoundSchema>;
export type Session = z.infer<typeof SessionSchema>;

