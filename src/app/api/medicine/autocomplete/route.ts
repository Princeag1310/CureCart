import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        image: true
      },
      take: 5
    });

    return NextResponse.json(medicines);
  } catch (error: any) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
