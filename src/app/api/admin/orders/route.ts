import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { prisma } from "@/config/db";
import { EmailService } from "@/services/email.service";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    // Fire-and-forget: notify customer by email on shipment/delivery.
    // Runs async so it never blocks or fails the admin's response.
    if (status === "SHIPPED" || status === "DELIVERED") {
      if (order.user?.email) {
        EmailService.sendOrderStatusEmail(
          order.user.email,
          order.user.name || "Customer",
          order.id,
          status
        ).catch((err) => console.error("Failed to send order status email", err));
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}