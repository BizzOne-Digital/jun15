"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { TAX_RATE } from "@/lib/orders";

type Props = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "w-full min-w-0 rounded-lg border border-stone-200 px-3 py-3 text-base text-[#2a1a0a] placeholder:text-stone-400";

export function CheckoutModal({ open, onClose }: Props) {
  const { lines, subtotal, setOpen } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sub = subtotal();
  const tax = Math.round(sub * TAX_RATE * 100) / 100;
  const total = Math.round((sub + tax) * 100) / 100;

  if (!open) return null;

  async function payWithStripe() {
    setError("");
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          orderType,
          address: orderType === "delivery" ? address : undefined,
          notes,
          items: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            price: l.price,
            quantity: l.quantity,
            imageUrl: l.imageUrl,
          })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Could not create order");
      }

      const stripeRes = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) {
        throw new Error(stripeData.error || "Could not start payment");
      }

      setOpen(false);
      onClose();
      window.location.href = stripeData.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
    setError("");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-hidden sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close checkout"
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div
        className="relative z-10 flex max-h-[min(92dvh,100%)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1a3328]">Checkout</h2>
            <div className="grid gap-3">
              <input
                className={inputClass}
                placeholder="Full name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <input
                className={inputClass}
                placeholder="Phone *"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
              <input
                className={inputClass}
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <div className="grid grid-cols-2 gap-2">
                {(["pickup", "delivery"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`min-h-[48px] rounded-lg py-2 text-sm font-medium capitalize touch-manipulation ${
                      orderType === t
                        ? "bg-[#1e4d3a] text-white"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {orderType === "delivery" ? (
                <input
                  className={inputClass}
                  placeholder="Delivery address *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                />
              ) : null}
              <textarea
                className={`${inputClass} resize-none`}
                placeholder="Order notes (optional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="space-y-1 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
              <div className="flex justify-between gap-4">
                <span>Subtotal</span>
                <span>${sub.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Tax (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4 font-bold text-[#1e4d3a]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-stone-500">
              You will be redirected to Stripe to enter card details securely.
            </p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-stone-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="min-h-[48px] flex-1 rounded-full border border-stone-200 py-2.5 touch-manipulation disabled:opacity-50 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              loading ||
              !name ||
              !phone ||
              !email ||
              lines.length === 0 ||
              (orderType === "delivery" && !address)
            }
            onClick={payWithStripe}
            className="min-h-[48px] flex-1 rounded-full bg-[#1e4d3a] py-2.5 font-semibold text-white touch-manipulation disabled:opacity-50 active:scale-[0.99] sm:order-2"
          >
            {loading ? "Please wait…" : "Pay now"}
          </button>
        </div>
      </div>
    </div>
  );
}
