import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../drizzle/schema";
import {
  auditLogs, cartItems, logisticsServices, messages,
  notifications, orderItems, orders, products, reviews,
  storageServices, users, wishlist,
  InsertUser, User
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let queryClient: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      queryClient = postgres(process.env.DATABASE_URL);
      _db = drizzle(queryClient, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  const updateSet: Record<string, unknown> = {};
  const values: InsertUser = { openId: user.openId, email: user.email };
  for (const field of ["name", "email", "loginMethod", "phone", "country", "avatarUrl"] as const) {
    if (user[field] !== undefined) { (values as any)[field] = user[field]; updateSet[field] = user[field]; }
  }
  if (user.userRole !== undefined) { values.userRole = user.userRole; updateSet.userRole = user.userRole; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  if (user.passwordHash !== undefined) { values.passwordHash = user.passwordHash; updateSet.passwordHash = user.passwordHash; }
  values.lastSignedIn = new Date();
  updateSet.lastSignedIn = new Date();
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string, userRole?: string) {
  const db = await getDb();
  if (!db) return undefined;
  if (userRole) {
    const result = await db.select().from(users)
      .where(and(eq(users.email, email), eq(users.userRole, userRole as any)))
      .limit(1);
    return result[0];
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getUsersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.email, email)).orderBy(asc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUser(id: number, data: Partial<User>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return Number(result[0]?.count ?? 0);
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function createProduct(data: {
  sellerId: number; name: string; description?: string;
  category: "produce" | "livestock" | "farm_inputs" | "machinery" | "tools";
  subcategory?: string; price: number; unit?: string; stock?: number;
  imageUrl?: string; location?: string; country?: string; isOrganic?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(products).values({
    ...data,
    price: data.price.toString(),
    isApproved: false,
    isAvailable: true,
  });
  return result;
}

export async function getProducts(filters?: {
  category?: string; search?: string; sellerId?: number;
  isApproved?: boolean; limit?: number; offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select({
    id: products.id, sellerId: products.sellerId, name: products.name,
    description: products.description, category: products.category,
    subcategory: products.subcategory, price: products.price,
    unit: products.unit, stock: products.stock, imageUrl: products.imageUrl,
    location: products.location, country: products.country,
    isOrganic: products.isOrganic, isAvailable: products.isAvailable,
    isApproved: products.isApproved, rating: products.rating,
    reviewCount: products.reviewCount, createdAt: products.createdAt,
    sellerName: users.name,
  }).from(products).leftJoin(users, eq(products.sellerId, users.id));

  const conditions = [];
  if (filters?.category) conditions.push(eq(products.category, filters.category as any));
  if (filters?.sellerId) conditions.push(eq(products.sellerId, filters.sellerId));
  if (filters?.isApproved !== undefined) conditions.push(eq(products.isApproved, filters.isApproved));
  if (filters?.search) conditions.push(like(products.name, `%${filters.search}%`));

  if (conditions.length > 0) {
    return (query as any).where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(filters?.limit ?? 50)
      .offset(filters?.offset ?? 0);
  }
  return (query as any).orderBy(desc(products.createdAt)).limit(filters?.limit ?? 50).offset(filters?.offset ?? 0);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    id: products.id, sellerId: products.sellerId, name: products.name,
    description: products.description, category: products.category,
    subcategory: products.subcategory, price: products.price,
    unit: products.unit, stock: products.stock, imageUrl: products.imageUrl,
    location: products.location, country: products.country,
    isOrganic: products.isOrganic, isAvailable: products.isAvailable,
    isApproved: products.isApproved, rating: products.rating,
    reviewCount: products.reviewCount, createdAt: products.createdAt,
    sellerName: users.name, sellerPhone: users.phone,
  }).from(products).leftJoin(users, eq(products.sellerId, users.id))
    .where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function getProductCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(products);
  return Number(result[0]?.count ?? 0);
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: cartItems.id, userId: cartItems.userId, quantity: cartItems.quantity,
    productId: products.id, productName: products.name, productPrice: products.price,
    productImage: products.imageUrl, productUnit: products.unit,
    productStock: products.stock, sellerName: users.name,
  }).from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))).limit(1);
  if (existing.length > 0) {
    await db.update(cartItems).set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeFromCart(userId: number, cartItemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: {
  buyerId: number; totalAmount: number; paymentMethod?: string;
  deliveryAddress?: string; deliveryCountry?: string; notes?: string;
  items: Array<{ productId: number; sellerId: number; quantity: number; unitPrice: number }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(orders).values({
    buyerId: data.buyerId,
    totalAmount: data.totalAmount.toString(),
    paymentMethod: (data.paymentMethod as any) ?? "cash",
    deliveryAddress: data.deliveryAddress,
    deliveryCountry: data.deliveryCountry,
    notes: data.notes,
  });
  const orderId = (result as any).insertId;
  for (const item of data.items) {
    await db.insert(orderItems).values({
      orderId, productId: item.productId, sellerId: item.sellerId,
      quantity: item.quantity, unitPrice: item.unitPrice.toString(),
      totalPrice: (item.quantity * item.unitPrice).toString(),
    });
  }
  return orderId;
}

export async function getOrdersByBuyer(buyerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(desc(orders.createdAt));
}

export async function getOrdersBySeller(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select({
    orderId: orderItems.orderId, productId: orderItems.productId,
    quantity: orderItems.quantity, unitPrice: orderItems.unitPrice,
    totalPrice: orderItems.totalPrice, orderStatus: orders.status,
    orderCreatedAt: orders.createdAt, buyerId: orders.buyerId,
    buyerName: users.name,
  }).from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(users, eq(orders.buyerId, users.id))
    .where(eq(orderItems.sellerId, sellerId))
    .orderBy(desc(orders.createdAt));
  return items;
}

export async function getAllOrders(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: orders.id, buyerId: orders.buyerId, totalAmount: orders.totalAmount,
    status: orders.status, paymentMethod: orders.paymentMethod,
    paymentStatus: orders.paymentStatus, createdAt: orders.createdAt,
    buyerName: users.name,
  }).from(orders).leftJoin(users, eq(orders.buyerId, users.id))
    .orderBy(desc(orders.createdAt)).limit(limit);
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function getOrderCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(orders);
  return Number(result[0]?.count ?? 0);
}

