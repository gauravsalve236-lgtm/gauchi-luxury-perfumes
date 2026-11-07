import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Overall Counts & Metrics
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      lowStockVariants,
      qrCampaigns,
      recentReviews,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          subtotal: true,
          discount: true,
        },
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 20 } },
        include: {
          product: { select: { name: true, slug: true } },
        },
      }),
      prisma.qrCampaign.findMany({
        include: {
          product: { select: { name: true } },
        },
      }),
      prisma.review.findMany({
        where: { isApproved: false },
        include: { product: { select: { name: true } } },
        take: 5,
      }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrdersCount = orders.filter((o) => o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED").length;
    const deliveredOrdersCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const cancelledOrdersCount = orders.filter((o) => o.orderStatus === "CANCELLED").length;

    // Monthly breakdown for current year
    const monthlyRevenue = Array(12).fill(0);
    orders.forEach((o) => {
      if (o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED") {
        const month = new Date(o.createdAt).getMonth();
        monthlyRevenue[month] += o.total;
      }
    });

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        averageOrderValue,
      },
      monthlyRevenue,
      lowStockVariants,
      qrCampaigns,
      pendingReviewsCount: recentReviews.length,
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
