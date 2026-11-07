import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const adminCheck = await getCurrentUser();
    const isAdmin = adminCheck?.role === "ADMIN";

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    // Customers only see approved reviews; admins see all for moderation
    if (!isAdmin) {
      where.isApproved = true;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const { productId, customerName, customerEmail, rating, title, comment } = body;

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    const numericRating = parseInt(rating, 10);
    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check genuine verified purchase
    let isVerifiedPurchase = false;
    let matchedOrderId: string | null = null;

    const emailToCheck = user?.email || customerEmail;
    if (emailToCheck) {
      const pastDeliveredOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { guestEmail: emailToCheck.toLowerCase().trim() },
            user ? { userId: user.userId } : {},
          ],
          orderStatus: "DELIVERED",
          items: {
            some: { productId },
          },
        },
      });

      if (pastDeliveredOrder) {
        isVerifiedPurchase = true;
        matchedOrderId = pastDeliveredOrder.id;
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user ? user.userId : null,
        orderId: matchedOrderId,
        customerName: customerName.trim(),
        customerEmail: emailToCheck ? emailToCheck.toLowerCase().trim() : null,
        rating: numericRating,
        title: title ? title.trim() : null,
        comment: comment.trim(),
        isVerifiedPurchase,
        isApproved: false, // Requires admin moderation before public listing
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted for moderation and will appear once approved.",
      review,
    }, { status: 201 });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
