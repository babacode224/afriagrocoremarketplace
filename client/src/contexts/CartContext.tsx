import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  farmer: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  image: string;
  maxQty?: number;
  category?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "afriagrocore_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: Math.min(i.maxQty ?? 999, i.quantity + (newItem.quantity ?? 1)) }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: newItem.quantity ?? 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(i.maxQty ?? 999, quantity) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
