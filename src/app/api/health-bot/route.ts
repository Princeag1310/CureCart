import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });

    const { messages, medicineName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        reply: "⚠️ GEMINI_API_KEY is not set in Vercel. Please add your Gemini API Key in your Vercel Dashboard to enable the AI." 
      });
    }

    const systemInstruction = `
      You are a professional Medical AI Assistant for CureCart pharmacy.
      A user is asking questions about the medicine: "${medicineName || 'General Health'}".
      
      STRICT RULES:
      1. You MUST ONLY use information from authenticated, official, and genuine sources like the FDA, WHO, Mayo Clinic, or NHS.
      2. If you do not know the answer or if the source is not verifiable, you MUST state: "I do not have verified data for this." Do not guess.
      3. Keep your answer concise, professional, and easy to understand.
      4. Always append this exact disclaimer at the very end of your response (do not change the wording): 
      "⚠️ This is AI-generated information based on official sources. Do not follow it blindly. Always consult a certified doctor."
    `;

    // Map messages to Gemini format
    // Filter out our custom initial greeting since it's just UI and not an actual model interaction
    const chatHistory = messages
      .filter((m: any) => !m.text.includes("Hi! I am the CureCart AI Medical Assistant"))
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Very low temperature for factual, grounded responses
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Health Bot Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate AI response" }, { status: 500 });
  }
}
