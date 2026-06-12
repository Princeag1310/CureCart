import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const modelsToTest = [
  "gemini-2.0-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-pro-latest",
  "gemini-3.5-flash",
  "gemma-4-26b-a4b-it",
  "gemini-flash-latest"
];

async function test() {
  for (const model of modelsToTest) {
    console.log(`\nTesting model: ${model}`);
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: "Return the word 'success' if this works.",
      });
      console.log(`✅ SUCCESS with ${model}:`, response.text?.trim());
      // Found a working model!
      return;
    } catch (error: any) {
      const msg = error.message || String(error);
      if (msg.includes("429") || msg.includes("Quota")) {
        console.log(`❌ Quota exceeded or 0 limit for ${model}.`);
      } else if (msg.includes("404")) {
        console.log(`❌ Model not found or unsupported: ${model}.`);
      } else {
        console.log(`❌ Error with ${model}:`, msg);
      }
    }
  }
}

test();
