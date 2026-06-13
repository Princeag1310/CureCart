import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { prisma } from "@/config/db";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, price, stock, manufacturer, category, requiresPrescription, packaging, composition, image, imageFileId } = body;

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
        image,
        imageFileId,
        requiresPrescription: Boolean(requiresPrescription),
      }
    });

    return NextResponse.json(medicine);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create medicine" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, price, stock, manufacturer, category, requiresPrescription, packaging, composition, image, imageFileId } = body;

    if (!id) return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });

    const existingMed = await prisma.medicine.findUnique({ where: { id } });
    if (!existingMed) return NextResponse.json({ error: "Medicine not found" }, { status: 404 });

    if (imageFileId && existingMed.imageFileId && existingMed.imageFileId !== imageFileId) {
      try {
        await imagekit.deleteFile(existingMed.imageFileId);
      } catch (err) {
        console.error("Failed to delete old image from ImageKit:", err);
      }
    }

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
        ...(image !== undefined && { image }),
        ...(imageFileId !== undefined && { imageFileId }),
        ...(requiresPrescription !== undefined && { requiresPrescription: Boolean(requiresPrescription) }),
      }
    });

    return NextResponse.json(medicine);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });

    const existingMed = await prisma.medicine.findUnique({ where: { id } });
    
    if (existingMed?.imageFileId) {
      try {
        await imagekit.deleteFile(existingMed.imageFileId);
      } catch (err) {
        console.error("Failed to delete image from ImageKit:", err);
      }
    }

    await prisma.medicine.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}
