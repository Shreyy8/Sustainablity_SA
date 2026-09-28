import type { CheckResult } from "./duplicate.js";

export interface SyntheticCheckInput {
  aiGeneratedProbability?: number;
  syntheticFlag?: boolean;
}

export function syntheticCheck(
  input: SyntheticCheckInput | null | undefined
): CheckResult | null {
  if (!input) return null;

  const prob = input.aiGeneratedProbability ?? (input.syntheticFlag ? 0.95 : 0);

  if (prob >= 0.8) {
    return {
      id: "synthetic",
      penalty: 40,
      severity: "critical",
      reason: `Synthetic / AI generation flag: high probability (${Math.round(prob * 100)}%) of generative AI synthesis`,
      evidence: { aiGeneratedProbability: prob }
    };
  }

  if (prob >= 0.5) {
    return {
      id: "synthetic",
      penalty: 20,
      severity: "warning",
      reason: `Possible synthetic manipulation: medium probability (${Math.round(prob * 100)}%) of artificial generation or inpainting`,
      evidence: { aiGeneratedProbability: prob }
    };
  }

  return null;
}
