import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json({ error: "This coupon has not started yet" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    const currentSubtotal = parseFloat(subtotal) || 0;
    if (currentSubtotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this coupon is ₹${coupon.minPurchase}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "FIXED") {
      discountAmount = Math.min(coupon.discountValue, currentSubtotal);
    } else if (coupon.discountType === "FREE_SHIPPING") {
      discountAmount = 99; // Standard flat shipping waiver
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discountAmount,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ error: "Server error validating coupon" }, { status: 500 });
  }
}
