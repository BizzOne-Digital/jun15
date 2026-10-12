"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: string;
  address?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  createdAt: string;
};

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/admin/orders/stream");
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "order_paid") {
          const audio = audioRef.current;
          if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
              console.warn("Add public/notification.mp3 for sound alerts");
            });
          }
          loadOrders();
        }
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [loadOrders]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-stone-100">
      <header className="w-full border-b bg-[#1e4d3a] text-white pt-safe">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <h1 className="text-base font-semibold sm:text-lg">Orders · Royal Garden</h1>
          <div className="flex items-center gap-3 text-sm sm:gap-4">
            <a href="/" className="text-amber-200/90 hover:text-white">
              Store
            </a>
            <button type="button" onClick={logout} className="underline">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-stone-600">
          New paid orders play{" "}
          <code className="rounded bg-white px-1">notification.mp3</code> from
          the <code className="rounded bg-white px-1">public</code> folder.
        </p>
        {loading ? (
          <p>Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-stone-500">No orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="min-w-0 break-words rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{order.orderNumber}</p>
                    <p className="text-sm text-stone-600">
                      {order.customerName} · {order.customerPhone}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleString()} ·{" "}
                      {order.orderType}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.quantity}× {item.name} — $
                      {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold text-[#964B00]">
                  Total ${order.total.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
