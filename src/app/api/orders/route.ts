import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const where: any = {};

    if (user.role === "ADMIN") {
      if (status && status !== "ALL") {
        where.orderStatus = status;
      }
      if (search) {
        const q = search.trim();
        where.OR = [
          { orderNumber: { contains: q } },
          { guestName: { contains: q } },
          { guestEmail: { contains: q } },
          { trackingNumber: { contains: q } },
        ];
      }
    } else {
      // Customer: can only see their own orders
      where.userId = user.userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      items,
      shippingAddress,
      paymentMethod, // "COD" or "RAZORPAY"
      couponCode,
      notes,
    } = body;

    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Missing required order information" }, { status: 400 });
    }

    const { fullName, phone, email, street, apartment, city, state, postalCode } = shippingAddress;
    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    // 1. Verify variants, fetch live prices and verify stock
    const variantIds = items.map((i: any) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== items.length) {
      return NextResponse.json({ error: "One or more items in cart are invalid or no longer available" }, { status: 400 });
    }

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const v = variants.find((variant) => variant.id === item.variantId);
      if (!v) {
        return NextResponse.json({ error: `Variant not found` }, { status: 400 });
      }

      if (v.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${v.product.name} (${v.size}). Only ${v.stock} available.` },
          { status: 400 }
        );
      }

      const itemTotal = v.price * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItemsData.push({
        productId: v.productId,
        variantId: v.id,
        productName: v.product.name,
        variantSize: v.size,
        unitPrice: v.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 2. Validate Coupon server-side
    let discount = 0;
    let validCoupon: any = null;
    if (couponCode) {
      validCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (validCoupon && validCoupon.isActive && calculatedSubtotal >= validCoupon.minPurchase) {
        if (validCoupon.discountType === "PERCENTAGE") {
          discount = (calculatedSubtotal * validCoupon.discountValue) / 100;
          if (validCoupon.maxDiscount && discount > validCoupon.maxDiscount) {
            discount = validCoupon.maxDiscount;
          }
        } else if (validCoupon.discountType === "FIXED") {
          discount = Math.min(validCoupon.discountValue, calculatedSubtotal);
        } else if (validCoupon.discountType === "FREE_SHIPPING") {
          discount = 99;
        }
      }
    }

    // 3. Shipping fee calculation (Free over ₹1499 or FREE_SHIPPING coupon)
    let shippingFee = 99;
    if (calculatedSubtotal >= 1499 || validCoupon?.discountType === "FREE_SHIPPING") {
      shippingFee = 0;
    }

    const total = Math.max(0, calculatedSubtotal - discount + shippingFee);

    // 4. Generate Order Number
    const count = await prisma.order.count();
    const orderNumber = `GAU-${new Date().getFullYear()}-${1000 + count + 1}`;

    // 5. Payment status initialization
    const paymentStatus = paymentMethod === "COD" ? "PENDING" : "PENDING";
    const orderStatus = paymentMethod === "COD" ? "CONFIRMED" : "PENDING";

    // 6. Save Order in Transaction: order create, stock deduction, inventory movements, coupon count
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user ? user.userId : null,
          guestEmail: email || user?.email || null,
          guestName: fullName,
          guestPhone: phone,
          subtotal: calculatedSubtotal,
          discount,
          couponCode: validCoupon ? validCoupon.code : null,
          shippingFee,
          tax: 0,
          total,
          paymentMethod,
          paymentStatus,
          orderStatus,
          shippingAddressJson: JSON.stringify(shippingAddress),
          internalNotes: notes || null,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: [
              {
                status: orderStatus,
                notes: paymentMethod === "COD" ? "Order confirmed via Cash on Delivery" : "Awaiting payment verification",
                changedBy: user ? user.name : "Guest Customer",
              },
            ],
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // Deduct stock for each variant and log movement
      for (const item of items) {
        const v = variants.find((variant) => variant.id === item.variantId)!;
        const newStock = v.stock - item.quantity;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: newStock },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            quantityChange: -item.quantity,
            previousStock: v.stock,
            newStock,
            reason: "SALE",
            referenceId: order.orderNumber,
          },
        });
      }

      // Increment coupon usage
      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
