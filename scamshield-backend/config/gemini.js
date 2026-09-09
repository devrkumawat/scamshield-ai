// config/gemini.js

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const model =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

if (!apiKey) {
  console.warn(
    "⚠️ GEMINI_API_KEY is not configured."
  );
}

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

export const isGeminiEnabled = () => {
  return !!ai;
};

export const geminiModel = model;

export default ai;
