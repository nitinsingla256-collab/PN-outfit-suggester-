/**
 * Centralized Gemini Model Configuration
 * Primary model: 'gemini-3.6-flash'
 */

export const PRIMARY_GEMINI_MODEL = 'gemini-3.6-flash';

// Disallowed / deprecated legacy models that must be resolved to the primary model
const DEPRECATED_MODEL_PATTERNS = [
  /^gemini-1\./i,
  /^gemini-2\./i,
  /^models\/gemini-1\./i,
  /^models\/gemini-2\./i,
  /gemini-pro$/i,
];

/**
 * Validates and resolves the active Gemini model.
 * Evaluates process.env.GEMINI_MODEL and resolves safely to 'gemini-3.6-flash'
 * if unset, empty, or configured with an unsupported/deprecated model.
 */
export function getGeminiModel(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured) {
    return PRIMARY_GEMINI_MODEL;
  }

  // Strip prefix if someone provided 'models/...'
  const normalized = configured.replace(/^models\//i, '');

  const isDeprecated = DEPRECATED_MODEL_PATTERNS.some(pattern => pattern.test(configured) || pattern.test(normalized));
  if (isDeprecated) {
    return PRIMARY_GEMINI_MODEL;
  }

  // Ensure it is a valid Gemini model identifier
  if (/^gemini-3\./i.test(normalized)) {
    return normalized;
  }

  return PRIMARY_GEMINI_MODEL;
}

