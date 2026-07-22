// controllers/aboutController.js — Static About page content
import { asyncHandler } from '../middlewares/errorHandler.js';

export const getAbout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'ScamShield AI',
      tagline:
        'Multi-modal scam & phishing detection powered by Gemini 2.5 Flash and cybersecurity heuristics.',
      version: '1.0.0',
      description:
        'ScamShield AI protects users from digital fraud by analyzing text, WhatsApp messages, emails, URLs, screenshots, and QR codes. It combines a rule-based cybersecurity engine with Google Gemini 2.5 Flash to produce a clear risk score, plain-language explanation, and recommended next action.',
      capabilities: [
        'Text / SMS / message analysis',
        'WhatsApp message analysis',
        'Email header + body analysis',
        'URL & domain reputation checks',
        'Screenshot OCR (Tesseract.js)',
        'QR code decoding & risk scoring',
        'Real-time SSE streaming with typing animation',
      ],
      detectionCategories: [
        'Banking impersonation',
        'KYC / verification scams',
        'OTP / credential harvesting',
        'Urgent / pressure tactics',
        'Suspicious domains & TLDs',
        'URL shorteners',
        'QR & UPI payment scams',
        'Fake rewards & prizes',
        'Lottery scams',
        'Investment & crypto fraud',
        'Government impersonation',
        'Grammar & sender anomalies',
      ],
      techStack: [
        'Node.js',
        'Express.js',
        'MongoDB Atlas (Mongoose)',
        'Gemini 2.5 Flash',
        'Tesseract.js',
        'Multer',
        'jsQR',
        'Sharp',
      ],
      team: [
        {
          role: 'Product',
          description:
            'Cybersecurity researchers focused on consumer-facing fraud prevention.',
        },
      ],
      contact: {
        email: 'security@scamshield.ai',
        report: 'https://cybercrime.gov.in',
      },
    },
  });
});

export default { getAbout };
