// services/analysisService.js — Orchestrates rule engine + URL check + Gemini + persistence
import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';
import { runRuleEngine } from '../utils/ruleEngine.js';
import { analyzeUrl } from '../utils/urlChecker.js';
import { analyzeWithGemini } from './geminiService.js';
import { calculateFinalRisk, levelFromScore, clamp } from '../utils/riskCalculator.js';

// Deterministic fallback when Gemini is unavailable — keeps API usable.
const buildFallback = (ruleResult) => {
  const topCategories = ruleResult.indicators.map((i) => i.category);
  const primary = topCategories[0] || 'Unknown';
  return {
    scamType: ruleResult.score >= 40 ? primary : 'Safe',
    aiRiskScore: ruleResult.score,
    confidence: 55,
    summary:
      ruleResult.score >= 40
        ? `Heuristic analysis flagged ${ruleResult.indicators.length} suspicious signal(s). AI classification is unavailable — verdict is based on rule engine only.`
        : 'No strong scam signals detected by the rule engine. AI classification is unavailable.',
    explanation:
      ruleResult.indicators.length > 0
        ? ruleResult.indicators.slice(0, 5).map((i) => `Detected ${i.category}${i.keyword ? ` ("${i.keyword}")` : ''}.`)
        : ['No suspicious keywords or patterns matched.'],
    redFlags: ruleResult.indicators.map((i) => i.keyword || i.category),
    preventiveSteps: [
      'Never share OTPs, passwords, or PINs with anyone.',
      'Verify sender identity through official channels before acting.',
      'Avoid clicking on unknown or shortened links.',
      'Report suspicious messages to https://cybercrime.gov.in.',
    ],
    recommendedAction:
      ruleResult.score >= 40
        ? 'Do NOT engage. Block the sender and report to cybercrime authorities.'
        : 'Content appears low-risk, but stay cautious and verify unusual requests.',
    semanticAnalysis: Math.min(100, ruleResult.score + 5),
    contextualReasoning: ruleResult.score,
  };
};

// -------- Main orchestration --------
export const performAnalysis = async ({
  inputType,
  inputContent,
  extractedText,
  meta = {},
}) => {
  const startedAt = Date.now();
  const analysisText = extractedText || inputContent || '';

  // 1) Rule engine
  const ruleResult = runRuleEngine(analysisText);

  // 2) URL reputation (any URLs discovered)
  const urlAnalyses = [];
  for (const u of ruleResult.urls.slice(0, 5)) {
    const r = await analyzeUrl(u);
    urlAnalyses.push({ url: u, ...r });
  }
  const urlReputationScore = urlAnalyses.length
    ? Math.max(...urlAnalyses.map((u) => u.score))
    : 0;
  const urlFindings = urlAnalyses.flatMap((u) =>
    u.findings.map((f) => `${u.host || u.url}: ${f}`)
  );

  // 3) Gemini
  const gemini = await analyzeWithGemini(analysisText, {
    inputType,
    ruleIndicators: ruleResult.indicators,
    urlFindings,
  });

  const aiPayload = gemini.parsed || buildFallback(ruleResult);

  // 4) Final risk
  const semanticScore = clamp(
  aiPayload.semanticAnalysis ?? aiPayload.aiRiskScore ?? 0
);

const contextScore = clamp(
  aiPayload.contextualReasoning ?? aiPayload.aiRiskScore ?? 0
);

const risk = calculateFinalRisk({
  aiClassification: clamp(aiPayload.aiRiskScore ?? 0),
  semanticAnalysis: semanticScore,
  contextReasoning: contextScore,
  urlReputationScore,
  isUrlScan: inputType === 'url',
  aiConfidence: clamp(aiPayload.confidence ?? 0),
});

  // 5) Build consistent response
  const detectedIndicators = [
    ...ruleResult.indicators,
    ...(aiPayload.redFlags || []).map((rf) => ({
      category: 'AI-detected red flag',
      keyword: rf,
      weight: 0,
      description: rf,
    })),
  ];

 const analysisBreakdown = {
  aiClassification: risk.breakdown.aiClassification,
  semanticAnalysis: risk.breakdown.semanticAnalysis,
  contextReasoning: risk.breakdown.contextReasoning,
  ...(inputType === 'url' && {
    urlReputation: risk.breakdown.urlReputation,
  }),
};

  const responseBody = {
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    confidence: risk.confidence,
    scamType: aiPayload.scamType || 'Unknown',
    summary: aiPayload.summary || '',
    detectedIndicators,
    analysisBreakdown,
    explanation: aiPayload.explanation || [],
    preventiveSteps: aiPayload.preventiveSteps || [],
    recommendedAction: aiPayload.recommendedAction || '',
    urlAnalyses,
    extractedText: extractedText || undefined,
    aiEnabled: gemini.enabled !== false,
    aiError: gemini.error || undefined,
    processingMs: Date.now() - startedAt,
  };

  // 6) Persist
  const doc = await persistAnalysis({
    inputType,
    inputContent,
    extractedText: extractedText || '',
    responseBody,
    detectedIndicators,
    analysisBreakdown,
    meta,
  });

  return { ...responseBody, id: doc?._id?.toString() };
};

