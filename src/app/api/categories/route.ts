import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, slug, description, imageUrl, displayOrder } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const category = await prisma.category.create({
      data: {
        name,
        slug: cleanSlug,
        description,
        imageUrl,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
