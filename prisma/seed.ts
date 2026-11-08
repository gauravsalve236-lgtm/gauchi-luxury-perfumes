import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Gauchi Luxury Perfumes database...");

  // 1. Clean existing records (in reverse relation order)
  await prisma.auditLog.deleteMany();
  await prisma.qrFeedback.deleteMany();
  await prisma.qrScanEvent.deleteMany();
  await prisma.qrCampaign.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.contentBlock.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users
  const adminPasswordHash = await bcrypt.hash("GauchiAdmin@2026", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@gauchi.com",
      passwordHash: adminPasswordHash,
      name: "Gauchi Executive Admin",
      phone: "+919876543210",
      role: "ADMIN",
      notes: "Chief Administrator for Gauchi Luxury Perfumes",
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer@2026", 10);
  const customer = await prisma.user.create({
    data: {
      email: "customer@gauchi.com",
      passwordHash: customerPasswordHash,
      name: "Rohan Varma",
      phone: "+919811223344",
      role: "CUSTOMER",
      addresses: {
        create: [
          {
            fullName: "Rohan Varma",
            phone: "+919811223344",
            street: "42, Altamount Road, Cumballa Hill",
            apartment: "Tower B, Apt 1402",
            city: "Mumbai",
            state: "Maharashtra",
            postalCode: "400026",
            country: "India",
            isDefault: true,
          },
        ],
      },
    },
  });

  // 3. Categories
  const catOud = await prisma.category.create({
    data: {
      name: "Oud Collection",
      slug: "oud-collection",
      description: "Mystical, hypnotic woody resins harvested from rare aged agarwood.",
      imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80",
      displayOrder: 1,
    },
  });

  const catFresh = await prisma.category.create({
    data: {
      name: "Fresh & Aquatic",
      slug: "fresh-aquatic",
      description: "Crisp oceanic breezes, effervescent citrus, and invigorating Mediterranean notes.",
      imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
      displayOrder: 2,
    },
  });

  const catFloral = await prisma.category.create({
    data: {
      name: "Floral & Fruity",
      slug: "floral-fruity",
      description: "Opulent blossoms of Grasse rose, jasmine sambac, and lush nectarous fruits.",
      imageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80",
      displayOrder: 3,
    },
  });

  const catWoody = await prisma.category.create({
    data: {
      name: "Warm & Woody",
      slug: "warm-woody",
      description: "Sensual ambergris, smoky cedarwood, and creamy sandalwood enveloped in rich spices.",
      imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
      displayOrder: 4,
    },
  });

  const catGift = await prisma.category.create({
    data: {
      name: "Gift Sets",
      slug: "gift-sets",
      description: "Artisanal velvet coffrets and curated luxury discovery collections.",
      imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80",
      displayOrder: 5,
    },
  });

  // 4. Products & Variants
  const p1 = await prisma.product.create({
    data: {
      name: "Black Oud Royale",
      slug: "black-oud-royale",
      subtitle: "Extrait de Parfum • Smoked Agarwood & Damascena Rose",
      description: "A commanding signature that embodies timeless regal majesty. Black Oud Royale balances dark, smokey Cambodian agarwood with velvety Bulgarian rose and sweet amber. Formulated at a concentrated 32% oil concentration for an unforgettable 16-hour projection.",
      fragranceFamily: "Oud",
      gender: "Unisex",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isPublished: true,
      topNotes: "Sicilian Bergamot, Pink Peppercorn, Saffron Threads",
      middleNotes: "Velvet Damascena Rose, Smoked Incense, Nutmeg",
      baseNotes: "Aged Cambodian Agarwood (Oud), Black Amber, Golden Patchouli, Leather",
      howToUse: "Spray on pulse points: collarbones, wrists, and behind the ears from a distance of 15 cm. Avoid rubbing.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citronellol, Geraniol, Eugenol.",
      displayOrder: 1,
      categoryId: catOud.id,
      images: {
        create: [
          {
            url: "/images/products/black-oud-1.jpg",
            alt: "Black Oud Royale bottle front view",
            isPrimary: true,
            displayOrder: 1,
          },
          {
            url: "/images/products/black-oud-2.jpg",
            alt: "Black Oud Royale box packaging",
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            size: "60ml",
            sku: "GC-BOR-60",
            price: 1999,
            mrp: 3499,
            stock: 120,
            isDefault: true,
          },
          {
            size: "20ml",
            sku: "GC-BOR-20",
            price: 799,
            mrp: 1299,
            stock: 250,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const p2 = await prisma.product.create({
    data: {
      name: "Wild Nectar Extrait",
      slug: "wild-nectar-extrait",
      subtitle: "Extrait de Parfum • White Honey, Peach Blossom & Jasmine Sambac",
      description: "An intoxicating nectarous elixir evoking an eternal summer garden in the South of France. Drenched in pure wild golden honey, sun-warmed white peaches, and hypnotic night-blooming jasmine, grounded by warm tonka bean.",
      fragranceFamily: "Floral & Fruity",
      gender: "Women",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isPublished: true,
      topNotes: "White Peach, Italian Mandarin, Dewy Violet Leaf",
      middleNotes: "Jasmine Sambac, Grasse Rose, Golden Wild Honey",
      baseNotes: "Madagascar Vanilla, Creamy Sandalwood, Tonka Bean, Soft Musk",
      howToUse: "Mist lightly onto skin after moisturizing for enhanced longevity.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Salicylate, Hydroxycitronellal, Hexyl Cinnamal.",
      displayOrder: 2,
      categoryId: catFloral.id,
      images: {
        create: [
          {
            url: "/images/products/wild-nectar.jpg",
            alt: "Wild Nectar Extrait luxury bottle",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            size: "60ml",
            sku: "GC-WN-60",
            price: 1899,
            mrp: 3299,
            stock: 95,
            isDefault: true,
          },
          {
            size: "20ml",
            sku: "GC-WN-20",
            price: 749,
            mrp: 1199,
            stock: 180,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const p3 = await prisma.product.create({
    data: {
      name: "Titan Blue Eau de Parfum",
      slug: "titan-blue-edp",
      subtitle: "Eau de Parfum • Marine Breeze, Crisp Apple & Mineral Woods",
      description: "An invigorating clash of untamed ocean surf and towering sea cliffs. Opens with a burst of crisp green apple and coastal sea salt, cascading into aromatic French lavender, vetiver, and smoky cedarwood.",
      fragranceFamily: "Fresh & Aquatic",
      gender: "Men",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isPublished: true,
      topNotes: "Grapefruit, Sea Salt Accord, Crisp Granny Smith Apple",
      middleNotes: "French Lavender, Marine Sage, Rosemary, Geranium",
      baseNotes: "Haitian Vetiver, Virginian Cedarwood, White Ambergris",
      howToUse: "Apply generously to neck and chest. Perfect for tropical climates and daily boardroom signature wear.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Alpha-Isomethyl Ionone.",
      displayOrder: 3,
      categoryId: catFresh.id,
      images: {
        create: [
          {
            url: "/images/products/titan-blue.jpg",
            alt: "Titan Blue Eau de Parfum",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            size: "60ml",
            sku: "GC-TB-60",
            price: 1799,
            mrp: 2999,
            stock: 150,
            isDefault: true,
          },
          {
            size: "20ml",
            sku: "GC-TB-20",
            price: 699,
            mrp: 1099,
            stock: 220,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const p4 = await prisma.product.create({
    data: {
      name: "Roselle Velvet",
      slug: "roselle-velvet",
      subtitle: "Extrait de Parfum • Candied Damask Petals & Creamy Cashmere",
      description: "An ode to classical romanticism reimagined for modern royalty. Roselle Velvet is a powdery, opulent embrace of scarlet rose petals woven with spun sugar, violet, and cashmere musk.",
      fragranceFamily: "Floral & Fruity",
      gender: "Women",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      isPublished: true,
      topNotes: "Sparkling Pear, Litchi, Italian Bergamot",
      middleNotes: "Turkish Rose Essence, Peony, Spun Sugar",
      baseNotes: "Cashmere Wood, White Musk, Bourbon Vanilla, Amber",
      howToUse: "Spray on pulse points and let settle naturally.",
      ingredients: "Alcohol Denat., Parfum, Aqua, Citronellol, Geraniol.",
      displayOrder: 4,
      categoryId: catFloral.id,
      images: {
        create: [
          {
            url: "/images/products/roselle-velvet.jpg",
            alt: "Roselle Velvet bottle",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            size: "60ml",
            sku: "GC-RV-60",
            price: 1849,
            mrp: 3199,
            stock: 80,
            isDefault: true,
          },
          {
            size: "20ml",
            sku: "GC-RV-20",
            price: 749,
            mrp: 1199,
            stock: 160,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const p5 = await prisma.product.create({
    data: {
      name: "L'Amour Nuit Intense",
      slug: "lamour-nuit-intense",
      subtitle: "Extrait de Parfum • Dark Rum, Roasted Tonka & Smoked Tobacco",
      description: "Designed for nocturnal allure. L'Amour Nuit captures the electric energy of moonlit Paris with dark Cuban rum, sweet pipe tobacco, black pepper, and warm vanilla bean.",
      fragranceFamily: "Warm & Woody",
      gender: "Unisex",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isPublished: true,
      topNotes: "Dark Spiced Rum, Pink Pepper, Bitter Orange",
      middleNotes: "Blonde Tobacco Leaf, Cinnamon Bark, Clary Sage",
      baseNotes: "Roasted Tonka Bean, Benzoin Resin, Styrax, Dark Amber",
      howToUse: "Ideal for evening events and intimate gatherings.",
      ingredients: "Alcohol Denat., Parfum, Aqua, Coumarin, Eugenol, Cinnamal.",
      displayOrder: 5,
      categoryId: catWoody.id,
      images: {
        create: [
          {
            url: "/images/products/lamour-nuit.jpg",
            alt: "L'Amour Nuit bottle",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            size: "60ml",
            sku: "GC-LN-60",
            price: 2199,
            mrp: 3799,
            stock: 60,
            isDefault: true,
          },
          {
            size: "20ml",
            sku: "GC-LN-20",
            price: 849,
            mrp: 1399,
            stock: 140,
            isDefault: false,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const p6 = await prisma.product.create({
    data: {
      name: "Gauchi Masterpiece Discovery Set",
      slug: "gauchi-masterpiece-discovery-set",
      subtitle: "Luxury Coffret • 5 x 20ml Signature Extraits de Parfum",
      description: "The ultimate showcase of Haute Parfumerie. Contains five 20ml travel spray flacons presented in a gold-embossed ivory coffret: Black Oud Royale, Wild Nectar, Titan Blue, Roselle Velvet, and L'Amour Nuit. Includes a voucher redeemable against any 60ml bottle.",
      fragranceFamily: "Warm & Woody",
      gender: "Unisex",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isPublished: true,
      topNotes: "Multi-layered curated opening notes from our master perfumers",
      middleNotes: "Exquisite floral, resinous, and marine bouquets",
      baseNotes: "Aged oud, ambergris, bourbon vanilla, and precious musks",
      howToUse: "Explore each creation across different moods, seasons, and occasions.",
      ingredients: "Handcrafted natural fragrance compounds and fine French perfumery alcohol.",
      displayOrder: 6,
      categoryId: catGift.id,
      images: {
        create: [
          {
            url: "/images/products/discovery-set.jpg",
            alt: "Gauchi Masterpiece Coffret Set",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            size: "5 x 20ml Coffret",
            sku: "GC-GIFT-5X20",
            price: 2999,
            mrp: 4999,
            stock: 50,
            isDefault: true,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 5. Initial Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "GAUCHI10",
        description: "10% off on your luxury order above ₹999",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minPurchase: 999,
        maxDiscount: 500,
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: "ROYALTY500",
        description: "Flat ₹500 off on orders exceeding ₹2,499",
        discountType: "FIXED",
        discountValue: 500,
        minPurchase: 2499,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "FREESHIP",
        description: "Complimentary luxury express shipping across India",
        discountType: "FREE_SHIPPING",
        discountValue: 99,
        minPurchase: 499,
        isActive: true,
      },
    ],
  });

  // 6. Store Settings
  const defaultSettings = [
    { key: "currency", value: "INR", description: "Currency display code" },
    { key: "currency_symbol", value: "₹", description: "Currency display symbol" },
    { key: "free_shipping_threshold", value: "1499", description: "Cart amount for free shipping" },
    { key: "flat_shipping_rate", value: "99", description: "Standard flat delivery charge" },
    { key: "cod_enabled", value: "true", description: "Allow Cash on Delivery" },
    { key: "cod_extra_fee", value: "50", description: "COD handling surcharge" },
    { key: "razorpay_enabled", value: "true", description: "Allow Razorpay Card/UPI/Netbanking" },
    { key: "brand_name", value: "GAUCHI", description: "Brand name" },
    { key: "brand_tagline", value: "More than a fragrance. A lasting connection.", description: "Brand slogan" },
    { key: "support_email", value: "concierge@gauchi.com", description: "Support email" },
    { key: "support_phone", value: "+91 98765 43210", description: "Customer care line" },
    { key: "gst_number", value: "27AAACG1234F1Z5", description: "Goods & Services Tax ID" },
  ];

  for (const s of defaultSettings) {
    await prisma.storeSetting.create({ data: s });
  }

  // 7. CMS Content Blocks
  const cmsBlocks = [
    {
      key: "hero_banner",
      title: "Haute Parfumerie at Accessible Luxury",
      content: "Immerse yourself in artisanal compositions blended with rare agarwood, Damascena rose, and precious ambergris. Experience niche perfumery without the traditional luxury markup.",
      metadataJson: JSON.stringify({
        eyebrow: "EAU DE PARFUM & EXTRAIT COLLECTION",
        ctaText: "Discover Fragrances",
        ctaLink: "/shop",
        secondaryCtaText: "Brand Story",
        secondaryCtaLink: "/story",
        badge: "Pure 32% Oil Concentration",
      }),
    },
    {
      key: "announcement_bar",
      title: "Complimentary Luxury Miniature (5ml) with all orders above ₹1,999 | Free Express Shipping across India",
      content: "Limited festive celebration offer.",
      metadataJson: JSON.stringify({ isEnabled: true, countdownEnd: "2026-12-31T23:59:59" }),
    },
    {
      key: "brand_story",
      title: "The Gauchi Philosophy",
      content: "Gauchi was founded on an unapologetic belief: the world's most breathtaking fragrances should not be reserved only for a privileged few. We source our rare ingredients directly from sustainable harvests in Grasse, Madagascar, and Assam, partnering with renowned French and oriental noses to craft long-lasting, multifaceted extraits.",
      metadataJson: JSON.stringify({
        foundingYear: "2024",
        origin: "Paris • Dubai • Mumbai",
        values: ["Cruelty Free & Vegan", "30%+ Pure Oil Extrait", "Sustainably Harvested Resins", "Non-Staining Botanical Formulations"],
      }),
    },
    {
      key: "shipping_policy",
      title: "Shipping & Delivery Policy",
      content: "Orders are processed within 24 business hours. Standard metro delivery arrives within 2-3 business days. Non-metro locations arrive within 4-5 business days via BlueDart, Delhivery, or DTDC Express. Real-time SMS and email tracking links are dispatched upon shipment dispatch.",
      metadataJson: null,
    },
    {
      key: "return_policy",
      title: "Hassle-Free Return & Exchange Policy",
      content: "We stand behind every flacon we produce. If your bottle arrives damaged or if you are not delighted with your purchase, contact concierge@gauchi.com within 7 days of delivery for an immediate replacement or full refund.",
      metadataJson: null,
    },
  ];

  for (const b of cmsBlocks) {
    await prisma.contentBlock.create({ data: b });
  }

  // 8. QR Campaigns for "THE GAUCHI EXPERIENCE"
  const qrCampaigns = [
    {
      code: "black-oud-60ml",
      title: "Black Oud Royale (60ml Box QR)",
      productId: p1.id,
      variantSize: "60ml",
      marketplaceSource: "GAUCHI_BOX",
      amazonReviewUrl: "https://amazon.in/dp/example-black-oud-60",
      flipkartReviewUrl: "https://flipkart.com/example-black-oud-60",
      scanCount: 142,
      reviewClickCount: 38,
      feedbackCount: 19,
    },
    {
      code: "black-oud-20ml",
      title: "Black Oud Royale (20ml Box QR)",
      productId: p1.id,
      variantSize: "20ml",
      marketplaceSource: "GAUCHI_BOX",
      amazonReviewUrl: "https://amazon.in/dp/example-black-oud-20",
      flipkartReviewUrl: "https://flipkart.com/example-black-oud-20",
      scanCount: 88,
      reviewClickCount: 22,
      feedbackCount: 11,
    },
    {
      code: "wild-nectar-60ml",
      title: "Wild Nectar Extrait (60ml Box QR)",
      productId: p2.id,
      variantSize: "60ml",
      marketplaceSource: "AMAZON",
      amazonReviewUrl: "https://amazon.in/dp/example-wild-nectar-60",
      flipkartReviewUrl: "https://flipkart.com/example-wild-nectar-60",
      scanCount: 96,
      reviewClickCount: 41,
      feedbackCount: 14,
    },
    {
      code: "titan-blue-20ml",
      title: "Titan Blue EDP (20ml Box QR)",
      productId: p3.id,
      variantSize: "20ml",
      marketplaceSource: "FLIPKART",
      amazonReviewUrl: "https://amazon.in/dp/example-titan-blue",
      flipkartReviewUrl: "https://flipkart.com/example-titan-blue",
      scanCount: 75,
      reviewClickCount: 18,
      feedbackCount: 8,
    },
    {
      code: "roselle-20ml",
      title: "Roselle Velvet (20ml Box QR)",
      productId: p4.id,
      variantSize: "20ml",
      marketplaceSource: "GAUCHI_BOX",
      amazonReviewUrl: "https://amazon.in/dp/example-roselle-20",
      flipkartReviewUrl: "https://flipkart.com/example-roselle-20",
      scanCount: 64,
      reviewClickCount: 15,
      feedbackCount: 9,
    },
    {
      code: "lamour-nuit-20ml",
      title: "L'Amour Nuit (20ml Box QR)",
      productId: p5.id,
      variantSize: "20ml",
      marketplaceSource: "GAUCHI_BOX",
      amazonReviewUrl: "https://amazon.in/dp/example-lamour-20",
      flipkartReviewUrl: "https://flipkart.com/example-lamour-20",
      scanCount: 110,
      reviewClickCount: 30,
      feedbackCount: 16,
    },
    {
      code: "gift-sets",
      title: "Discovery Quintet Masterpiece Box QR",
      productId: p6.id,
      variantSize: "5 x 20ml Coffret",
      marketplaceSource: "GAUCHI_BOX",
      amazonReviewUrl: "https://amazon.in/dp/example-gift-set",
      flipkartReviewUrl: "https://flipkart.com/example-gift-set",
      scanCount: 185,
      reviewClickCount: 52,
      feedbackCount: 28,
    },
  ];

  for (const c of qrCampaigns) {
    await prisma.qrCampaign.create({ data: c });
  }

  // 9. Initial Verified Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: p1.id,
        customerName: "Vikramaditya S.",
        customerEmail: "vikram@example.com",
        rating: 5,
        title: "Spectacular oud projection, easily rivals Creed and Tom Ford",
        comment: "Black Oud Royale is extraordinary. The projection easily lasts 14+ hours on my shirt with an exquisite dry-down of aged wood and subtle Turkish rose. You can tell they haven't diluted this.",
        isVerifiedPurchase: true,
        isApproved: true,
        adminResponse: "Thank you Vikramaditya. We age our Cambodian oud resin for a minimum of 18 months before bottling to ensure that nuanced richness.",
      },
      {
        productId: p1.id,
        customerName: "Ananya Deshmukh",
        customerEmail: "ananya@example.com",
        rating: 5,
        title: "Luxurious, dark, and sensual",
        comment: "Bought the 60ml after testing a friend's bottle. The packaging feels like a 10,000 INR perfume. Incredible value for money.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        productId: p2.id,
        customerName: "Priyanka Nair",
        customerEmail: "priyanka@example.com",
        rating: 5,
        title: "Feminine, golden honey & peach without being overly sweet",
        comment: "Wild Nectar is now my signature scent for brunches and formal dinners. I get stopped by strangers asking what fragrance I am wearing.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        productId: p3.id,
        customerName: "Sameer K.",
        customerEmail: "sameer@example.com",
        rating: 5,
        title: "Clean, oceanic, and sharp",
        comment: "Titan Blue cuts right through humid weather. Perfect everyday office fragrance that smells sophisticated and crisp.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
    ],
  });

  // 10. Sample Verified Order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "GAU-2026-1001",
      userId: customer.id,
      guestEmail: customer.email,
      guestName: customer.name,
      guestPhone: customer.phone,
      subtotal: 1999,
      discount: 199.9,
      couponCode: "GAUCHI10",
      shippingFee: 0,
      tax: 0,
      total: 1799.1,
      paymentMethod: "RAZORPAY",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      paymentGatewayOrderId: "order_GauchiSample_001",
      paymentGatewayPaymentId: "pay_GauchiSample_001",
      trackingNumber: "BD982736154IN",
      courierName: "BlueDart Express",
      shippingAddressJson: JSON.stringify({
        fullName: "Rohan Varma",
        phone: "+919811223344",
        street: "42, Altamount Road, Cumballa Hill",
        apartment: "Tower B, Apt 1402",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400026",
        country: "India",
      }),
      items: {
        create: [
          {
            productId: p1.id,
            variantId: p1.variants[0].id,
            productName: "Black Oud Royale",
            variantSize: "60ml",
            unitPrice: 1999,
            quantity: 1,
            total: 1999,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: "CONFIRMED", notes: "Payment verified via Razorpay", changedBy: "System" },
          { status: "SHIPPED", notes: "Dispatched via BlueDart AWB BD982736154IN", changedBy: "admin@gauchi.com" },
          { status: "DELIVERED", notes: "Delivered to recipient", changedBy: "BlueDart Webhook" },
        ],
      },
    },
  });

  console.log("Database seeded successfully with Gauchi luxury catalog, admin, user, and QR campaigns!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
