import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { campaignId, linkType } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    await prisma.qrCampaign.update({
      where: { id: campaignId },
      data: { reviewClickCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, linkType });
  } catch (error) {
    console.error("QR click error:", error);
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