export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: sql<number>`sum(totalAmount)` }).from(orders)
    .where(eq(orders.paymentStatus, "paid"));
  return Number(result[0]?.total ?? 0);
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const msgs = await db.select({
    id: messages.id, senderId: messages.senderId, receiverId: messages.receiverId,
    content: messages.content, isRead: messages.isRead, createdAt: messages.createdAt,
  }).from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
    .orderBy(desc(messages.createdAt)).limit(200);

  const partnerIds = new Set<number>();
  for (const m of msgs) {
    partnerIds.add(m.senderId === userId ? m.receiverId : m.senderId);
  }

  const conversations: Array<{ partnerId: number; partnerName: string | null; lastMessage: string; lastAt: Date; unread: number }> = [];
  for (const pid of Array.from(partnerIds)) {
    const partner = await getUserById(pid);
    const partnerMsgs = msgs.filter(m => m.senderId === pid || m.receiverId === pid);
    const last = partnerMsgs[0];
    const unread = partnerMsgs.filter(m => m.receiverId === userId && !m.isRead).length;
    if (last) conversations.push({ partnerId: pid, partnerName: partner?.name ?? null, lastMessage: last.content, lastAt: last.createdAt, unread });
  }
  return conversations.sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

export async function getMessageThread(userId: number, partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(or(
      and(eq(messages.senderId, userId), eq(messages.receiverId, partnerId)),
      and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
    )).orderBy(messages.createdAt);
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(messages).values({ senderId, receiverId, content });
}

