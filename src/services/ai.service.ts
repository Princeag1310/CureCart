import { GoogleGenAI } from "@google/genai";

export class AIService {
  /**
   * Given a medicine name, uses Gemini to search and structure medical information.
   * Prompts the AI to act as a medical data scraper and return pure JSON.
   */
  static async scrapeMedicineDetails(query: string) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Returning fallback data.");
      return null;
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
      const prompt = `
        You are a medical data scraper. A user has searched for the medicine/drug: "${query}".
        If this is a valid medicine, return a JSON object with the following structure:
        {
          "name": "Proper name of the medicine",
          "manufacturer": "Likely manufacturer or generic label",
          "price": A realistic estimated price in INR (number only),
          "requiresPrescription": boolean true/false based on standard regulations,
          "image": null
        }
        Do not include any markdown formatting or backticks. Return ONLY the raw JSON string.
        If it's clearly not a medicine, return {"error": "Not a valid medicine"}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          temperature: 0.2, // Low temperature for more factual responses
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim() || "";
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }
      
      const data = JSON.parse(jsonMatch[0]);

      if (data.error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("AI Scraping failed:", error);
      return null;
    }
  }

  /**
   * Spellchecks a medical query. If it's a typo, returns the correct name.
   */
  static async spellcheckMedicineName(query: string) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) return query; // Fallback to original query
    const ai = new GoogleGenAI({ apiKey });

    try {
      const prompt = `
        You are a medical spellchecker. A user searched for "${query}".
        If there is a typo, return the correct standard medical or brand name.
        If it is correctly spelled, return it exactly as is.
        Return ONLY a JSON object with this structure:
        { "corrected": "string" }
        Do not include markdown or backticks. Return raw JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim() || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.corrected || query;
      }
      return query;
    } catch (error) {
      console.error("AI Spellcheck failed:", error);
      return query;
    }
  }

  /**
   * Uses Gemini Vision AI to verify if an uploaded image is a valid prescription.
   */
  static async analyzePrescriptionImage(base64Image: string, mimeType: string) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Mocking verification for dev.");
      return { isValid: true, extractedMedicines: ["Mock Medicine"], doctorName: "Dr. Mock" };
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
      const prompt = `
        You are an advanced medical document verification AI. Analyze this image.
        Is it a valid medical prescription written by a doctor? 
        If it is, extract the doctor's name and an array of the prescribed medicines.
        Return ONLY a JSON object exactly like this:
        {
          "isValid": boolean,
          "doctorName": "string or null",
          "extractedMedicines": ["string array"]
        }
        Do not include markdown or backticks. Return raw JSON only.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ]
      });

      const responseText = response.text?.trim() || "";
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("AI Prescription Verification failed:", error);
      return { isValid: false, error: "Verification failed. Please try again or upload a clearer image." };
    }
  }

  /**
   * Generates comprehensive medical details (side effects, usage, interactions) for a given medicine.
   */
  static async generateComprehensiveMedicineDetails(medicineName: string) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return null;
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
      const prompt = `
        You are a professional medical database API. A user is viewing the medicine: "${medicineName}".
        Provide comprehensive medical details for this medicine in a strictly formatted JSON object.
        Structure:
        {
          "uses": ["Array", "of", "diseases", "or", "conditions", "this treats"],
          "howToUse": "A concise paragraph explaining how to use it.",
          "sideEffects": ["Array", "of", "common", "side effects"],
          "interactions": ["Array", "of", "things", "it interacts with (food, other drugs)"],
          "warnings": ["Array", "of", "important", "medical warnings"]
        }
        Do not include any markdown formatting or backticks. Return ONLY the raw JSON string.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim() || "";
      
      // Extract just the JSON object using regex to ignore any conversational filler
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Failed to parse JSON from AI response:", responseText);
        return { error: "Failed to parse JSON from AI response: " + responseText };
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error("AI Medical Details Generation failed:", error);
      return { error: "Gemini API exception: " + (error.message || String(error)) };
    }
  }
}
