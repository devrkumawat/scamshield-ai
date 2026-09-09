// services/geminiService.js — Gemini 2.5 Flash integration
//
// Two entry points:
//   analyzeWithGemini(text, meta)         → single JSON verdict
//   streamAnalysisWithGemini(text, meta)  → async iterator of text chunks (SSE)

import ai, { geminiModel, isGeminiEnabled } from '../config/gemini.js';

const SYSTEM_INSTRUCTION = `You are ScamShield AI — a cybersecurity expert specializing in
scam, fraud, and phishing detection across text messages, WhatsApp, email, URLs, and screenshots.

You MUST reply with STRICT VALID JSON only. No prose, no markdown, no code fences.
Schema:
{
  "scamType": string,               // e.g. "OTP Phishing", "UPI Fraud", "Lottery Scam", "Safe", "Fake Rewards", "KYC Scam", "Investment Fraud", "Government Impersonation"
  "aiRiskScore": number,            // 0-100
  "confidence": number,             // 0-100
  "summary": string,                // one-paragraph executive summary
  "explanation": string[],          // 3-6 bullet reasons why this is/isn't a scam
  "redFlags": string[],             // specific suspicious phrases / signals detected
  "preventiveSteps": string[],      // 3-6 actionable prevention tips
  "recommendedAction": string,      // single clear next step for the user
  "semanticAnalysis": number,       // 0-100 — how manipulative the language is
  "contextualReasoning": number     // 0-100 — how suspicious the overall context is
}

Rules:
- If content is clearly safe/benign, scamType = "Safe" and aiRiskScore < 20.
- Be specific and reference actual phrases from the content in redFlags.
- Never invent facts. If content is empty or nonsensical, say so in summary.`;

const buildUserPrompt = (text, meta = {}) => {
  const { inputType = 'text', ruleIndicators = [], urlFindings = [] } = meta;

  return `Analyze the following ${inputType.toUpperCase()} content for scam / fraud / phishing.

CONTENT:
"""
${text || '(empty)'}
"""

RULE-ENGINE SIGNALS (already detected by heuristic layer):
${ruleIndicators.length ? ruleIndicators.map((i) => `- ${i.category}: ${i.keyword || i.description || ''}`).join('\n') : '- none'}

URL REPUTATION FINDINGS:
${urlFindings.length ? urlFindings.map((f) => `- ${f}`).join('\n') : '- none'}

Return ONLY the JSON described in the system instruction.`;
};

const stripFences = (s = '') =>
  s
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

const safeParseJSON = (raw) => {
  if (!raw) return null;
  const cleaned = stripFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract the first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

// ---------- Non-streaming (single JSON) ----------
export const analyzeWithGemini = async (text, meta = {}) => {
  if (!isGeminiEnabled()) {
    return {
      enabled: false,
      raw: '',
      parsed: null,
      error: 'Gemini API key not configured.',
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: buildUserPrompt(text, meta),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const raw = response?.text || '';
    const parsed = safeParseJSON(raw);

    return { enabled: true, raw, parsed };
  } catch (err) {
    console.error('🚨 Gemini error:', err.message);
    return {
      enabled: true,
      raw: '',
      parsed: null,
      error: err.message,
      status: err.status,
    };
  }
};

// ---------- Streaming (SSE) ----------
// Yields text chunks as they arrive from Gemini for a typing effect.
export const streamAnalysisWithGemini = async function* (text, meta = {}) {
  if (!isGeminiEnabled()) {
    yield { type: 'error', message: 'Gemini API key not configured.' };
    return;
  }

  try {
    const stream = await ai.models.generateContentStream({
      model: geminiModel,
      contents: buildUserPrompt(text, meta),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    let fullText = '';
    for await (const chunk of stream) {
      const piece = chunk?.text || '';
      if (piece) {
        fullText += piece;
        yield { type: 'chunk', text: piece };
      }
    }

    const parsed = safeParseJSON(fullText);
    yield { type: 'final', raw: fullText, parsed };
  } catch (err) {
    console.error('🚨 Gemini stream error:', err.message);
    yield { type: 'error', message: err.message, status: err.status };
  }
};

export default analyzeWithGemini;
