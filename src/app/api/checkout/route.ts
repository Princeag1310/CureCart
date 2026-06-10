import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { OrderService } from "@/services/order.service";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process checkout using the safe Prisma Transaction
    const order = await OrderService.checkoutCart(session.user.id);
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    // This will catch out-of-stock errors and race-condition transaction failures
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
