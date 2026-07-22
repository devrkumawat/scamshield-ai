// controllers/analysisController.js — Endpoints for every analysis input type
import { asyncHandler } from '../middlewares/errorHandler.js';
import {
  performAnalysis,
  buildStreamContext,
  finalizeStreamedAnalysis,
} from '../services/analysisService.js';
import { streamAnalysisWithGemini } from '../services/geminiService.js';
import { extractTextFromImage, cleanupFile } from '../utils/ocr.js';
import { decodeQRFromImage } from '../utils/qrDecoder.js';

const meta = (req) => ({
  ip: req.ip,
  userAgent: req.get('user-agent') || '',
});

// -------- POST /api/analyze/text --------
export const analyzeText = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const result = await performAnalysis({
    inputType: 'text',
    inputContent: text,
    meta: meta(req),
  });
  res.status(200).json({ success: true, data: result });
});

// -------- POST /api/analyze/whatsapp --------
export const analyzeWhatsapp = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const result = await performAnalysis({
    inputType: 'whatsapp',
    inputContent: text,
    meta: meta(req),
  });
  res.status(200).json({ success: true, data: result });
});

// -------- POST /api/analyze/email --------
export const analyzeEmail = asyncHandler(async (req, res) => {
  const { subject, body, sender } = req.body;
  const composed = [
    sender ? `From: ${sender}` : '',
    subject ? `Subject: ${subject}` : '',
    '',
    body,
  ]
    .filter(Boolean)
    .join('\n');

  const result = await performAnalysis({
    inputType: 'email',
    inputContent: composed,
    meta: meta(req),
  });
  res.status(200).json({ success: true, data: result });
});

// -------- POST /api/analyze/url --------
export const analyzeUrlEndpoint = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const result = await performAnalysis({
    inputType: 'url',
    inputContent: url,
    meta: meta(req),
  });
  res.status(200).json({ success: true, data: result });
});

// -------- POST /api/analyze/screenshot --------
export const analyzeScreenshot = asyncHandler(async (req, res) => {
  const filePath = req.file.path;
  try {
    const { text: extractedText, confidence: ocrConfidence } =
      await extractTextFromImage(filePath);

    if (!extractedText || extractedText.length < 5) {
      return res.status(200).json({
        success: true,
        data: {
          riskScore: 0,
          riskLevel: 'safe',
          confidence: 0,
          scamType: 'Unknown',
          summary: 'No readable text could be extracted from the image.',
          detectedIndicators: [],
          analysisBreakdown: {
            keywordRules: 0,
            aiClassification: 0,
            semanticAnalysis: 0,
            contextualReasoning: 0,
            urlReputation: 0,
          },
          explanation: [
            'OCR could not extract meaningful text from the uploaded image.',
          ],
          preventiveSteps: [
            'Try re-uploading a clearer, higher-resolution screenshot.',
          ],
          recommendedAction:
            'Upload a clearer screenshot or paste the text directly.',
          ocrConfidence,
          extractedText,
        },
      });
    }

    const result = await performAnalysis({
      inputType: 'screenshot',
      inputContent: '[image upload]',
      extractedText,
      meta: meta(req),
    });

    res.status(200).json({
      success: true,
      data: { ...result, ocrConfidence, extractedText },
    });
  } finally {
    await cleanupFile(filePath);
  }
});

// -------- POST /api/analyze/qr --------


// -------- POST /api/analyze/stream --------
// SSE endpoint that streams Gemini output in real time, then sends a `final` event
// with the fully assembled analysis object.
//
// Body: { inputType: 'text'|'whatsapp'|'email'|'url', text: string }
//
// Frontend usage: new EventSource(url) OR fetch + ReadableStream reader.
export const analyzeStream = asyncHandler(async (req, res) => {
  const { inputType = 'text', text = '' } = req.body || {};

  if (!text || text.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Field "text" is required (min 3 characters).',
    });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);

  try {
    // 1) Rule engine + URL — send early for instant UX
    const ctx = await buildStreamContext({ inputType, text });
    send('rules', {
      ruleScore: ctx.ruleResult.score,
      indicators: ctx.ruleResult.indicators,
      urls: ctx.ruleResult.urls,
      urlAnalyses: ctx.urlAnalyses,
    });

    // 2) Gemini stream → chunk events (typing effect)
    let raw = '';
    let parsed = null;
    for await (const evt of streamAnalysisWithGemini(text, {
      inputType,
      ruleIndicators: ctx.ruleResult.indicators,
      urlFindings: ctx.urlFindings,
    })) {
      if (evt.type === 'chunk') {
        raw += evt.text;
        send('chunk', { text: evt.text });
      } else if (evt.type === 'final') {
        parsed = evt.parsed;
      } else if (evt.type === 'error') {
        send('ai_error', { message: evt.message });
      }
    }

    // 3) Build final consistent response and persist
    const finalPayload = await finalizeStreamedAnalysis({
      inputType,
      inputContent: text,
      extractedText: '',
      ruleResult: ctx.ruleResult,
      urlAnalyses: ctx.urlAnalyses,
      urlReputationScore: ctx.urlReputationScore,
      aiParsed: parsed,
      meta: meta(req),
    });

    send('final', finalPayload);
    send('done', { ok: true });
  } catch (err) {
    send('error', { message: err.message });
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
});

export default {
  analyzeText,
  analyzeWhatsapp,
  analyzeEmail,
  analyzeUrlEndpoint,
  analyzeScreenshot,
  analyzeStream,
};
