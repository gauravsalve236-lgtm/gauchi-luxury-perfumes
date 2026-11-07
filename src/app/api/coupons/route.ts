import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
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
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      perCustomerLimit,
      startDate,
      expiryDate,
      isActive,
      applicableCategories,
    } = await req.json();

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Code, discountType, and discountValue are required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: parseFloat(minPurchase) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        applicableCategories,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "COUPON_CREATE",
        entity: "Coupon",
        entityId: coupon.id,
        detailsJson: JSON.stringify({ code: coupon.code, discountValue: coupon.discountValue }),
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error("Coupons POST error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
