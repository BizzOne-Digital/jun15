"use client";

import Image from "next/image";
import { useCart } from "@/store/cart";
import { TAX_RATE } from "@/lib/orders";

type Props = {
  onCheckout: () => void;
};

export function CartDrawer({ onCheckout }: Props) {
  const { lines, isOpen, setOpen, updateQty, removeItem, subtotal } = useCart();
  const sub = subtotal();
  const tax = Math.round(sub * TAX_RATE * 100) / 100;
  const total = Math.round((sub + tax) * 100) / 100;
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex min-h-[52px] w-full max-w-full items-center justify-center gap-2 border-t border-[#1e4d3a]/15 bg-[#faf6f0]/95 px-4 py-3 text-sm font-semibold text-[#1e4d3a] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur touch-manipulation pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-none sm:rounded-full sm:border-0 sm:bg-[#1e4d3a] sm:px-6 sm:py-3.5 sm:text-white sm:shadow-xl sm:backdrop-blur-none active:sm:scale-[0.98]"
      >
        View cart {count > 0 ? `(${count})` : ""}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:flex-row sm:justify-end">
      <button
        type="button"
        aria-label="Close cart"
        className="min-h-0 flex-1 bg-black/40 sm:min-h-full sm:flex-none sm:w-auto"
        onClick={() => setOpen(false)}
      />
      <div
        className="flex max-h-[min(88dvh,100%)] w-full max-w-full flex-col rounded-t-2xl bg-[#faf6f0] shadow-2xl sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-[#1e4d3a]/10 px-4 py-4">
          <h2 className="text-lg font-bold text-[#2a1a0a]">Your order</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-[44px] min-w-[44px] rounded-lg text-stone-500 touch-manipulation active:bg-stone-100"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-stone-500">Cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-[#1e4d3a]/5"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-amber-50">
                    {line.imageUrl ? (
                      <Image
                        src={line.imageUrl}
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium">
                      {line.name}
                    </p>
                    <p className="text-sm text-[#1e4d3a]">
                      ${line.price.toFixed(2)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg touch-manipulation"
                        onClick={() =>
                          updateQty(line.productId, line.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-lg touch-manipulation"
                        onClick={() =>
                          updateQty(line.productId, line.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto min-h-[40px] text-xs text-red-600 touch-manipulation"
                        onClick={() => removeItem(line.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2 border-t border-[#1e4d3a]/10 px-4 py-4 text-sm pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Tax (13%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={onCheckout}
            className="mt-2 w-full min-h-[48px] rounded-full bg-[#1e4d3a] py-3 font-semibold text-white touch-manipulation disabled:opacity-40 active:scale-[0.99] hover:bg-[#163a2c]"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
