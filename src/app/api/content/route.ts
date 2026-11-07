import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const blocks = await prisma.contentBlock.findMany();
    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("Content GET error:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { key, title, content, metadataJson } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Content key is required" }, { status: 400 });
    }

    const updated = await prisma.contentBlock.upsert({
      where: { key },
      update: {
        title: title || undefined,
        content: content || undefined,
        metadataJson: metadataJson !== undefined ? metadataJson : undefined,
      },
      create: {
        key,
        title: title || key,
        content: content || "",
        metadataJson: metadataJson || null,
      },
    });

    return NextResponse.json({ success: true, block: updated });
  } catch (error) {
    console.error("Content PUT error:", error);
    return NextResponse.json({ error: "Failed to update content block" }, { status: 500 });
  }
}
