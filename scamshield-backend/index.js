// index.js — ScamShield AI backend entry point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import analysisRoutes from './routes/analysisRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Trust Render/Proxy headers
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8001;

// --- Core middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Rate limiting on /api/analyze/* ---
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
app.use('/api/analyze', limiter);

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analyze', analysisRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'ScamShield AI Backend',
    version: '1.0.0',
    docs: '/api/about',
    health: '/api/health',
  });
});

// --- 404 + error ---
app.use(notFound);
app.use(errorHandler);

// --- Boot ---
const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️  ScamShield AI backend running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
};

start();

export default app;
