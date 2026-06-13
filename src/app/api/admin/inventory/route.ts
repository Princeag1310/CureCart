import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { prisma } from "@/config/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, price, stock, manufacturer, category, requiresPrescription, packaging, composition } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: "Name, price, and stock are required" }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        manufacturer,
        category,
        packaging,
        composition,
        requiresPrescription: Boolean(requiresPrescription),
      }
    });

    return NextResponse.json(medicine);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, price, stock, manufacturer, category, requiresPrescription, packaging, composition } = body;

    if (!id) return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(manufacturer !== undefined && { manufacturer }),
        ...(category !== undefined && { category }),
        ...(packaging !== undefined && { packaging }),
        ...(composition !== undefined && { composition }),
        ...(requiresPrescription !== undefined && { requiresPrescription: Boolean(requiresPrescription) }),
      }
    });

    return NextResponse.json(medicine);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });

    await prisma.medicine.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
