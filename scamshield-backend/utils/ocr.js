// utils/ocr.js — Screenshot OCR via Tesseract.js
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';

export const extractTextFromImage = async (filePath) => {
  try {
    const { data } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {}, // silent
    });
    const text = (data?.text || '').trim();
    const confidence = data?.confidence || 0;
    return { text, confidence };
  } catch (err) {
    console.error('OCR error:', err.message);
    return { text: '', confidence: 0, error: err.message };
  }
};

export const cleanupFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // silent — file may already be gone
  }
};

export default extractTextFromImage;
