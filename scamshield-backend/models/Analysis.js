// models/Analysis.js — Mongoose schema for a completed scam analysis
import mongoose from 'mongoose';

const IndicatorSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    keyword: { type: String },
    weight: { type: Number, default: 0 },
    description: { type: String },
  },
  { _id: false }
);

const AnalysisBreakdownSchema = new mongoose.Schema(
  {
    keywordRules: { type: Number, default: 0 },
    aiClassification: { type: Number, default: 0 },
    semanticAnalysis: { type: Number, default: 0 },
    contextualReasoning: { type: Number, default: 0 },
    urlReputation: { type: Number, default: 0 },
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    inputType: {
      type: String,
      enum: ['text', 'whatsapp', 'email', 'url', 'screenshot', 'qr'],
      required: true,
      index: true,
    },
    inputContent: { type: String, default: '' },
    extractedText: { type: String, default: '' },

    riskScore: { type: Number, min: 0, max: 100, required: true, index: true },
    riskLevel: {
      type: String,
      enum: ['safe', 'low', 'suspicious', 'high', 'critical'],
      required: true,
      index: true,
    },
    confidence: { type: Number, min: 0, max: 100, default: 0 },

    scamType: { type: String, default: 'Unknown', index: true },
    indicators: { type: [IndicatorSchema], default: [] },

    summary: { type: String, default: '' },
    explanation: { type: [String], default: [] },
    preventiveSteps: { type: [String], default: [] },
    recommendedAction: { type: String, default: '' },

    analysisBreakdown: { type: AnalysisBreakdownSchema, default: () => ({}) },

    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      processingMs: { type: Number },
    },
  },
  { timestamps: true }
);

AnalysisSchema.index({ createdAt: -1 });

const Analysis = mongoose.model('Analysis', AnalysisSchema);

export default Analysis;
