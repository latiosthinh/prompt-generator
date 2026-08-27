import OpenAI from 'openai';

// Server-side OpenAI SDK instance configured for Xiaomi-MiMo API
export const mimoClient = new OpenAI({
  baseURL: process.env.XIAOMI_MIMO_BASE_URL || 'https://token-plan-sgp.xiaomimimo.com/v1',
  apiKey: process.env.XIAOMI_MIMO_API_KEY || 'missing-key',
});

export const MIMO_DEFAULT_MODEL = process.env.XIAOMI_MIMO_MODEL || 'mimo-v1';
