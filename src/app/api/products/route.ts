import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const fragranceFamily = searchParams.get("fragranceFamily");
    const gender = searchParams.get("gender");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured");
    const bestSeller = searchParams.get("bestSeller");
    const newArrival = searchParams.get("newArrival");
    const includeUnpublished = searchParams.get("includeUnpublished") === "true";

    const where: any = {};

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (fragranceFamily) {
      where.fragranceFamily = fragranceFamily;
    }

    if (gender) {
      where.gender = gender;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (bestSeller === "true") {
      where.isBestSeller = true;
    }

    if (newArrival === "true") {
      where.isNewArrival = true;
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { subtitle: { contains: q } },
        { description: { contains: q } },
        { topNotes: { contains: q } },
        { middleNotes: { contains: q } },
        { baseNotes: { contains: q } },
        { fragranceFamily: { contains: q } },
      ];
    }

    let orderBy: any = [{ displayOrder: "asc" }, { createdAt: "desc" }];

    if (sort === "price_asc") {
      // In prisma with relation variants, we'll sort results
    } else if (sort === "price_desc") {
      // sorted after query
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "bestseller") {
      orderBy = [{ isBestSeller: "desc" }, { createdAt: "desc" }];
    }

    const products = await prisma.product.findMany({
      where,
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
          select: { rating: true },
        },
      },
      orderBy,
    });

    let formatted = products.map((p) => {
      const totalReviews = p.reviews.length;
      const averageRating =
        totalReviews > 0
          ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
          : 5.0;

      return {
        ...p,
        totalReviews,
        averageRating,
      };
    });

    // Apply price filtering on default/lowest variant price if specified
    if (minPrice) {
      const min = parseFloat(minPrice);
      formatted = formatted.filter((p) => p.variants.some((v) => v.price >= min));
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      formatted = formatted.filter((p) => p.variants.some((v) => v.price <= max));
    }

    if (sort === "price_asc") {
      formatted.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sort === "price_desc") {
      formatted.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    }

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      slug,
      subtitle,
      description,
      fragranceFamily,
      gender,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
      topNotes,
      middleNotes,
      baseNotes,
      howToUse,
      ingredients,
      categoryId,
      variants,
      images,
    } = data;

    if (!name || !description || !fragranceFamily || !gender || !topNotes || !middleNotes || !baseNotes) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const cleanSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug: cleanSlug,
        subtitle,
        description,
        fragranceFamily,
        gender,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: Boolean(isNewArrival),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        topNotes,
        middleNotes,
        baseNotes,
        howToUse,
        ingredients,
        categoryId: categoryId || null,
        variants: {
          create: (variants || []).map((v: any, idx: number) => ({
            size: v.size || "60ml",
            sku: v.sku || `GC-${cleanSlug.toUpperCase()}-${idx + 1}`,
            price: parseFloat(v.price) || 1999,
            mrp: parseFloat(v.mrp) || 2999,
            stock: parseInt(v.stock, 10) || 50,
            isDefault: idx === 0,
          })),
        },
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            url: img.url,
            alt: img.alt || name,
            isPrimary: idx === 0,
            displayOrder: idx + 1,
          })),
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "PRODUCT_CREATE",
        entity: "Product",
        entityId: product.id,
        detailsJson: JSON.stringify({ name: product.name, slug: product.slug }),
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
