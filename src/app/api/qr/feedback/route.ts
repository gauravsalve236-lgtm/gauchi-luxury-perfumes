import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      campaignId,
      customerName,
      customerEmail,
      customerPhone,
      rating,
      feedback,
      preferredFamily,
      hasMarketingConsent,
    } = await req.json();

    if (!campaignId || !customerName || !rating || !feedback) {
      return NextResponse.json({ error: "Name, rating, and feedback are required" }, { status: 400 });
    }

    const numericRating = parseInt(rating, 10);

    const result = await prisma.$transaction(async (tx) => {
      const fb = await tx.qrFeedback.create({
        data: {
          campaignId,
          customerName: customerName.trim(),
          customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : null,
          customerPhone: customerPhone ? customerPhone.trim() : null,
          rating: numericRating,
          feedback: feedback.trim(),
          preferredFamily: preferredFamily || null,
          hasMarketingConsent: Boolean(hasMarketingConsent),
        },
      });

      await tx.qrCampaign.update({
        where: { id: campaignId },
        data: { feedbackCount: { increment: 1 } },
      });

      // If customer opted into marketing, register subscriber
      if (hasMarketingConsent && customerEmail) {
        await tx.newsletterSubscriber.upsert({
          where: { email: customerEmail.toLowerCase().trim() },
          update: {
            hasMarketingConsent: true,
            isSubscribed: true,
            preferredFamily: preferredFamily || undefined,
            phone: customerPhone || undefined,
          },
          create: {
            email: customerEmail.toLowerCase().trim(),
            phone: customerPhone || null,
            preferredFamily: preferredFamily || null,
            hasMarketingConsent: true,
            source: "QR_EXPERIENCE",
          },
        });
      }

      return fb;
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for sharing your experience with Gauchi!",
      feedback: result,
    });
  } catch (error) {
    console.error("QR feedback error:", error);
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
