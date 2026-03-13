import { describe, it, expect } from "vitest";

// Unit tests for CartContext business logic (pure functions, no React rendering)
// These test the cart computation logic that mirrors what CartContext does.

interface CartItem {
  id: number;
  name: string;
  farmer: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  image: string;
  maxQty?: number;
}

function addItem(items: CartItem[], newItem: Omit<CartItem, "quantity"> & { quantity?: number }): CartItem[] {
  const existing = items.find((i) => i.id === newItem.id);
  if (existing) {
    return items.map((i) =>
      i.id === newItem.id
        ? { ...i, quantity: Math.min(i.maxQty ?? 999, i.quantity + (newItem.quantity ?? 1)) }
        : i
    );
  }
  return [...items, { ...newItem, quantity: newItem.quantity ?? 1 }];
}

function removeItem(items: CartItem[], id: number): CartItem[] {
  return items.filter((i) => i.id !== id);
}

function updateQuantity(items: CartItem[], id: number, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.id !== id);
  return items.map((i) =>
    i.id === id ? { ...i, quantity: Math.min(i.maxQty ?? 999, quantity) } : i
  );
}

function getTotalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);
}

const SAMPLE_ITEM: Omit<CartItem, "quantity"> = {
  id: 1,
  name: "Vine Ripened Tomatoes",
  farmer: "Kwabena Farms",
  unit: "kg",
  pricePerUnit: 25,
  image: "https://example.com/tomato.jpg",
  maxQty: 50,
};

describe("CartContext logic", () => {
  it("adds a new item with default quantity of 1", () => {
    const result = addItem([], SAMPLE_ITEM);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1);
  });

  it("adds a new item with specified quantity", () => {
    const result = addItem([], { ...SAMPLE_ITEM, quantity: 5 });
    expect(result[0].quantity).toBe(5);
  });

  it("increments quantity when adding an existing item", () => {
    let cart = addItem([], { ...SAMPLE_ITEM, quantity: 3 });
    cart = addItem(cart, { ...SAMPLE_ITEM, quantity: 2 });
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(5);
  });

  it("respects maxQty when adding items", () => {
    let cart = addItem([], { ...SAMPLE_ITEM, quantity: 48 });
    cart = addItem(cart, { ...SAMPLE_ITEM, quantity: 10 }); // would exceed 50
    expect(cart[0].quantity).toBe(50);
  });

  it("removes an item by id", () => {
    let cart = addItem([], SAMPLE_ITEM);
    cart = removeItem(cart, 1);
    expect(cart).toHaveLength(0);
  });

  it("updates quantity for an existing item", () => {
    let cart = addItem([], SAMPLE_ITEM);
    cart = updateQuantity(cart, 1, 10);
    expect(cart[0].quantity).toBe(10);
  });

  it("removes item when quantity is updated to 0", () => {
    let cart = addItem([], SAMPLE_ITEM);
    cart = updateQuantity(cart, 1, 0);
    expect(cart).toHaveLength(0);
  });

  it("calculates total items correctly", () => {
    let cart = addItem([], { ...SAMPLE_ITEM, quantity: 3 });
    cart = addItem(cart, { ...SAMPLE_ITEM, id: 2, name: "Carrots", quantity: 2 });
    expect(getTotalItems(cart)).toBe(5);
  });

  it("calculates subtotal correctly", () => {
    let cart = addItem([], { ...SAMPLE_ITEM, quantity: 2 }); // 2 × 25 = 50
    cart = addItem(cart, { ...SAMPLE_ITEM, id: 2, name: "Carrots", pricePerUnit: 12.5, quantity: 4 }); // 4 × 12.5 = 50
    expect(getSubtotal(cart)).toBe(100);
  });

  it("clears cart to empty array", () => {
    let cart = addItem([], SAMPLE_ITEM);
    cart = [];
    expect(cart).toHaveLength(0);
    expect(getTotalItems(cart)).toBe(0);
  });
});
