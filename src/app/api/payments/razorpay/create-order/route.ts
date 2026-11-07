import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if live/test credentials are configured
    const isMockMode = !keyId || keyId.includes("placeholder");

    if (isMockMode) {
      // In development / demo test mode without live gateway keys:
      // Generate a mock gateway order ID so the checkout flow can be tested locally
      const mockGatewayOrderId = `order_test_${Date.now()}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentGatewayOrderId: mockGatewayOrderId },
      });

      return NextResponse.json({
        success: true,
        isTestMode: true,
        gatewayOrderId: mockGatewayOrderId,
        amount: Math.round(order.total * 100), // in paise
        currency: "INR",
        keyId: "rzp_test_placeholder",
        message: "Simulated payment gateway ready for testing",
      });
    }

    // Call official Razorpay Orders API
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: Math.round(order.total * 100),
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          customerName: order.guestName,
          orderNumber: order.orderNumber,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.description || "Gateway error" }, { status: 500 });
    }

    const rzpOrder = await response.json();

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentGatewayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      success: true,
      isTestMode: false,
      gatewayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to create gateway order" }, { status: 500 });
  }
}
