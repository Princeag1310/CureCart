import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const user = await AuthService.registerUser(email, password, name);

    return NextResponse.json(
      { message: "Registration successful", user },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes("already registered")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
