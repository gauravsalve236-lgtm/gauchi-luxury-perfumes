import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        variants: {
          orderBy: { price: "asc" },
        },
        images: {
          orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }],
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const totalReviews = product.reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    return NextResponse.json({
      product: {
        ...product,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Product GET by id error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product base fields
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        subtitle: data.subtitle,
        description: data.description,
        fragranceFamily: data.fragranceFamily,
        gender: data.gender,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
        isBestSeller: data.isBestSeller !== undefined ? Boolean(data.isBestSeller) : undefined,
        isNewArrival: data.isNewArrival !== undefined ? Boolean(data.isNewArrival) : undefined,
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : undefined,
        topNotes: data.topNotes,
        middleNotes: data.middleNotes,
        baseNotes: data.baseNotes,
        howToUse: data.howToUse,
        ingredients: data.ingredients,
        categoryId: data.categoryId || null,
      },
    });

    // Update or create variants if supplied
    if (data.variants && Array.isArray(data.variants)) {
      for (const v of data.variants) {
        if (v.id) {
          // Check stock change to log inventory movement
          const oldVar = existing.variants.find((ev) => ev.id === v.id);
          const newStock = parseInt(v.stock, 10);
          if (oldVar && oldVar.stock !== newStock) {
            await prisma.inventoryMovement.create({
              data: {
                variantId: v.id,
                quantityChange: newStock - oldVar.stock,
                previousStock: oldVar.stock,
                newStock: newStock,
                reason: "ADMIN_UPDATE",
                referenceId: admin.userId,
              },
            });
          }

          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              sku: v.sku,
              price: parseFloat(v.price),
              mrp: parseFloat(v.mrp),
              stock: newStock,
              isDefault: Boolean(v.isDefault),
            },
          });
        } else {
          // Create new variant
          await prisma.productVariant.create({
            data: {
              productId: id,
              size: v.size || "20ml",
              sku: v.sku || `GC-${id.slice(0, 5)}-${Date.now()}`,
              price: parseFloat(v.price) || 999,
              mrp: parseFloat(v.mrp) || 1499,
              stock: parseInt(v.stock, 10) || 50,
              isDefault: Boolean(v.isDefault),
            },
          });
        }
      }
    }

    // Update images if supplied
    if (data.images && Array.isArray(data.images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: data.images.map((img: any, idx: number) => ({
          productId: id,
          url: img.url,
          alt: img.alt || updated.name,
          isPrimary: idx === 0,
          displayOrder: idx + 1,
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "PRODUCT_UPDATE",
        entity: "Product",
        entityId: id,
        detailsJson: JSON.stringify({ name: updated.name }),
      },
    });

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, product: fullProduct });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "PRODUCT_DELETE",
        entity: "Product",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
