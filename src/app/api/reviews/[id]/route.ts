import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { isApproved, adminResponse } = await req.json();

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isApproved: isApproved !== undefined ? Boolean(isApproved) : undefined,
        adminResponse: adminResponse !== undefined ? adminResponse : undefined,
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("Review PUT error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
