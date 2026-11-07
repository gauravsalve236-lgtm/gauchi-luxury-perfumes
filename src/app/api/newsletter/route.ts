import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, birthday, preferredFamily } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: {
        isSubscribed: true,
        hasMarketingConsent: true,
        birthday: birthday || undefined,
        preferredFamily: preferredFamily || undefined,
      },
      create: {
        email: cleanEmail,
        birthday: birthday || null,
        preferredFamily: preferredFamily || null,
        hasMarketingConsent: true,
        isSubscribed: true,
        source: "WEBSITE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Welcome to the Gauchi Circle. Your exclusive 10% privilege code is GAUCHI10.",
      subscriber,
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