export async function markMessagesRead(userId: number, partnerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true })
    .where(and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId)));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function createNotification(userId: number, title: string, message: string, type: "order" | "product" | "message" | "system" | "payment" = "system") {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({ userId, title, message, type });
}

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function addReview(productId: number, userId: number, rating: number, comment?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviews).values({ productId, userId, rating, comment });
  const avgResult = await db.select({ avg: sql<number>`avg(rating)`, cnt: sql<number>`count(*)` }).from(reviews).where(eq(reviews.productId, productId));
  await db.update(products).set({ rating: String(Number(avgResult[0]?.avg ?? 0).toFixed(2)), reviewCount: Number(avgResult[0]?.cnt ?? 0) }).where(eq(products.id, productId));
}

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: reviews.id, rating: reviews.rating, comment: reviews.comment,
    createdAt: reviews.createdAt, reviewerName: users.name,
  }).from(reviews).leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export async function addToWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId))).limit(1);
  if (existing.length === 0) await db.insert(wishlist).values({ userId, productId });
}

export async function removeFromWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
}

export async function getWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: wishlist.id, productId: products.id, productName: products.name,
    productPrice: products.price, productImage: products.imageUrl,
    productUnit: products.unit, sellerName: users.name,
  }).from(wishlist)
    .leftJoin(products, eq(wishlist.productId, products.id))
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(eq(wishlist.userId, userId));
}

// ─── Logistics & Storage ──────────────────────────────────────────────────────
export async function createLogisticsService(data: typeof logisticsServices.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(logisticsServices).values(data);
}

export async function getLogisticsServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: logisticsServices.id, name: logisticsServices.name,
    vehicleType: logisticsServices.vehicleType, capacity: logisticsServices.capacity,
    pricePerKm: logisticsServices.pricePerKm, coverageArea: logisticsServices.coverageArea,
    isAvailable: logisticsServices.isAvailable, rating: logisticsServices.rating,
    providerName: users.name,
  }).from(logisticsServices).leftJoin(users, eq(logisticsServices.providerId, users.id));
}

export async function getMyLogisticsServices(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: logisticsServices.id, name: logisticsServices.name,
    vehicleType: logisticsServices.vehicleType, capacity: logisticsServices.capacity,
    pricePerKm: logisticsServices.pricePerKm, coverageArea: logisticsServices.coverageArea,
    isAvailable: logisticsServices.isAvailable, rating: logisticsServices.rating,
  }).from(logisticsServices).where(eq(logisticsServices.providerId, providerId));
}

export async function createStorageService(data: typeof storageServices.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(storageServices).values(data);
}

export async function getStorageServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: storageServices.id, name: storageServices.name,
    location: storageServices.location, capacity: storageServices.capacity,
    pricePerMonth: storageServices.pricePerMonth, features: storageServices.features,
    isAvailable: storageServices.isAvailable, rating: storageServices.rating,
    providerName: users.name,
  }).from(storageServices).leftJoin(users, eq(storageServices.providerId, users.id));
}

export async function getMyStorageServices(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: storageServices.id, name: storageServices.name,
    location: storageServices.location, capacity: storageServices.capacity,
    pricePerMonth: storageServices.pricePerMonth, features: storageServices.features,
    isAvailable: storageServices.isAvailable, rating: storageServices.rating,
  }).from(storageServices).where(eq(storageServices.providerId, providerId));
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export async function logAudit(userId: number | null, action: string, entity?: string, entityId?: number, details?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ userId, action, entity, entityId, details });
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: auditLogs.id, action: auditLogs.action, entity: auditLogs.entity,
    entityId: auditLogs.entityId, details: auditLogs.details,
    createdAt: auditLogs.createdAt, userName: users.name,
  }).from(auditLogs).leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getAnalytics() {
  const db = await getDb();
  if (!db) return { users: 0, products: 0, orders: 0, revenue: 0 };
  const [userCount, productCount, orderCount, revenue] = await Promise.all([
    getUserCount(), getProductCount(), getOrderCount(), getTotalRevenue()
  ]);
  return { users: userCount, products: productCount, orders: orderCount, revenue };
}

export async function getRecentOrders(limit = 10) {
  return getAllOrders(limit);
}

export async function getTopProducts(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isApproved, true))
    .orderBy(desc(products.reviewCount)).limit(limit);
}
