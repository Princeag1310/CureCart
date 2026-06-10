import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { CartService } from "@/services/cart.service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await CartService.getCart(session.user.id);
    return NextResponse.json(cart);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { medicineId, quantity } = body;

    if (!medicineId) {
      return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });
    }

    const cartItem = await CartService.addToCart(session.user.id, medicineId, quantity || 1);
    return NextResponse.json(cartItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
