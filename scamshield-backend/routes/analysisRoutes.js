// routes/analysisRoutes.js
import express from 'express';
import {
  analyzeText,
  analyzeWhatsapp,
  analyzeEmail,
  analyzeUrlEndpoint,
  analyzeScreenshot,
  analyzeStream,
} from '../controllers/analysisController.js';
import {
  validateText,
  validateUrl,
  validateEmail,
  validateImage,
} from '../middlewares/validate.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/text', validateText, analyzeText);
router.post('/whatsapp', validateText, analyzeWhatsapp);
router.post('/email', validateEmail, analyzeEmail);
router.post('/url', validateUrl, analyzeUrlEndpoint);
router.post('/screenshot', upload.single('image'), validateImage, analyzeScreenshot);

// SSE — real-time typing animation
router.post('/stream', analyzeStream);

export default router;
