import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item._id === product._id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              cart: [...state.cart, { ...product, quantity: 1 }],
            };
          }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage", // nombre en localStorage
    }
  )
);