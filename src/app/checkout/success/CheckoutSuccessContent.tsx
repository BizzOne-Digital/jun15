"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clear = useCart((s) => s.clear);
  const setOpen = useCart((s) => s.setOpen);

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("Missing payment session.");
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        if (data.paid) {
          clear();
          setOpen(false);
          setOrderNumber(data.orderNumber);
        } else {
          setError("Payment was not completed. Please try again.");
        }
      })
      .catch(() => setError("Could not confirm payment."))
      .finally(() => setLoading(false));
  }, [sessionId, clear, setOpen]);

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full items-center justify-center overflow-x-hidden bg-[#faf6f0] px-4 py-12 pt-safe pb-safe">
      <div className="w-full min-w-0 max-w-md rounded-2xl bg-white p-6 text-center shadow-lg ring-1 ring-[#1e4d3a]/10 sm:p-8">
        {loading ? (
          <p className="text-stone-600">Confirming your payment…</p>
        ) : error ? (
          <>
            <h1 className="text-xl font-bold text-red-700">Payment issue</h1>
            <p className="mt-3 text-stone-600">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#1e4d3a] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Back to menu
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#1e4d3a]">Thank you!</h1>
            <p className="mt-3 text-stone-700">
              Your payment was successful
              {orderNumber ? (
                <>
                  {" "}
                  — order <strong>{orderNumber}</strong>
                </>
              ) : null}
              . We&apos;ll start preparing your order shortly.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#1e4d3a] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Order more
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
