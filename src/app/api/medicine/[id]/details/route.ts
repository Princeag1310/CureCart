import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { AIService } from "@/services/ai.service";

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
      return NextResponse.json({ error: "Failed to generate details" }, { status: 500 });
    }

    // 4. Save to DB for future caching
    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        interactions: JSON.stringify(aiDetails)
      }
    });

    return NextResponse.json(aiDetails);
  } catch (error: any) {
    console.error("Error fetching medicine details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