const persistAnalysis = async ({
  inputType,
  inputContent,
  extractedText,
  responseBody,
  detectedIndicators,
  analysisBreakdown,
  meta,
}) => {
  if (mongoose.connection.readyState !== 1) return null;
  try {
    const doc = await Analysis.create({
      inputType,
      inputContent: (inputContent || '').slice(0, 20000),
      extractedText: (extractedText || '').slice(0, 20000),
      riskScore: responseBody.riskScore,
      riskLevel: responseBody.riskLevel,
      confidence: responseBody.confidence,
      scamType: responseBody.scamType,
      indicators: detectedIndicators.slice(0, 50),
      summary: responseBody.summary,
      explanation: responseBody.explanation,
      preventiveSteps: responseBody.preventiveSteps,
      recommendedAction: responseBody.recommendedAction,
      analysisBreakdown,
      metadata: {
        ip: meta.ip,
        userAgent: meta.userAgent,
        processingMs: responseBody.processingMs,
      },
    });
    return doc;
  } catch (err) {
    console.error('Analysis persist error:', err.message);
    return null;
  }
};

// -------- Precompute rule + URL data for streaming --------
export const buildStreamContext = async ({ inputType, text }) => {
  const analysisText = text || '';
  const ruleResult = runRuleEngine(analysisText);
  const urlAnalyses = [];
  for (const u of ruleResult.urls.slice(0, 5)) {
    const r = await analyzeUrl(u);
    urlAnalyses.push({ url: u, ...r });
  }
  const urlReputationScore = urlAnalyses.length
    ? Math.max(...urlAnalyses.map((u) => u.score))
    : 0;
  const urlFindings = urlAnalyses.flatMap((u) =>
    u.findings.map((f) => `${u.host || u.url}: ${f}`)
  );
  return { ruleResult, urlAnalyses, urlReputationScore, urlFindings };
};

// -------- Post-stream: assemble final response from parsed Gemini JSON --------
export const finalizeStreamedAnalysis = async ({
  inputType,
  inputContent,
  extractedText,
  ruleResult,
  urlAnalyses,
  urlReputationScore,
  aiParsed,
  meta = {},
}) => {
  const aiPayload = aiParsed || buildFallback(ruleResult);

  const semanticScore = clamp(
  aiPayload.semanticAnalysis ?? aiPayload.aiRiskScore ?? 0
);

const contextScore = clamp(
  aiPayload.contextualReasoning ?? aiPayload.aiRiskScore ?? 0
);

const risk = calculateFinalRisk({
  aiClassification: clamp(aiPayload.aiRiskScore ?? 0),
  semanticAnalysis: semanticScore,
  contextReasoning: contextScore,
  urlReputationScore,
  isUrlScan: inputType === 'url',
  aiConfidence: clamp(aiPayload.confidence ?? 0),
});

  const detectedIndicators = [
    ...ruleResult.indicators,
    ...(aiPayload.redFlags || []).map((rf) => ({
      category: 'AI-detected red flag',
      keyword: rf,
      weight: 0,
      description: rf,
    })),
  ];

  const analysisBreakdown = {
  aiClassification: risk.breakdown.aiClassification,
  semanticAnalysis: risk.breakdown.semanticAnalysis,
  contextReasoning: risk.breakdown.contextReasoning,
  ...(inputType === 'url' && {
    urlReputation: risk.breakdown.urlReputation,
  }),
};

  const responseBody = {
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    confidence: risk.confidence,
    scamType: aiPayload.scamType || 'Unknown',
    summary: aiPayload.summary || '',
    detectedIndicators,
    analysisBreakdown,
    explanation: aiPayload.explanation || [],
    preventiveSteps: aiPayload.preventiveSteps || [],
    recommendedAction: aiPayload.recommendedAction || '',
    urlAnalyses,
    extractedText: extractedText || undefined,
  };

  const doc = await persistAnalysis({
    inputType,
    inputContent,
    extractedText: extractedText || '',
    responseBody,
    detectedIndicators,
    analysisBreakdown,
    meta,
  });

  return { ...responseBody, id: doc?._id?.toString() };
};

export default performAnalysis;
