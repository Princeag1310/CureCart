import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { AIService } from "@/services/ai.service";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const medicineId = resolvedParams.id;

    // 1. Fetch medicine
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    // 2. Check cache (we use the existing `interactions` field to store the full AI JSON)
    if (medicine.interactions && medicine.interactions.trim().startsWith("{")) {
      try {
        const cachedData = JSON.parse(medicine.interactions);
        return NextResponse.json(cachedData);
      } catch (e) {
        // Fallback to regeneration if JSON is malformed
        console.warn("Malformed JSON in interactions field. Regenerating.");
      }
    }

    // 3. Generate dynamically via Gemini
    const aiDetails = await AIService.generateComprehensiveMedicineDetails(medicine.name);

    if (!aiDetails) {
      console.error("[AI Details] Failed to generate details for:", medicine.name);
      return NextResponse.json({ 
        howToUse: "Please consult your doctor or pharmacist for specific usage instructions.",
        sideEffects: ["Information not currently available. Consult a healthcare professional."],
        interactions: ["Consult your doctor before mixing with other medications."],
        warnings: ["If you experience any adverse reactions, seek medical help immediately."]
      });
    }

    // 4. Save to DB for future caching
    try {
      await prisma.medicine.update({
        where: { id: medicineId },
        data: {
          interactions: JSON.stringify(aiDetails)
        }
      });
    } catch (dbError) {
      console.error("[AI Details] Failed to save cached interactions to DB, but returning details anyway:", dbError);
    }

    return NextResponse.json(aiDetails);
  } catch (error: any) {
    console.error("[AI Details] Fatal error fetching medicine details:", error);
    // Return a safe fallback instead of completely breaking the UI with a 500
    return NextResponse.json({ 
      howToUse: "Please consult your doctor or pharmacist for specific usage instructions.",
      sideEffects: ["Information not currently available."],
      interactions: [],
      warnings: []
    });
  }
}
