import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
}

const MAX_QTY = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add(item) {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (idx >= 0) {
            const items = [...state.items];
            items[idx] = {
              ...items[idx],
              quantity: Math.min(MAX_QTY, items[idx].quantity + item.quantity),
            };
            return { items };
          }
          return { items: [...state.items, item] };
        });
      },

      remove(productId, size) {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }));
      },

      setQty(productId, size, qty) {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity: Math.max(1, Math.min(MAX_QTY, qty)) }
              : i
          ),
        }));
      },

      clear() {
        set({ items: [] });
      },
    }),
    { name: "verve_cart" }
  )
);

// Reactive selectors
export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
