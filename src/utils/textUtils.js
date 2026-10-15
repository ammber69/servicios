/**
 * Utility to strip any emojis and sanitize text for clean executive presentation.
 */
export function stripEmojis(str) {
  if (!str) return '';
  return str
    .replace(/[\p{Extended_Pictographic}\u200D\uFE0F]/gu, '')
    .trim();
}
