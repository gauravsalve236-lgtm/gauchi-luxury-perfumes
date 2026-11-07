import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true } },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control: admins can view any; logged in users can view their own; guests with exact order id/number can view confirmation
    if (user && user.role !== "ADMIN" && order.userId && order.userId !== user.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { orderStatus, trackingNumber, courierName, internalNotes, cancelReason } = body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";

    // Non-admin can only request cancellation if order is PENDING or CONFIRMED
    if (!isAdmin) {
      if (order.userId !== user.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (orderStatus !== "CANCELLED") {
        return NextResponse.json({ error: "Customers can only cancel eligible orders" }, { status: 400 });
      }

      if (order.orderStatus !== "PENDING" && order.orderStatus !== "CONFIRMED") {
        return NextResponse.json({ error: "Order has already been dispatched and cannot be cancelled directly" }, { status: 400 });
      }
    }

    // Check if we are transitioning to CANCELLED and restore stock
    const isCancelling = orderStatus === "CANCELLED" && order.orderStatus !== "CANCELLED";

    const updated = await prisma.$transaction(async (tx) => {
      if (isCancelling) {
        for (const item of order.items) {
          if (item.variantId) {
            const v = await tx.productVariant.findUnique({ where: { id: item.variantId } });
            if (v) {
              const restoredStock = v.stock + item.quantity;
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: restoredStock },
              });

              await tx.inventoryMovement.create({
                data: {
                  variantId: item.variantId,
                  quantityChange: item.quantity,
                  previousStock: v.stock,
                  newStock: restoredStock,
                  reason: "RETURN_CANCEL",
                  referenceId: order.orderNumber,
                },
              });
            }
          }
        }
      }

      // Add to status history if status changed
      if (orderStatus && orderStatus !== order.orderStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: orderStatus,
            notes: cancelReason || (isAdmin ? `Status updated by admin (${user.email})` : "Cancelled by customer"),
            changedBy: user.email,
          },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: orderStatus || undefined,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
          courierName: courierName !== undefined ? courierName : undefined,
          internalNotes: internalNotes !== undefined ? internalNotes : undefined,
          cancelReason: cancelReason !== undefined ? cancelReason : undefined,
          paymentStatus: orderStatus === "CANCELLED" && order.paymentStatus === "PAID" ? "REFUNDED" : undefined,
        },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: "desc" } },
        },
      });
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Order PUT error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
