export interface ProductVariantType {
  id: string;
  productId: string;
  size: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  isDefault: boolean;
}

export interface ProductImageType {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  description: string;
  fragranceFamily: string;
  gender: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  howToUse?: string | null;
  ingredients?: string | null;
  displayOrder: number;
  categoryId?: string | null;
  variants: ProductVariantType[];
  images: ProductImageType[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  reviews?: ReviewType[];
  averageRating?: number;
  totalReviews?: number;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  _count?: {
    products: number;
  };
}

export interface CartItemType {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: string;
  variantSize: string;
  price: number;
  mrp: number;
  quantity: number;
  maxStock: number;
}

export interface ReviewType {
  id: string;
  productId: string;
  customerName: string;
  customerEmail?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  adminResponse?: string | null;
  createdAt: string;
}

export interface OrderItemType {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  productName: string;
  variantSize: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  paymentGatewayOrderId?: string | null;
  paymentGatewayPaymentId?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  shippingAddressJson: string;
  internalNotes?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemType[];
  statusHistory?: {
    id: string;
    status: string;
    notes?: string | null;
    changedBy?: string | null;
    createdAt: string;
  }[];
}

export interface CouponType {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perCustomerLimit: number;
  startDate: string;
  expiryDate?: string | null;
  isActive: boolean;
  applicableCategories?: string | null;
}

export interface QrCampaignType {
  id: string;
  code: string;
  title: string;
  productId?: string | null;
  variantSize?: string | null;
  marketplaceSource: string;
  amazonReviewUrl?: string | null;
  flipkartReviewUrl?: string | null;
  isActive: boolean;
  scanCount: number;
  reviewClickCount: number;
  feedbackCount: number;
  createdAt: string;
  product?: ProductType | null;
}
