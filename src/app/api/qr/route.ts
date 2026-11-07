import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const campaigns = await prisma.qrCampaign.findMany({
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
        feedbackList: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("QR campaigns GET error:", error);
    return NextResponse.json({ error: "Failed to fetch QR campaigns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      code,
      title,
      productId,
      variantSize,
      marketplaceSource,
      amazonReviewUrl,
      flipkartReviewUrl,
    } = await req.json();

    if (!code || !title) {
      return NextResponse.json({ error: "Code and title are required" }, { status: 400 });
    }

    const cleanCode = code
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-");

    const campaign = await prisma.qrCampaign.create({
      data: {
        code: cleanCode,
        title,
        productId: productId || null,
        variantSize: variantSize || null,
        marketplaceSource: marketplaceSource || "GAUCHI_BOX",
        amazonReviewUrl,
        flipkartReviewUrl,
      },
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error("QR campaign POST error:", error);
    return NextResponse.json({ error: "Failed to create QR campaign" }, { status: 500 });
  }
}
