import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartLine, "quantity">, qty?: number) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),
      addItem: (item, qty = 1) => {
        const lines = get().lines;
        const existing = lines.find((l) => l.productId === item.productId);
        if (existing) {
          set({
            lines: lines.map((l) =>
              l.productId === item.productId
                ? { ...l, quantity: l.quantity + qty }
                : l,
            ),
            isOpen: true,
          });
        } else {
          set({
            lines: [...lines, { ...item, quantity: qty }],
            isOpen: true,
          });
        }
      },
      updateQty: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.productId === productId ? { ...l, quantity } : l,
          ),
        });
      },
      removeItem: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clear: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "royal-garden-cart" },
  ),
);
