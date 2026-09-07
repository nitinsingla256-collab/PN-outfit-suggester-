/**
 * Centralized Gemini Model Configuration
 */

export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

export function getGeminiModel(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (configured && configured !== 'gemini-2.5-flash' && configured !== 'models/gemini-2.5-flash') {
    return configured;
  }
  return DEFAULT_GEMINI_MODEL;
}
