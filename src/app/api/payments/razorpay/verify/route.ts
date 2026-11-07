import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing required payment verification details" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMockMode = !keySecret || keySecret.includes("placeholder");

    let isVerified = false;

    if (isMockMode) {
      // In local test mode, accept simulated test signatures
      isVerified = true;
    } else {
      // Cryptographic signature check: HMAC SHA256 of order_id + "|" + payment_id
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      isVerified = expectedSignature === razorpaySignature;
    }

    if (!isVerified) {
      // Record payment failure
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.json(
        { error: "Payment verification failed: invalid signature" },
        { status: 400 }
      );
    }

    // Payment Verified! Update order status to PAID and CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        paymentGatewayPaymentId: razorpayPaymentId,
        paymentSignature: razorpaySignature || "verified_test_signature",
      },
      include: {
        items: true,
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "CONFIRMED",
        notes: `Online payment of ₹${order.total} verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`,
        changedBy: "Payment Gateway Webhook/Verify",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Server error during payment verification" }, { status: 500 });
  }
}
