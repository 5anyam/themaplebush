"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../lib/cart";
import { useAuth } from "../../../lib/AuthContext";
import { toast } from "../../../hooks/use-toast";
import { useFacebookPixel } from "../../../hooks/useFacebookPixel";
import type { CartItem } from "../../../lib/facebook-pixel";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag, User, CheckCircle, AlertCircle,
  Tag, X, ArrowRight, Lock
} from "lucide-react";

// ── CONFIG ──────────────────────────────────────────────────────────────────
const WOOCOMMERCE_CONFIG = {
  BASE_URL: "https://cms.thecurioshelf.com",
  CONSUMER_KEY: process.env.NEXT_PUBLIC_CONSUMER_KEY || "ck_d192213ab2889dc1f8d5a03491a2b1af8b5d0ec8",
  CONSUMER_SECRET: process.env.NEXT_PUBLIC_CONSUMER_SECRET || "cs_545794f655a7bf793ff45df324118c96a8713af2",
};

const RAZORPAY_CONFIG = {
  KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_T6YBXprJ5J3n9D",
  COMPANY_NAME: "The Curio Shelf",
  THEME_COLOR: "#E11D74",
};

// ── INTERFACES ───────────────────────────────────────────────────────────────
interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  notes: string;
}

interface WooCommerceOrder {
  id: number;
  order_key: string;
  status: string;
  total: string;
  payment_url?: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
    code?: string;
    metadata?: Record<string, string>;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  retry?: { enabled: boolean; max_count?: number };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: RazorpayFailureResponse) => void) => void;
    };
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan",
  "Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
];

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const createWooCommerceOrder = async (
  orderData: Record<string, unknown>
): Promise<WooCommerceOrder> => {
  const apiUrl = `${WOOCOMMERCE_CONFIG.BASE_URL}/wp-json/wc/v3/orders`;
  const auth = btoa(`${WOOCOMMERCE_CONFIG.CONSUMER_KEY}:${WOOCOMMERCE_CONFIG.CONSUMER_SECRET}`);
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) {
    let msg = `Order creation failed: ${response.status}`;
    if (response.status === 404) msg = "WooCommerce API not found. Please contact support.";
    else if (response.status === 401) msg = "Authentication failed. Please contact support.";
    else {
      try {
        const err = await response.json() as { message?: string };
        if (err.message) msg += ` - ${err.message}`;
      } catch { /* ignore */ }
    }
    throw new Error(msg);
  }
  return (await response.json()) as WooCommerceOrder;
};

const updateWooCommerceOrderStatus = async (
  orderId: number,
  status: string,
  paymentData?: RazorpayHandlerResponse
): Promise<WooCommerceOrder> => {
  const updateData: Record<string, unknown> = { status };
  if (paymentData) {
    updateData.meta_data = [
      { key: "razorpay_payment_id", value: paymentData.razorpay_payment_id },
      { key: "razorpay_order_id", value: paymentData.razorpay_order_id },
      { key: "razorpay_signature", value: paymentData.razorpay_signature },
      { key: "payment_method", value: "razorpay" },
      { key: "payment_captured_at", value: new Date().toISOString() },
    ];
  }
  const apiUrl = `${WOOCOMMERCE_CONFIG.BASE_URL}/wp-json/wc/v3/orders/${orderId}`;
  const auth = btoa(`${WOOCOMMERCE_CONFIG.CONSUMER_KEY}:${WOOCOMMERCE_CONFIG.CONSUMER_SECRET}`);
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) throw new Error(`Failed to update order: ${await response.text()}`);
  return (await response.json()) as WooCommerceOrder;
};

