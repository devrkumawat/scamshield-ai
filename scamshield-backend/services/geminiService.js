// services/geminiService.js

import ai, {
  geminiModel,
  isGeminiEnabled,
} from "../config/gemini.js";


// ============================================================
// SYSTEM INSTRUCTION
// ============================================================

const SYSTEM_INSTRUCTION = `
You are ScamShield AI — a cybersecurity expert specializing in
scam, fraud, phishing, malicious messages, social engineering,
and suspicious online content.

Your task is to analyze the supplied content and determine
whether it is safe, suspicious, or likely to be a scam.

Analyze:

1. Semantic meaning
2. Social engineering techniques
3. Urgency or pressure
4. Requests for money, OTPs, passwords, personal information
5. Suspicious links or domains
6. Impersonation
7. Fake rewards, jobs, investments, refunds, KYC, banking alerts
8. Rule-engine indicators
9. URL reputation findings
10. Overall contextual risk

Important rules:

- Do not invent facts.
- Do not claim a URL is malicious without supporting evidence.
- Use the supplied rule-engine and URL findings as additional evidence.
- Distinguish between suspicious content and confirmed malicious content.
- If the content is clearly safe, use scamType "Safe".
- aiRiskScore must represent the overall scam risk from 0 to 100.
- confidence must represent your confidence from 0 to 100.
- semanticAnalysis must be from 0 to 100.
- contextualReasoning must be from 0 to 100.
- Provide practical preventive steps.
- Base the analysis on the actual supplied content.
`;


// ============================================================
// RESPONSE SCHEMA
// ============================================================

const scamAnalysisSchema = {
  type: "object",

  properties: {
    scamType: {
      type: "string",
      description:
        "The most appropriate scam category, or Safe if the content is benign."
    },

    aiRiskScore: {
      type: "number",
      description:
        "Overall scam risk score from 0 to 100."
    },

    confidence: {
      type: "number",
      description:
        "Confidence in the classification from 0 to 100."
    },

    summary: {
      type: "string",
      description:
        "A concise summary of the analysis."
    },

    explanation: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "Important reasons supporting the classification."
    },

    redFlags: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "Specific suspicious indicators found in the content."
    },

    preventiveSteps: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "Practical actions the user should take."
    },

    recommendedAction: {
      type: "string",
      description:
        "The recommended action for the user."
    },

    semanticAnalysis: {
      type: "number",
      description:
        "Semantic scam risk from 0 to 100."
    },

    contextualReasoning: {
      type: "number",
      description:
        "Contextual scam risk from 0 to 100."
    },
  },

  required: [
    "scamType",
    "aiRiskScore",
    "confidence",
    "summary",
    "explanation",
    "redFlags",
    "preventiveSteps",
    "recommendedAction",
    "semanticAnalysis",
    "contextualReasoning",
  ],
};


// ============================================================
// BUILD USER PROMPT
// ============================================================

const buildUserPrompt = (
  text,
  meta = {}
) => {
  const {
    inputType = "text",
    ruleIndicators = [],
    urlFindings = [],
  } = meta;


  const ruleSignals =
    ruleIndicators.length > 0
      ? ruleIndicators
          .map(
            (indicator) =>
              `- ${
                indicator.category ||
                "Unknown"
              }: ${
                indicator.keyword ||
                indicator.description ||
                JSON.stringify(indicator)
              }`
          )
          .join("\n")
      : "- None";


  const reputationFindings =
    urlFindings.length > 0
      ? urlFindings
          .map(
            (finding) =>
              `- ${
                typeof finding === "string"
                  ? finding
                  : JSON.stringify(finding)
              }`
          )
          .join("\n")
      : "- None";


  return `
Analyze this ${inputType.toUpperCase()} content
for scam, fraud, phishing, or other malicious
social-engineering behavior.

==============================
CONTENT
==============================

${text || "(empty)"}


==============================
RULE ENGINE SIGNALS
==============================

${ruleSignals}


==============================
URL REPUTATION FINDINGS
==============================

${reputationFindings}


==============================
TASK
==============================

Determine the overall risk.

Consider the actual content first, then use
the rule-engine signals and URL reputation
findings as supporting evidence.

Return the result according to the provided
JSON schema.
`;
};


// ============================================================
// SAFE JSON PARSER
// ============================================================

const safeParseJSON = (raw = "") => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};


// ============================================================
// NORMAL ANALYSIS
// ============================================================

export const analyzeWithGemini = async (
  text,
  meta = {}
) => {

  if (!isGeminiEnabled()) {
    return {
      enabled: false,
      raw: "",
      parsed: null,
      error:
        "Gemini API key not configured.",
    };
  }


  try {

    const interaction =
      await ai.interactions.create({

        model: geminiModel,

        input: buildUserPrompt(
          text,
          meta
        ),

        system_instruction:
          SYSTEM_INSTRUCTION,

        generation_config: {
          temperature: 0.3,
        },

        response_format: {
          type: "text",

          mime_type:
            "application/json",

          schema:
            scamAnalysisSchema,
        },

        store: false,
      });


    const raw =
      interaction?.output_text || "";


    const parsed =
      safeParseJSON(raw);


    return {
      enabled: true,
      raw,
      parsed,
    };

  } catch (err) {

    console.error(
      "🚨 Gemini error:",
      err?.message || err
    );


    return {
      enabled: true,
      raw: "",
      parsed: null,

      error:
        err?.message ||
        "Unknown Gemini error",

      status: err?.status,

      details:
        err?.response?.data ||
        err?.response ||
        null,
    };
  }
};


// ============================================================
// STREAMING ANALYSIS
// ============================================================

export const streamAnalysisWithGemini =
  async function* (
    text,
    meta = {}
  ) {

    if (!isGeminiEnabled()) {

      yield {
        type: "error",

        message:
          "Gemini API key not configured.",
      };

      return;
    }


    try {

      const stream =
        await ai.interactions.create({

          model: geminiModel,

          input: buildUserPrompt(
            text,
            meta
          ),

          system_instruction:
            SYSTEM_INSTRUCTION,

          generation_config: {
            temperature: 0.3,
          },

          response_format: {
            type: "text",

            mime_type:
              "application/json",

            schema:
              scamAnalysisSchema,
          },

          stream: true,

          store: false,
        });


      let fullText = "";


      for await (const event of stream) {

        if (
          event?.event_type ===
            "step.delta" &&
          event?.delta?.type ===
            "text"
        ) {

          const piece =
            event.delta.text || "";


          if (piece) {

            fullText += piece;


            yield {
              type: "chunk",
              text: piece,
            };
          }
        }
      }


      const parsed =
        safeParseJSON(fullText);


      yield {
        type: "final",

        raw: fullText,

        parsed,
      };

    } catch (err) {

      console.error(
        "🚨 Gemini stream error:",
        err?.message || err
      );


      yield {
        type: "error",

        message:
          err?.message ||
          "Unknown Gemini streaming error",

        status: err?.status,
      };
    }
  };


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default analyzeWithGemini;CONTENT:
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
