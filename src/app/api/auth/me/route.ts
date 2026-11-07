import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
