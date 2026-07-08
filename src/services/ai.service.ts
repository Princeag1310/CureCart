import { GoogleGenAI } from "@google/genai";
import { tavily } from "@tavily/core";

/**
 * AIService
 * ------------------------------------------------------------------
 * This service encapsulates all AI-powered features used by the application.
 *
 * AI Stack:
 * 1. Tavily Search
 *    - Retrieves fresh information from the web.
 *    - Acts as the Retrieval step in the RAG pipeline.
 *
 * 2. Gemini (Google GenAI)
 *    - Uses the retrieved context together with its own knowledge.
 *    - Produces structured JSON responses.
 *
 * RAG Flow:
 *
 * User Query
 *      │
 *      ▼
 * performTavilySearch()
 *      │
 *      ▼
 * Latest Web Context
 *      │
 *      ▼
 * Prompt + Context
 *      │
 *      ▼
 * Gemini
 *      │
 *      ▼
 * Structured JSON
 *
 * Benefits:
 * - Uses fresh information instead of relying only on LLM knowledge.
 * - Produces deterministic JSON for backend consumption.
 * - Easily extendable for additional AI-powered endpoints.
 */
export class AIService {

  /**
   * Performs a Tavily web search.
   *
   * This is the Retrieval stage of the RAG pipeline.
   *
   * Instead of asking Gemini directly, we first fetch recent
   * information from trusted web pages. Their content is merged into
   * one text block and injected into the prompt.
   *
   * Search depth:
   * - basic    -> faster, lower cost
   * - advanced -> deeper search with richer context
   */
  static async performTavilySearch(
    query: string,
    searchDepth: "basic" | "advanced" = "basic"
  ): Promise<string> {

    const apiKey = process.env.TAVILY_API_KEY || "";
    if (!apiKey) return "";

    try {
      const tvly = tavily({ apiKey });

      const response = await tvly.search(query, {
        searchDepth,
        maxResults: 3
      });

      // Combine the content from multiple search results into one
      // context block that can be injected into Gemini prompts.
      return response.results.map(r => r.content).join("\n\n");

    } catch (error) {
      console.error("[Tavily] Search failed:", error);

      // Continue gracefully.
      // Gemini will rely on its internal knowledge if retrieval fails.
      return "";
    }
  }

  /**
   * Retrieves medicine information using a RAG pipeline.
   *
   * Pipeline:
   *
   * User Query
   *      ↓
   * Tavily Search
   *      ↓
   * Latest Context
   *      ↓
   * Gemini
   *      ↓
   * Structured Medicine JSON
   *
   * Tavily provides fresh web information while Gemini converts it into
   * a predictable JSON format suitable for the frontend.
   */
  static async scrapeMedicineDetails(query: string) {

    const apiKey = process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Returning fallback data.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {

      // Retrieve fresh medicine-related information.
      const searchContext = await this.performTavilySearch(
        `${query} medicine active ingredients price prescription status`,
        "basic"
      );

      const prompt = `
        You are a medical data scraper. A user has searched for the medicine/drug: "${query}".
        Here is the live data scraped from the web:
        ---
        ${searchContext || "No live data available. Rely on your internal knowledge."}
        ---

        If this is a valid medicine, return a JSON object with the following structure:
        {
          "name": "Proper name of the medicine",
          "manufacturer": "Likely manufacturer or generic label",
          "price": A realistic estimated price in INR (number only),
          "requiresPrescription": boolean true/false based on standard regulations,
          "image": null
        }
        Do not include any markdown formatting or backticks.
        Return ONLY the raw JSON string.
        If it's clearly not a medicine, return {"error": "Not a valid medicine"}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          // Low temperature improves factual consistency.
          temperature: 0.2,

          // Ask Gemini to generate JSON directly.
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim() || "";

      // Extract JSON even if Gemini accidentally adds extra text.
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
   * Uses Gemini to correct spelling mistakes in medicine names.
   *
   * This endpoint does NOT use RAG because spelling correction does not
   * require live web information.
   */
  static async spellcheckMedicineName(query: string) {

    const apiKey = process.env.GEMINI_API_KEY || "";

    if (!apiKey) return query;

    const ai = new GoogleGenAI({ apiKey });

    try {

      const prompt = `
        You are a medical spellchecker. A user searched for "${query}".
        If there is a typo, return the correct standard medical or brand name.
        If it is correctly spelled, return it exactly as is.
        Return ONLY a JSON object with this structure:
        { "corrected": "string" }
        Do not include markdown or backticks.
        Return raw JSON.
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
   * Uses Gemini Vision to verify uploaded prescriptions.
   *
   * Unlike text generation endpoints, this uses multimodal input
   * (prompt + image).
   *
   * Expected output:
   * - Whether the prescription is valid
   * - Doctor name
   * - List of extracted medicines
   */
  static async analyzePrescriptionImage(
    base64Image: string,
    mimeType: string
  ) {

    const apiKey = process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Mocking verification for dev.");

      return {
        isValid: true,
        extractedMedicines: ["Mock Medicine"],
        doctorName: "Dr. Mock"
      };
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
        Do not include markdown or backticks.
        Return raw JSON only.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType
            }
          }
        ]
      });

      const responseText = response.text?.trim() || "";

      // Remove accidental markdown formatting before parsing.
      const jsonStr = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '');

      return JSON.parse(jsonStr);

    } catch (error) {
      console.error("AI Prescription Verification failed:", error);

      return {
        isValid: false,
        error: "Verification failed. Please try again or upload a clearer image."
      };
    }
  }

  /**
   * Generates detailed medicine information using RAG.
   *
   * Compared to scrapeMedicineDetails(), this endpoint performs a deeper
   * Tavily search because richer context is required.
   *
   * Retrieval:
   *   Tavily (advanced search)
   *
   * Generation:
   *   Gemini produces structured medical information including:
   *   - Uses
   *   - Side effects
   *   - Drug interactions
   *   - Warnings
   */
  static async generateComprehensiveMedicineDetails(medicineName: string) {

    const apiKey = process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {

      // Advanced search retrieves more detailed medical context.
      const searchContext = await this.performTavilySearch(
        `${medicineName} uses side effects interactions warnings`,
        "advanced"
      );

      const prompt = `
        You are a professional medical database API. A user is viewing the medicine: "${medicineName}".
        Here is the latest medical data retrieved from trusted sources:
        ---
        ${searchContext || "No live data available. Rely on your internal knowledge."}
        ---

        Provide comprehensive medical details for this medicine in a strictly formatted JSON object.
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

      if (!jsonMatch) {
        console.error("Failed to parse JSON from AI response:", responseText);
        return {
          error: "Failed to parse JSON from AI response: " + responseText
        };
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error: any) {
      console.error("AI Medical Details Generation failed:", error);

      return {
        error: "Gemini API exception: " + (error.message || String(error))
      };
    }
  }
}
