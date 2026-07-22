// utils/riskCalculator.js — Combines rule-engine + Gemini into final risk score
//
// Final risk score (0-100) blend:
//   0.45 * ruleScore + 0.45 * aiScore + 0.10 * urlReputationScore
//
// Rule score has the same weighting as the AI so a single strong signal from
// either side can escalate the verdict.

export const clamp = (n, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

export const levelFromScore = (score) => {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'suspicious';
  if (score >= 20) return 'low';
  return 'safe';
};

export const calculateFinalRisk = ({
  aiClassification = 0,
  semanticAnalysis = 0,
  contextReasoning = 0,
  urlReputationScore = 0,
  isUrlScan = false,
  aiConfidence = 0,
} = {}) => {
  const ai = clamp(aiClassification);
  const semantic = clamp(semanticAnalysis);
  const context = clamp(contextReasoning);
  const urlRep = clamp(urlReputationScore);

  // Final risk uses ONLY approved signals
  let final;

  if (isUrlScan) {
    // URL scans: include URL reputation
    final = clamp(
      0.35 * ai +
      0.30 * semantic +
      0.25 * context +
      0.10 * urlRep
    );
  } else {
    // Non-URL scans: NO URL reputation
    final = clamp(
      0.40 * ai +
      0.35 * semantic +
      0.25 * context
    );
  }

  return {
    riskScore: final,
    riskLevel: levelFromScore(final),
    confidence: clamp(aiConfidence || 75),
    breakdown: {
      aiClassification: ai,
      semanticAnalysis: semantic,
      contextReasoning: context,
      ...(isUrlScan && { urlReputation: urlRep }),
    },
  };
};

export default calculateFinalRisk;
