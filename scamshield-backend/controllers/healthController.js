// controllers/healthController.js — Service health check
import mongoose from 'mongoose';
import { isGeminiEnabled } from '../config/gemini.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'ScamShield AI Backend',
    version: '1.0.0',
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: dbStatusMap[dbState] || 'unknown',
      gemini: isGeminiEnabled() ? 'configured' : 'not_configured',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

export default { getHealth };
