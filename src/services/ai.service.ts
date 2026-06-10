import { GoogleGenerativeAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
// Initialize the AI SDK. It will throw an error if no API key is provided and we try to use it.
const ai = new GoogleGenerativeAI({ apiKey });

export class AIService {
  /**
   * Given a medicine name, uses Gemini to search and structure medical information.
   * Prompts the AI to act as a medical data scraper and return pure JSON.
   */
  static async scrapeMedicineDetails(query: string) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Returning fallback data.");
      return null;
    }

    try {
      const prompt = `
        You are a medical data scraper. A user has searched for the medicine/drug: "${query}".
        If this is a valid medicine, return a JSON object with the following structure:
        {
          "name": "Proper name of the medicine",
          "description": "A short, professional description of what it treats and its active ingredients",
          "manufacturer": "Likely manufacturer or generic label",
          "price": A realistic estimated price in INR (number only),
          "requiresPrescription": boolean true/false based on standard regulations,
          "image": null
        }
        Do not include any markdown formatting or backticks. Return ONLY the raw JSON string.
        If it's clearly not a medicine, return {"error": "Not a valid medicine"}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2, // Low temperature for more factual responses
        }
      });

      const responseText = response.text?.trim() || "";
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '');
      
      const data = JSON.parse(jsonStr);

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
   * Uses Gemini Vision AI to verify if an uploaded image is a valid prescription.
   */
  static async analyzePrescriptionImage(base64Image: string, mimeType: string) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Mocking verification for dev.");
      return { isValid: true, extractedMedicines: ["Mock Medicine"], doctorName: "Dr. Mock" };
    }

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
        model: "gemini-2.5-flash",
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
}
