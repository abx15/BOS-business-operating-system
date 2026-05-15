import { create } from "zustand";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  paymentMethod: "CASH" | "UPI" | "CARD";
  tax: number;
  discount: number;
  customerId: string | null;
  addItem: (product: { id: string; name: string; price: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setPaymentMethod: (method: "CASH" | "UPI" | "CARD") => void;
  setTax: (tax: number) => void;
  setDiscount: (discount: number) => void;
  setCustomerId: (id: string | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  paymentMethod: "CASH",
  tax: 0,
  discount: 0,
  customerId: null,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { productId: product.id, name: product.name, price: product.price, quantity: 1, subtotal: product.price },
        ],
      };
    });
  },

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity, subtotal: quantity * i.price } : i
      ),
    }));
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setTax: (tax) => set({ tax }),
  setDiscount: (discount) => set({ discount }),
  setCustomerId: (id) => set({ customerId: id }),
  clearCart: () => set({ items: [], tax: 0, discount: 0, customerId: null, paymentMethod: "CASH" }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const taxAmount = (subtotal * get().tax) / 100;
    return subtotal + taxAmount - get().discount;
  },
}));
