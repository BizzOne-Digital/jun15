import { Suspense } from "react";
import { CheckoutSuccessContent } from "./CheckoutSuccessContent";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf6f0]">
          <p className="text-stone-600">Confirming your payment…</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
