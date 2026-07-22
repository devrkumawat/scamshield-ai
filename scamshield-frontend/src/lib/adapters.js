// Adapts backend analysis payloads into the shape the UI already renders.
//
// Backend response (see backend/services/analysisService.js) contains:
//   { id, riskScore, riskLevel, confidence, scamType, summary,
//     detectedIndicators, analysisBreakdown, explanation, preventiveSteps,
//     recommendedAction, urlAnalyses, extractedText?, ocrConfidence?, ... }
//
// The UI (Result page + RecentScanRow) expects a flatter shape:
//   { id, type, verdict, score, title, category, redFlags, recommendations,
//     summary, inputPreview, time, breakdown, urlAnalyses, extractedText, raw }

import { mapRiskLevel } from './constants.js';

export function toResult(data, { type, inputPreview, id: overrideId } = {}) {
  const verdict = mapRiskLevel(data.riskLevel);

  // Build red-flags list: prefer human-readable explanation entries, fall
  // back to detected indicator categories/keywords.
  let redFlags = Array.isArray(data.explanation)
    ? data.explanation.filter(Boolean)
    : [];
    
  if (redFlags.length === 0 && Array.isArray(data.detectedIndicators)) {
    redFlags = data.detectedIndicators
      .map((i) =>
        i.description ||
        [i.category, i.keyword ? `"${i.keyword}"` : null]
          .filter(Boolean)
          .join(' — ')
      )
      .filter(Boolean);
  }

  const recommendations = [
    ...(Array.isArray(data.preventiveSteps) ? data.preventiveSteps : []),
  ];
  
  if (data.recommendedAction && !recommendations.includes(data.recommendedAction)) {
    recommendations.push(data.recommendedAction);
  }

  return {
    id: overrideId || data.id || `SS-${Date.now()}`,
    type,
    verdict,
    score: Number.isFinite(data.riskScore) ? data.riskScore : 0,
    title:
      data.scamType && data.scamType !== 'Safe'
        ? data.scamType
        : verdict === 'safe'
        ? 'No scam indicators detected'
        : 'Potential scam detected',
    category: data.scamType || 'General',
    summary: data.summary || '',
    redFlags: redFlags.length ? redFlags : ['No specific red flags surfaced.'],
    recommendations: recommendations.length
      ? recommendations
      : ['Stay cautious with unsolicited messages and unknown senders.'],
    breakdown: data.analysisBreakdown || null,
    urlAnalyses: Array.isArray(data.urlAnalyses) ? data.urlAnalyses : [],
    extractedText: data.extractedText || null,
    confidence: Number.isFinite(data.confidence) ? data.confidence : null,
    inputPreview: inputPreview || 'Untitled scan',
    time: 'just now',
    raw: data,
  };
}

// Turn a backend `recentAnalyses` row into the compact record the
// Dashboard/RecentScanRow already knows how to render.
export function toScanRow(row) {
  const type = row.inputType || 'text';
  const preview =
    (row.summary && row.summary.trim()) ||
    row.scamType ||
    'Scan';
    
  return {
    id: row._id || row.id || `SS-${Math.random().toString(36).slice(2, 8)}`,
    type,
    label: null,
    preview,
    verdict: mapRiskLevel(row.riskLevel),
    score: row.riskScore ?? 0,
    createdAt: row.createdAt || null,
    scamType: row.scamType,
    summary: row.summary,
    confidence: row.confidence,
  };
}