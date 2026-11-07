-- GAUCHI LUXURY PERFUMES — SUPABASE / POSTGRESQL PRODUCTION SCHEMA
-- Run this in your Supabase SQL Editor if deploying with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT DEFAULT 'CUSTOMER',
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Addresses
CREATE TABLE IF NOT EXISTS "Address" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "apartment" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT DEFAULT 'India',
    "isDefault" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS "Category" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "displayOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products
CREATE TABLE IF NOT EXISTS "Product" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "fragranceFamily" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    "isBestSeller" BOOLEAN DEFAULT FALSE,
    "isNewArrival" BOOLEAN DEFAULT FALSE,
    "isPublished" BOOLEAN DEFAULT TRUE,
    "topNotes" TEXT NOT NULL,
    "middleNotes" TEXT NOT NULL,
    "baseNotes" TEXT NOT NULL,
    "howToUse" TEXT,
    "ingredients" TEXT,
    "displayOrder" INTEGER DEFAULT 0,
    "categoryId" UUID REFERENCES "Category"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Variants (Sizes: 20ml, 60ml, Gift sets)
CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "size" TEXT NOT NULL,
    "sku" TEXT UNIQUE NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "mrp" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER DEFAULT 0,
    "isDefault" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Images
CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "isPrimary" BOOLEAN DEFAULT FALSE,
    "displayOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inventory Movements
CREATE TABLE IF NOT EXISTS "InventoryMovement" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "quantityChange" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Coupons & Promotions
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minPurchase" DOUBLE PRECISION DEFAULT 0,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usageCount" INTEGER DEFAULT 0,
    "perCustomerLimit" INTEGER DEFAULT 1,
    "startDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT TRUE,
    "applicableCategories" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Orders
CREATE TABLE IF NOT EXISTS "Order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderNumber" TEXT UNIQUE NOT NULL,
    "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "couponCode" TEXT,
    "shippingFee" DOUBLE PRECISION DEFAULT 0,
    "tax" DOUBLE PRECISION DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "orderStatus" TEXT NOT NULL,
    "paymentGatewayOrderId" TEXT,
    "paymentGatewayPaymentId" TEXT,
    "paymentSignature" TEXT,
    "trackingNumber" TEXT,
    "courierName" TEXT,
    "shippingAddressJson" JSONB NOT NULL,
    "internalNotes" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Order Items
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" UUID REFERENCES "Product"("id") ON DELETE SET NULL,
    "variantId" UUID REFERENCES "ProductVariant"("id") ON DELETE SET NULL,
    "productName" TEXT NOT NULL,
    "variantSize" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL
);

-- 11. Order Status History
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Reviews
CREATE TABLE IF NOT EXISTS "Review" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "orderId" UUID REFERENCES "Order"("id") ON DELETE SET NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN DEFAULT FALSE,
    "isApproved" BOOLEAN DEFAULT FALSE,
    "adminResponse" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Wishlist
CREATE TABLE IF NOT EXISTS "WishlistItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "productId")
);

-- 14. Cart Items
CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "quantity" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "variantId")
);

-- 15. QR Campaigns
CREATE TABLE IF NOT EXISTS "QrCampaign" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "productId" UUID REFERENCES "Product"("id") ON DELETE SET NULL,
    "variantSize" TEXT,
    "marketplaceSource" TEXT DEFAULT 'GAUCHI_BOX',
    "amazonReviewUrl" TEXT,
    "flipkartReviewUrl" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "scanCount" INTEGER DEFAULT 0,
    "reviewClickCount" INTEGER DEFAULT 0,
    "feedbackCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. QR Scan Events
CREATE TABLE IF NOT EXISTS "QrScanEvent" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "campaignId" UUID NOT NULL REFERENCES "QrCampaign"("id") ON DELETE CASCADE,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. QR Feedback
CREATE TABLE IF NOT EXISTS "QrFeedback" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "campaignId" UUID NOT NULL REFERENCES "QrCampaign"("id") ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "feedback" TEXT NOT NULL,
    "preferredFamily" TEXT,
    "hasMarketingConsent" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Newsletter & Marketing
CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT UNIQUE NOT NULL,
    "phone" TEXT,
    "birthday" TEXT,
    "preferredFamily" TEXT,
    "hasMarketingConsent" BOOLEAN DEFAULT TRUE,
    "isSubscribed" BOOLEAN DEFAULT TRUE,
    "source" TEXT DEFAULT 'WEBSITE',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. CMS Content Blocks
CREATE TABLE IF NOT EXISTS "ContentBlock" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadataJson" JSONB,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Store Settings
CREATE TABLE IF NOT EXISTS "StoreSetting" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Audit Logs
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detailsJson" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
