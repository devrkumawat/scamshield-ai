// config/gemini.js — Google GenAI (Gemini 2.5 Flash) client
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('⚠️  GEMINI_API_KEY not configured. AI classification will be skipped.');
}

const ai = apiKey && apiKey !== 'your_gemini_api_key_here'
  ? new GoogleGenAI({ apiKey })
  : null;

export const isGeminiEnabled = () => !!ai;

export const geminiModel = model;

export default ai;
