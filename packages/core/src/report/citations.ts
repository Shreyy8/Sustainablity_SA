export const CITATION_REGEX = /\[asset:([a-zA-Z0-9_-]{4,36})\]/g;
export const CLAIM_PATTERN =
  /\d|\b(built|installed|constructed|planted|trained|benefit|beneficiaries|reached|completed|renovated|distributed|provided|established|tested|restored|sanitized)\b/i;

export interface CitationValidationResult {
  ok: boolean;
  sentencesCount: number;
  claimSentencesCount: number;
  invalidSentences: string[];
  referencedAssetIds: string[];
}

/**
 * Extracts all unique cited asset IDs from a block of text.
 */
export function extractCitations(text: string): string[] {
  const matches = [...text.matchAll(CITATION_REGEX)];
  const ids = new Set<string>();
  for (const m of matches) {
    if (m[1]) ids.add(m[1]);
  }
  return Array.from(ids);
}

/**
 * Validates that all factual claims and sentences with metrics or actions
 * carry at least one valid [asset:ID] citation.
 */
export function validateCitations(
  text: string,
  validAssetIds: Set<string>
): CitationValidationResult {
  // Split on sentence boundaries: period, exclamation, question mark followed by space or newline
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const invalidSentences: string[] = [];
  const referencedAssetIds = new Set<string>();
  let claimSentencesCount = 0;

  for (const s of sentences) {
    const isClaim = CLAIM_PATTERN.test(s);
    if (isClaim) {
      claimSentencesCount++;
      const cited = [...s.matchAll(CITATION_REGEX)].map((m) => m[1]);

      // Check if at least one cited ID is in validAssetIds
      const hasValidCitation = cited.some((id) => validAssetIds.has(id));

      if (!hasValidCitation) {
        invalidSentences.push(s);
      } else {
        cited.forEach((id) => {
          if (validAssetIds.has(id)) referencedAssetIds.add(id);
        });
      }
    }
  }

  return {
    ok: invalidSentences.length === 0,
    sentencesCount: sentences.length,
    claimSentencesCount,
    invalidSentences,
    referencedAssetIds: Array.from(referencedAssetIds)
  };
}

/**
 * Strips or drops uncited claim sentences to guarantee factuality.
 */
export function stripUncitedClaims(
  text: string,
  validAssetIds: Set<string>
): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const valid = sentences.filter((s) => {
    if (!CLAIM_PATTERN.test(s)) return true;
    const cited = [...s.matchAll(CITATION_REGEX)].map((m) => m[1]);
    return cited.some((id) => validAssetIds.has(id));
  });

  return valid.join(" ");
}
