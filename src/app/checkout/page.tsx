"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user } = useAuth();

  // Address fields
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [codEnabled, setCodEnabled] = useState(false);
  const [notes, setNotes] = useState("");

  // Load store settings for payment gateways
  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const isCod = data.settings.cod_enabled === "true";
          setCodEnabled(isCod);
          if (!isCod) {
            setPaymentMethod("RAZORPAY");
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#0F0F0F]">Your shopping bag is empty</h2>
        <p className="text-xs text-[#7A7A7A]">Please select an artisanal fragrance before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury hover:bg-[#C5A059] transition-colors"
        >
          Explore Perfumes
        </Link>
      </div>
    );
  }

  const FREE_SHIPPING_THRESHOLD = 1499;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || appliedCoupon?.discountType === "FREE_SHIPPING";
  const shippingFee = isFreeShipping ? 0 : 99;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage("");

    const result = await applyCoupon(couponCode.trim());
    setCouponMessage(result.message);
    setIsApplyingCoupon(false);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName || !email || !phone || !street || !city || !state || !postalCode) {
      setErrorMessage("Please complete all required shipping address fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Order on Backend
      const orderPayload = {
        items: cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName,
          phone,
          email,
          street,
          apartment,
          city,
          state,
          postalCode,
          country: "India",
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Order creation failed");
        setIsSubmitting(false);
        return;
      }

      const order = data.order;

      // 2. Handle Payment Flow
      if (paymentMethod === "COD") {
        clearCart();
        router.push(`/order-confirmation/${order.orderNumber}`);
        return;
      }

      // Online Payment via Razorpay flow:
      // Request gateway order from backend
      const rzpInitRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const rzpInitData = await rzpInitRes.json();
      if (!rzpInitRes.ok) {
        setErrorMessage(rzpInitData.error || "Failed to initialize payment gateway");
        setIsSubmitting(false);
        return;
      }

      // If mock/test mode without API keys:
      if (rzpInitData.isTestMode) {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            razorpayOrderId: rzpInitData.gatewayOrderId,
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: "simulated_secure_signature",
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          clearCart();
          router.push(`/order-confirmation/${order.orderNumber}`);
        } else {
          setErrorMessage(verifyData.error || "Payment verification failed");
          setIsSubmitting(false);
        }
        return;
      }

      // Live Razorpay Gateway Modal
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setErrorMessage("Failed to load Razorpay payment gateway. Please check connection.");
        setIsSubmitting(false);
        return;
      }

      const rzpOptions = {
        key: rzpInitData.keyId,
        amount: rzpInitData.amount,
        currency: rzpInitData.currency || "INR",
        name: "GAUCHI — Luxury Perfumes",
        description: `Order ${order.orderNumber}`,
        image: "/images/gauchi-gold-logo.png",
        order_id: rzpInitData.gatewayOrderId,
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#0F0F0F",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              router.push(`/order-confirmation/${order.orderNumber}`);
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed.");
              setIsSubmitting(false);
            }
          } catch {
            setErrorMessage("Error verifying payment with server.");
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(rzpOptions);
      razorpayInstance.on("payment.failed", function (response: any) {
        setErrorMessage(response.error?.description || "Payment failed or cancelled.");
        setIsSubmitting(false);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      setErrorMessage("A network error occurred while placing the order.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-[#EBE7DF] pb-4 mb-8">
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          Finalize Acquisition
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F] mt-1">
          Secure Luxury Checkout
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-[#FDECEC] border border-[#A82222]/30 text-[#A82222] text-xs rounded-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Shipping & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Contact */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F] pb-2 border-b border-[#EBE7DF]">
              1. Client Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Varma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Email Address (for invoice & tracking) *</label>
                <input
                  type="email"
                  required
                  placeholder="rohan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#0F0F0F] font-medium mb-1">Mobile Phone Number (for delivery SMS) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F] pb-2 border-b border-[#EBE7DF]">
              2. Shipping Destination
            </h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House/Villa No., Building, Street Name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Apartment / Suite / Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Apt 1402, Near Oberoi Mall"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="400001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F] pb-2 border-b border-[#EBE7DF]">
              3. Payment Method
            </h2>
            <div className="space-y-3">
              {/* Online Payment Option */}
              <label
                className={`p-4 border rounded-sm flex items-start gap-3 cursor-pointer transition-colors ${
                  paymentMethod === "RAZORPAY"
                    ? "border-[#0F0F0F] bg-white ring-1 ring-[#0F0F0F]"
                    : "border-[#E0DBD0] bg-[#FAF8F5]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="mt-1 text-[#C5A059] focus:ring-[#C5A059]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0F0F0F]">
                      Online Payment (UPI, Debit/Credit Card, Net Banking)
                    </span>
                    <CreditCard className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <p className="text-[11px] text-[#7A7A7A] mt-1">
                    Instant automated verification via 256-bit encrypted Razorpay. All Indian banks & UPI apps supported (GPay, PhonePe, Paytm).
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option (Shown only if enabled in Store Settings) */}
              {codEnabled && (
                <label
                  className={`p-4 border rounded-sm flex items-start gap-3 cursor-pointer transition-colors ${
                    paymentMethod === "COD"
                      ? "border-[#0F0F0F] bg-white ring-1 ring-[#0F0F0F]"
                      : "border-[#E0DBD0] bg-[#FAF8F5]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 text-[#C5A059] focus:ring-[#C5A059]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F0F0F]">
                        Cash on Delivery (COD)
                      </span>
                      <Banknote className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <p className="text-[11px] text-[#7A7A7A] mt-1">
                      Pay in cash upon doorstep delivery by our courier executive.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-6 space-y-5">
            <h3 className="font-serif-luxury text-lg text-[#0F0F0F] pb-3 border-b border-[#EBE7DF]">
              Order Summary ({cart.length} {cart.length === 1 ? "Item" : "Items"})
            </h3>

            {/* Cart Items Snapshot */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#F0ECE4]">
              {cart.map((item) => (
                <div key={item.variantId} className="pt-2 flex items-center gap-3 text-xs">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-14 object-cover rounded-sm border border-[#EBE7DF]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#0F0F0F] truncate">{item.productName}</div>
                    <div className="text-[11px] text-[#7A7A7A]">Size: {item.variantSize} × {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-[#0F0F0F]">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Application Box */}
            <div className="pt-3 border-t border-[#EBE7DF]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-sm border border-[#C5A059]/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="font-semibold text-[#0F0F0F]">{appliedCoupon.code}</span>
                    <span className="text-[#2A6E3B]">(-₹{discountAmount})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. GAUCHI10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#DDD7CD] rounded-sm uppercase focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-[#0F0F0F] text-white text-xs uppercase tracking-wider hover:bg-[#C5A059] transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponMessage && (
                <p className="text-[11px] text-[#2A6E3B] mt-1">{couponMessage}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#5A5A5A] pt-3 border-t border-[#EBE7DF]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#0F0F0F]">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2A6E3B]">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span>{isFreeShipping ? <span className="text-[#2A6E3B] font-medium">FREE</span> : "₹99"}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#0F0F0F] pt-3 border-t border-[#EBE7DF]">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0F0F0F] text-white text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#C5A059] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Securing Order..." : `Confirm & Pay ₹${total}`}</span>
            </button>

            <div className="text-[11px] text-[#7A7A7A] space-y-1 text-center">
              <p>✦ Complimentary signature packaging with gold seal included.</p>
              <p>✦ Tracking link sent via SMS and Email once dispatched.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