// ── SUBCOMPONENTS ─────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-[#FFE9DD]">
        <h2 className="text-xs font-bold text-[#2A0A22]/60 uppercase tracking-wider font-serif">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Checkout(): React.ReactElement {
  const { items, clear } = useCart();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { trackInitiateCheckout, trackAddPaymentInfo, trackPurchase } = useFacebookPixel();

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  const [form, setForm] = useState<CheckoutFormData>({
    name: "", email: "", phone: "",
    address: "", pincode: "", city: "", state: "", notes: "",
  });

  const subtotal = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const codCharges = paymentMethod === "cod" ? 100 : 0;
  const finalTotal = subtotal - couponDiscount + codCharges;

  // Autofill from user profile + saved WC billing address
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : user.username,
      email: user.email || "",
    }));
    // Fetch saved billing address from WooCommerce
    const auth = btoa(
      `${process.env.NEXT_PUBLIC_CONSUMER_KEY || "ck_d192213ab2889dc1f8d5a03491a2b1af8b5d0ec8"}:${process.env.NEXT_PUBLIC_CONSUMER_SECRET || "cs_545794f655a7bf793ff45df324118c96a8713af2"}`
    );
    fetch(`https://cms.thecurioshelf.com/wp-json/wc/v3/customers/${user.id}`, {
      headers: { Authorization: `Basic ${auth}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const b = data.billing || {};
        setForm((prev) => ({
          ...prev,
          name: prev.name || `${b.first_name || ""} ${b.last_name || ""}`.trim() || prev.name,
          phone: prev.phone || b.phone || "",
          address: prev.address || b.address_1 || "",
          city: prev.city || b.city || "",
          state: prev.state || b.state || "",
          pincode: prev.pincode || b.postcode || "",
        }));
      })
      .catch(() => {/* ignore */});
  }, [user]);

  useEffect(() => {
    if (items.length > 0) {
      const cartItems: CartItem[] = items.map((i) => ({
        id: i.id, name: i.name, price: parseFloat(i.price), quantity: i.quantity,
      }));
      trackInitiateCheckout(cartItems, finalTotal);
    }
  }, [items, finalTotal, trackInitiateCheckout]);

  const validateCoupon = (code: string) => {
    if (code.toUpperCase().trim() === "NEWBEGIN10")
      return { valid: true, discount: Math.round(subtotal * 0.1), message: "10% discount applied" };
    return { valid: false, discount: 0, message: "Invalid coupon code" };
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) { setCouponError("Please enter a coupon code"); return; }
    if (appliedCoupon === couponCode.toUpperCase()) { setCouponError("Coupon already applied"); return; }
    setIsApplyingCoupon(true);
    setCouponError("");
    setTimeout(() => {
      const v = validateCoupon(couponCode);
      if (v.valid) {
        setAppliedCoupon(couponCode.toUpperCase());
        setCouponDiscount(v.discount);
        toast({ title: "Coupon Applied!", description: `You saved ₹${v.discount}` });
      } else {
        setCouponError(v.message);
        setAppliedCoupon(""); setCouponDiscount(0);
      }
      setIsApplyingCoupon(false);
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(""); setCouponDiscount(0); setCouponCode(""); setCouponError("");
    toast({ title: "Coupon Removed" });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof CheckoutFormData])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };


  const validateForm = (): boolean => {
    const e: Partial<CheckoutFormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    const valid = Object.keys(e).length === 0;
    if (valid) {
      const cartItems: CartItem[] = items.map((i) => ({
        id: i.id, name: i.name, price: parseFloat(i.price), quantity: i.quantity,
      }));
      trackAddPaymentInfo(cartItems, finalTotal);
    }
    setErrors(e);
    return valid;
  };

  const buildOrderData = (method: "razorpay" | "cod"): Record<string, unknown> => {
    const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;
    const feeLines = appliedCoupon && couponDiscount > 0
      ? [{ name: `Discount (${appliedCoupon})`, total: (-couponDiscount).toString(), tax_status: "none" }]
      : [];
    return {
      payment_method: method,
      payment_method_title: method === "cod" ? "Cash on Delivery (COD) - ₹100 Extra" : "Razorpay (UPI/Card/NetBanking)",
      status: method === "cod" ? "processing" : "pending",
      customer_id: user ? user.id : 0,
      billing: { first_name: form.name, last_name: "", address_1: form.address, city: form.city, state: form.state, postcode: form.pincode, country: "IN", email: form.email, phone: form.phone },
      shipping: { first_name: form.name, last_name: "", address_1: form.address, city: form.city, state: form.state, postcode: form.pincode, country: "IN" },
      line_items: items.map((i) => ({ product_id: parseInt(String(i.id), 10), quantity: i.quantity })),
      shipping_lines: method === "cod" && codCharges > 0 ? [{ method_id: "cod", method_title: "COD Handling Charges", total: codCharges.toString() }] : [],
      fee_lines: feeLines,
      coupon_lines: [],
      customer_note: [form.notes, `Full Address: ${fullAddress}`, appliedCoupon ? `Coupon: ${appliedCoupon} (₹${couponDiscount} off)` : ""].filter(Boolean).join("\n"),
      meta_data: [
        { key: "full_address", value: fullAddress },
        { key: "final_total", value: finalTotal.toString() },
        { key: "user_type", value: user ? "registered" : "guest" },
        ...(appliedCoupon ? [{ key: "coupon_code", value: appliedCoupon }, { key: "coupon_discount", value: couponDiscount.toString() }] : []),
      ],
    };
  };

  const handleCODSubmit = async () => {
    if (!user) { toast({ title: "Please login to place an order", variant: "destructive" }); router.push('/login?redirect=/checkout'); return; }
    if (!validateForm()) { toast({ title: "Please fix the errors", variant: "destructive" }); return; }
    setLoading(true); setStep("processing");
    try {
      const wooOrder = await createWooCommerceOrder(buildOrderData("cod"));
      const cartItems: CartItem[] = items.map((i) => ({ id: i.id, name: i.name, price: parseFloat(i.price), quantity: i.quantity }));
      trackPurchase(cartItems, finalTotal, String(wooOrder.id));
      clear();
      toast({ title: "Order Placed!", description: `Order #${wooOrder.id} confirmed.` });
      // SMS notification (fire and forget)
      if (form.phone) {
        void fetch('/api/notify/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            message: `The Curio Shelf: Order #${wooOrder.id} placed! Total: Rs.${finalTotal}. We'll deliver soon. Track at thecurioshelf.in/dashboard`,
          }),
        });
      }
      setTimeout(() => router.push(user ? `/dashboard?order=${wooOrder.id}` : `/order-confirmation?wcOrderId=${wooOrder.id}&cod=true`), 1000);
    } catch (err) {
      toast({ title: "Order Failed", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    } finally { setLoading(false); setStep("form"); }
  };

  const handlePaymentSuccess = async (wooOrder: WooCommerceOrder, response: RazorpayHandlerResponse) => {
    try {
      await updateWooCommerceOrderStatus(wooOrder.id, "processing", response);
      const cartItems: CartItem[] = items.map((i) => ({ id: i.id, name: i.name, price: parseFloat(i.price), quantity: i.quantity }));
      trackPurchase(cartItems, finalTotal, response.razorpay_payment_id);
      clear();
      toast({ title: "Payment Successful!", description: `Order #${wooOrder.id} confirmed.` });
      // SMS notification (fire and forget)
      if (form.phone) {
        void fetch('/api/notify/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            message: `The Curio Shelf: Payment received! Order #${wooOrder.id} confirmed. Total: Rs.${finalTotal}. Track at thecurioshelf.in/dashboard`,
          }),
        });
      }
      setTimeout(() => router.push(user ? `/dashboard?order=${wooOrder.id}` : `/order-confirmation?orderId=${response.razorpay_payment_id}&wcOrderId=${wooOrder.id}`), 1000);
    } catch {
      toast({ title: "Payment Done", description: "We'll contact you soon." });
      setTimeout(() => router.push(`/order-confirmation?orderId=${response.razorpay_payment_id}&wcOrderId=${wooOrder.id}`), 2000);
    } finally { setLoading(false); setStep("form"); }
  };

  const handlePaymentFailure = async (wooOrder: WooCommerceOrder | null, response: RazorpayFailureResponse) => {
    if (wooOrder?.id) { try { await updateWooCommerceOrderStatus(wooOrder.id, "failed"); } catch { /* ignore */ } }
    const msg = response?.error?.description || "Payment was not successful";
    toast({ title: "Payment Failed", description: msg, variant: "destructive" });
    setLoading(false); setStep("form");
    setTimeout(() => router.push(`/payment-failed?error=${encodeURIComponent(msg)}${wooOrder?.id ? `&wcOrderId=${wooOrder.id}` : ""}&amount=${finalTotal.toFixed(2)}`), 1500);
  };

  const handlePaymentDismiss = async (wooOrder: WooCommerceOrder | null) => {
    if (wooOrder?.id) { try { await updateWooCommerceOrderStatus(wooOrder.id, "cancelled"); } catch { /* ignore */ } }
    toast({ title: "Payment Cancelled", variant: "destructive" });
    setLoading(false); setStep("form");
    setTimeout(() => router.push(`/payment-failed?error=Payment+was+cancelled&amount=${finalTotal.toFixed(2)}`), 1500);
  };

  const handleCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please login to place an order", variant: "destructive" }); router.push('/login?redirect=/checkout'); return; }
    if (paymentMethod === "cod") { await handleCODSubmit(); return; }
    let wooOrder: WooCommerceOrder | null = null;
    try {
      if (!validateForm()) { toast({ title: "Please fix the errors", variant: "destructive" }); return; }
      setLoading(true); setStep("processing");
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast({ title: "Payment Error", description: "Failed to load payment system.", variant: "destructive" });
        setLoading(false); setStep("form"); return;
      }
      wooOrder = await createWooCommerceOrder(buildOrderData("razorpay"));
      const rzp = new window.Razorpay({
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: RAZORPAY_CONFIG.COMPANY_NAME,
        description: `Order #${wooOrder.id}`,
        handler: (res) => { void handlePaymentSuccess(wooOrder!, res); },
        modal: { ondismiss: () => { void handlePaymentDismiss(wooOrder); } },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: RAZORPAY_CONFIG.THEME_COLOR },
        retry: { enabled: true, max_count: 3 },
      });
      rzp.on("payment.failed", (res) => { void handlePaymentFailure(wooOrder, res); });
      rzp.open();
      setLoading(false);
    } catch (err) {
      if (wooOrder?.id) { try { await updateWooCommerceOrderStatus(wooOrder.id, "cancelled"); } catch { /* ignore */ } }
      toast({ title: "Checkout Failed", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
      setLoading(false); setStep("form");
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-3 border-2 rounded-xl bg-[#FFE9DD]/30 text-sm text-[#2A0A22] focus:outline-none focus:bg-white transition-all placeholder:text-[#2A0A22]/40 ${
      hasError ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-[#FFE9DD] focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10"
    }`;

  // ── AUTH LOADING ──
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#FFF6EF] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FFE9DD] border-t-[#E11D74] rounded-full animate-spin" />
      </main>
    );
  }

  // ── LOGIN REQUIRED ──
  if (!user) {
    return (
      <main className="min-h-screen bg-[#FFF6EF] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 bg-[#E11D74]/10 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-[#E11D74]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2A0A22] mb-2 font-serif">Login Required</h2>
            <p className="text-sm text-[#2A0A22]/60">
              Please login or create an account to place your order and track it easily.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/checkout"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 mag-btn text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
            >
              Login to Continue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register?redirect=/checkout"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#2A0A22] text-[#2A0A22] hover:bg-[#2A0A22] hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
            >
              Create New Account
            </Link>
          </div>
          <p className="text-xs text-[#2A0A22]/40">
            Your cart items are saved and will be ready after you login.
          </p>
        </div>
      </main>
    );
  }

  // ── EMPTY CART ──
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FFF6EF] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-5">
          <div className="w-16 h-16 bg-[#FFE9DD] rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-[#E11D74]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2A0A22] mb-1 font-serif">Your Cart is Empty</h2>
            <p className="text-sm text-[#2A0A22]/60">Add products to your cart and come back here.</p>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-2 px-7 py-3 mag-btn text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
          >
            <ShoppingBag className="w-4 h-4" /> Start Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF6EF] pb-12">

      {/* ── HERO ── */}
      <div className="bg-[#2A0A22] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E11D74]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 mag-btn rounded-xl flex items-center justify-center shadow-lg shadow-[#E11D74]/30">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-serif">Secure Checkout</h1>
          </div>
          <p className="text-[#FFE9DD]/70 text-sm pl-12">Complete your purchase on <span className="text-[#FF6A2B] font-semibold">The Curio Shelf</span></p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Auth banners */}
        {!user ? (
          <div className="flex items-center gap-3 p-4 bg-[#FFE9DD] border border-[#E11D74]/20 rounded-2xl">
            <User className="w-4 h-4 text-[#E11D74] flex-shrink-0" />
            <p className="text-sm text-[#2A0A22]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#E11D74] font-bold hover:underline">Login here</Link>{" "}
              to track your orders easily.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Welcome back, <span className="font-bold">{user.first_name || user.username}</span>! Your order will be saved to your account.
            </p>
          </div>
        )}

        {/* ── ORDER SUMMARY ── */}
        <div className="bg-[#2A0A22] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 pt-5 pb-3 border-b border-white/10">
            <h2 className="text-xs font-bold text-[#FFE9DD]/70 uppercase tracking-wider font-serif">Order Summary</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.images?.[0]?.src && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 relative flex-shrink-0 bg-white/5">
                        <Image src={item.images[0].src} alt={item.name} fill className="object-contain p-0.5" sizes="40px" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[#FFE9DD]/50">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#FF6A2B]">₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-sm text-[#FFE9DD]/70"><span>Subtotal</span><span className="text-white">₹{subtotal.toLocaleString("en-IN")}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-sm text-green-400 font-semibold"><span>Coupon ({appliedCoupon})</span><span>−₹{couponDiscount.toLocaleString("en-IN")}</span></div>}
                <div className="flex justify-between text-sm text-[#FFE9DD]/70"><span>Delivery</span><span className="text-green-400 font-semibold">Free</span></div>
                {codCharges > 0 && <div className="flex justify-between text-sm text-[#FF6A2B]"><span>COD Charges</span><span>₹{codCharges}</span></div>}
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-sm font-bold text-[#FFE9DD]/70 uppercase tracking-wide">Total</span>
                  <span className="text-xl font-black text-white">₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── COUPON ── */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm overflow-hidden">
          <div style={{ background: "linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)" }} className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-white" />
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Special Offer</h3>
            </div>
            <p className="text-orange-100 text-xs leading-relaxed">
              Use code <span className="font-bold bg-white/20 px-2 py-0.5 rounded mx-1">NEWBEGIN10</span> for{" "}
              <span className="font-bold text-yellow-200">Flat 10% OFF</span>
            </p>
          </div>
          <div className="p-5">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                  className={inputClass(couponError)}
                  disabled={!!appliedCoupon}
                />
                {couponError && <FieldError msg={couponError} />}
                {appliedCoupon && (
                  <p className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
                    <CheckCircle className="w-3 h-3" /> {appliedCoupon} applied — saved ₹{couponDiscount}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={appliedCoupon ? handleRemoveCoupon : handleApplyCoupon}
                disabled={isApplyingCoupon}
                className={`px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-60 flex items-center gap-2 ${
                  appliedCoupon
                    ? "bg-[#FFE9DD] hover:bg-[#FFE9DD]/80 text-[#2A0A22]"
                    : "mag-btn text-white shadow-md"
                }`}
              >
                {isApplyingCoupon ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : appliedCoupon ? (
                  <><X className="w-3.5 h-3.5" /> Remove</>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── DELIVERY FORM ── */}
        <form onSubmit={handleCheckout}>
          <SectionCard title="Delivery Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">Name <span className="text-[#E11D74]">*</span></label>
                  <input name="name" value={form.name} onChange={onChange} className={inputClass(errors.name)} placeholder="Full name" required />
                  <FieldError msg={errors.name} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">Email <span className="text-[#E11D74]">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={onChange} className={inputClass(errors.email)} placeholder="your@email.com" required readOnly={!!user} />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">Phone <span className="text-[#E11D74]">*</span></label>
                  <input name="phone" type="tel" value={form.phone} onChange={onChange} className={inputClass(errors.phone)} placeholder="10-digit number" required />
                  <FieldError msg={errors.phone} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">Address <span className="text-[#E11D74]">*</span></label>
                <textarea name="address" rows={3} value={form.address} onChange={onChange} className={`${inputClass(errors.address)} resize-none`} placeholder="House no., Street, Landmark..." required />
                <FieldError msg={errors.address} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">Pincode <span className="text-[#E11D74]">*</span></label>
                  <input name="pincode" value={form.pincode} onChange={onChange} className={inputClass(errors.pincode)} placeholder="6-digit" required />
                  <FieldError msg={errors.pincode} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">City <span className="text-[#E11D74]">*</span></label>
                  <input name="city" value={form.city} onChange={onChange} className={inputClass(errors.city)} placeholder="City" required />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">State <span className="text-[#E11D74]">*</span></label>
                  <select name="state" value={form.state} onChange={onChange} className={inputClass(errors.state)} required>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <FieldError msg={errors.state} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-1.5">Order Notes <span className="text-[#2A0A22]/30 font-normal normal-case">(optional)</span></label>
                <textarea name="notes" rows={2} value={form.notes} onChange={onChange} className={`${inputClass()} resize-none`} placeholder="Special instructions..." />
              </div>
            </div>
          </SectionCard>

          {/* ── PAYMENT METHOD ── */}
          <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6 mt-5">
            <h2 className="text-xs font-bold text-[#2A0A22]/50 uppercase tracking-wider mb-4 font-serif">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["razorpay", "cod"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`p-3.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    paymentMethod === m
                      ? "border-[#E11D74] bg-[#E11D74]/5 text-[#E11D74]"
                      : "border-[#FFE9DD] bg-[#FFF6EF] text-[#2A0A22]/60 hover:border-[#FFE9DD]"
                  }`}
                >
                  {m === "razorpay" ? "💳 Online Payment" : "🏠 Cash on Delivery"}
                  {m === "cod" && <span className="block text-[10px] font-normal text-[#FF6A2B] mt-0.5">+₹100 handling fee</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6 mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2A0A22]/50 uppercase tracking-wide">Amount to Pay</span>
              <div className="text-right">
                <p className="text-2xl font-black text-[#2A0A22] font-serif">₹{finalTotal.toLocaleString("en-IN")}</p>
                {couponDiscount > 0 && <p className="text-xs text-green-600 font-semibold">You saved ₹{couponDiscount.toLocaleString("en-IN")}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || step === "processing"}
              className="w-full mag-btn disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-[#E11D74]/20 flex items-center justify-center gap-2"
            >
              {loading || step === "processing" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : paymentMethod === "cod" ? (
                <>
                  Place COD Order — ₹{finalTotal.toLocaleString("en-IN")}
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Pay ₹{finalTotal.toLocaleString("en-IN")} Securely
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-5 text-xs text-[#2A0A22]/40 pt-1">
              {["SSL Secured", "Encrypted Payments", "Free Delivery"].map((t) => (
                <span key={t} className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#E11D74]" />{t}</span>
              ))}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
