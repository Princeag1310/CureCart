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

    // 2. Check cache (we use the dedicated columns)
    if (medicine.howToUse) {
      return NextResponse.json({
        uses: medicine.uses,
        howToUse: medicine.howToUse,
        sideEffects: medicine.sideEffectsList,
        interactions: medicine.interactionsList,
        warnings: medicine.warnings
      });
    }

    // 3. Generate dynamically via Gemini
    const aiDetails = await AIService.generateComprehensiveMedicineDetails(medicine.name);

    if (!aiDetails || aiDetails.error) {
      console.error("[AI Details] Failed to generate details for:", medicine.name, aiDetails?.error);
      return NextResponse.json({ 
        howToUse: "Please consult your doctor or pharmacist for specific usage instructions.",
        sideEffects: ["Information not currently available. Consult a healthcare professional."],
        interactions: ["Consult your doctor before mixing with other medications."],
        warnings: [
          "If you experience any adverse reactions, seek medical help immediately.",
          "Our AI service is currently experiencing high traffic. Please check back later for detailed information."
        ]
      });
    }

    // 4. Save to DB for future caching
    try {
      await prisma.medicine.update({
        where: { id: medicineId },
        data: {
          uses: aiDetails.uses || [],
          howToUse: aiDetails.howToUse || null,
          sideEffectsList: aiDetails.sideEffects || [],
          interactionsList: aiDetails.interactions || [],
          warnings: aiDetails.warnings || []
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
