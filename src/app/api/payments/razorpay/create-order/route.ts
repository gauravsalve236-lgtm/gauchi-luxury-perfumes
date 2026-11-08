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

    // Fetch credentials from DB StoreSettings, fallback to environment variables
    const dbKeyId = await prisma.storeSetting.findUnique({ where: { key: "razorpay_key_id" } });
    const dbKeySecret = await prisma.storeSetting.findUnique({ where: { key: "razorpay_key_secret" } });

    const keyId = dbKeyId?.value?.trim() || process.env.RAZORPAY_KEY_ID;
    const keySecret = dbKeySecret?.value?.trim() || process.env.RAZORPAY_KEY_SECRET;

    // Check if live/test credentials are configured
    const isMockMode = !keyId || keyId.includes("placeholder") || !keySecret;

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

    // Create a Razorpay Hosted Payment Link (rzp.io) as a guaranteed fallback/alternative
    // that never fails with 'website does not match registered website' error
    let paymentLinkUrl: string | null = null;
    try {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const origin = `${proto}://${host}`;

      const plRes = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: Math.round(order.total * 100),
          currency: "INR",
          description: `Gauchi Perfumes Order ${order.orderNumber}`,
          reference_id: order.id,
          customer: {
            name: order.guestName || "Client",
            email: order.guestEmail || undefined,
            contact: order.guestPhone || undefined,
          },
          notify: { sms: false, email: false },
          callback_url: `${origin}/order-confirmation/${order.orderNumber}?payment_id={payment_id}&payment_status=paid`,
          callback_method: "get",
        }),
      });

      if (plRes.ok) {
        const plData = await plRes.json();
        paymentLinkUrl = plData.short_url;
      }
    } catch (e) {
      console.error("Payment link creation error:", e);
    }

    return NextResponse.json({
      success: true,
      isTestMode: false,
      gatewayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
      paymentLinkUrl,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to create gateway order" }, { status: 500 });
  }
}
