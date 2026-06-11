import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });

    const { message, medicineName } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        reply: "⚠️ GEMINI_API_KEY is not set. Please configure it to use the AI Health Assistant." 
      });
    }

    const prompt = `
      You are a professional Medical AI Assistant for CureCart pharmacy.
      A user is asking a question about the medicine: "${medicineName || 'General Health'}".
      Their question is: "${message}"

      STRICT RULES:
      1. You MUST ONLY use information from authenticated, official, and genuine sources like the FDA, WHO, Mayo Clinic, or NHS.
      2. If you do not know the answer or if the source is not verifiable, you MUST state: "I do not have verified data for this." Do not guess.
      3. Keep your answer concise, professional, and easy to understand.
      4. Always append this exact disclaimer at the very end of your response (do not change the wording): 
      "⚠️ This is AI-generated information based on official sources. Do not follow it blindly. Always consult a certified doctor."
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1, // Very low temperature for factual, grounded responses
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Health Bot Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate AI response" }, { status: 500 });
  }
}
