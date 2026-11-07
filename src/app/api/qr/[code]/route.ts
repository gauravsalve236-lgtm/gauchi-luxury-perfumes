import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const cleanCode = code.toLowerCase().trim();

    const campaign = await prisma.qrCampaign.findUnique({
      where: { code: cleanCode },
      include: {
        product: {
          include: {
            variants: true,
            images: {
              where: { isPrimary: true },
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "QR destination not found" }, { status: 404 });
    }

    // Log scan event asynchronously
    const userAgent = req.headers.get("user-agent") || "unknown";
    const referer = req.headers.get("referer") || "direct";

    await prisma.$transaction([
      prisma.qrCampaign.update({
        where: { id: campaign.id },
        data: { scanCount: { increment: 1 } },
      }),
      prisma.qrScanEvent.create({
        data: {
          campaignId: campaign.id,
          userAgent: userAgent.slice(0, 200),
          referer: referer.slice(0, 200),
        },
      }),
    ]);

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("QR destination error:", error);
    return NextResponse.json({ error: "Failed to load QR destination" }, { status: 500 });
  }
}
