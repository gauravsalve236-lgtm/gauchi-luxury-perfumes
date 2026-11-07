import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = { role: "CUSTOMER" };
    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            paymentStatus: true,
            orderStatus: true,
            createdAt: true,
          },
        },
        addresses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED")
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        notes: c.notes,
        createdAt: c.createdAt,
        totalOrders: c.orders.length,
        totalSpent,
        addresses: c.addresses,
        recentOrders: c.orders.slice(0, 3),
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { customerId, notes } = await req.json();

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { notes },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error("Customers PUT error:", error);
    return NextResponse.json({ error: "Failed to update customer note" }, { status: 500 });
  }
}
