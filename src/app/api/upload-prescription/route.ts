import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { AIService } from "@/services/ai.service";
import { prisma } from "@/config/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;

    // 1. Send to Gemini Vision AI for analysis
    const aiAnalysis = await AIService.analyzePrescriptionImage(base64Image, mimeType);

    if (!aiAnalysis || !aiAnalysis.isValid) {
      return NextResponse.json({ 
        error: aiAnalysis?.error || "Invalid prescription detected by AI. Please upload a clear, valid doctor's prescription." 
      }, { status: 400 });
    }

    // 2. Save the prescription record to the database
    // In production, we would upload the file to S3 and save the URL. 
    // Here we save a placeholder or the base64 string (though base64 in DB is bad for scale)
    const prescription = await prisma.prescription.create({
      data: {
        userId: session.user.id,
        imageUrl: "s3_placeholder_url", // Placeholder for actual S3 URL
        verified: true,
        // we could also save aiAnalysis.doctorName and aiAnalysis.extractedMedicines in a JSON field if we added it to Prisma schema
      }
    });

    return NextResponse.json({
      success: true,
      message: "Prescription verified successfully via AI",
      prescriptionId: prescription.id,
      analysis: aiAnalysis
    });

  } catch (error: any) {
    console.error("Prescription Upload Error:", error);
    return NextResponse.json({ error: "Failed to process prescription" }, { status: 500 });
  }
}
