/**
 * Naive sentence splitter: breaks on ".", "!", "?" followed by whitespace (or end of text).
 * It doesn't understand abbreviations (e.g. "Mr.", "U.S.") or decimals, so callers should
 * let the user review and fix the result before using it.
 */
export function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const matches = normalized.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [];
  return matches.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0);
}
