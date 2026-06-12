import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { AIService } from "@/services/ai.service";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Double check if it already exists in DB (to prevent duplicate scrapes if multiple users search at same time)
    const existing = await prisma.medicine.findFirst({
      where: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      }
    });

    if (existing) {
      return NextResponse.json({ ...existing, _source: "db_direct" });
    }

    // 2. AI Spellcheck - Let's see if the user made a typo
    console.log(`[AI Spellchecker] Checking spelling for "${query}"...`);
    const correctedQuery = await AIService.spellcheckMedicineName(query);
    
    if (correctedQuery.toLowerCase() !== query.toLowerCase()) {
      console.log(`[AI Spellchecker] Corrected "${query}" to "${correctedQuery}"`);
      
      // Check if the CORRECTED spelling exists in the database
      const existingCorrected = await prisma.medicine.findFirst({
        where: {
          name: {
            contains: correctedQuery,
            mode: "insensitive"
          }
        }
      });

      if (existingCorrected) {
        return NextResponse.json({ 
          ...existingCorrected, 
          _source: "db_corrected", 
          _originalQuery: query,
          _correctedQuery: correctedQuery 
        });
      }
    }

    // 3. Trigger AI Scraper using the best available spelling
    const searchTarget = correctedQuery || query;
    console.log(`[AI Engine - Client Triggered] Scraping web for "${searchTarget}"...`);
    const aiData = await AIService.scrapeMedicineDetails(searchTarget);

    if (!aiData) {
      return NextResponse.json({ error: "No medical data could be found for this search term." }, { status: 404 });
    }

    // 3. Save to database
    const newMedicine = await prisma.medicine.create({
      data: {
        name: aiData.name,
        description: aiData.description,
        manufacturer: aiData.manufacturer,
        price: aiData.price,
        requiresPrescription: aiData.requiresPrescription,
        stock: 100, // Default stock
        category: aiData.requiresPrescription ? "Prescription Drugs" : "OTC Products"
      }
    });

    return NextResponse.json(newMedicine);
  } catch (error: any) {
    console.error("AI Scrape API Error:", error);
    return NextResponse.json({ error: "Failed to scrape medicine details" }, { status: 500 });
  }
}
