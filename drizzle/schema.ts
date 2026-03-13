import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  index,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user"]);
export const userRoleEnum = pgEnum("userRole", [
  "farmer",
  "buyer",
  "logistics",
  "storage",
  "input_supplier",
  "machinery_dealer",
]);
export const categoryEnum = pgEnum("category", [
  "produce",
  "livestock",
  "farm_inputs",
  "machinery",
  "tools",
]);
export const statusEnum = pgEnum("status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("paymentMethod", [
  "mtn_momo",
  "vodafone_cash",
  "airteltigo",
  "bank_transfer",
  "card",
  "cash",
]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "order",
  "product",
  "message",
  "system",
  "payment",
]);

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  userRole: userRoleEnum("userRole").default("buyer"),
  phone: varchar("phone", { length: 32 }),
  country: varchar("country", { length: 64 }),
  region: varchar("region", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  whatsapp: varchar("whatsapp", { length: 32 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  linkedinUrl: varchar("linkedinUrl", { length: 255 }),
  twitterUrl: varchar("twitterUrl", { length: 255 }),
  facebookUrl: varchar("facebookUrl", { length: 255 }),
  instagramUrl: varchar("instagramUrl", { length: 255 }),
  isVerified: boolean("isVerified").default(false),
  emailVerificationToken: varchar("emailVerificationToken", { length: 128 }),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  passwordResetToken: varchar("passwordResetToken", { length: 128 }),
  passwordResetExpiresAt: timestamp("passwordResetExpiresAt"),
  isActive: boolean("isActive").default(true),
  // ── Profile completion ────────────────────────────────────────────────────
  profileCompleted: boolean("profileCompleted").default(false),
  // ── Role-specific: Farmer ─────────────────────────────────────────────────
  farmName: varchar("farmName", { length: 255 }),
  farmerType: varchar("farmerType", { length: 255 }),
  farmSize: varchar("farmSize", { length: 64 }),
  cropTypes: text("cropTypes"),
  livestockTypes: text("livestockTypes"),
  district: varchar("district", { length: 128 }),
  farmingPractices: text("farmingPractices"),
  certifications: text("certifications"),
  // ── Role-specific: Buyer ─────────────────────────────────────────────────
  buyerType: varchar("buyerType", { length: 64 }),
  productInterests: text("productInterests"),
  purchaseFrequency: varchar("purchaseFrequency", { length: 64 }),
  preferredPayment: varchar("preferredPayment", { length: 64 }),
  // ── Role-specific: Logistics Partner ─────────────────────────────────────
  companyName: varchar("companyName", { length: 255 }),
  servicesOffered: text("servicesOffered"),
  serviceArea: text("serviceArea"),
  vehicleTypes: text("vehicleTypes"),
  fleetSize: integer("fleetSize"),
  coldChain: boolean("coldChain").default(false),
  // ── Role-specific: Storage Partner ───────────────────────────────────────
  facilityName: varchar("facilityName", { length: 255 }),
  facilityType: varchar("facilityType", { length: 64 }),
  capacity: varchar("storageCapacity", { length: 64 }),
  storageFeatures: text("storageFeatures"),
  // ── Role-specific: Input Supplier ─────────────────────────────────────────
  productCategories: text("productCategories"),
  brands: text("brands"),
  deliveryOptions: text("deliveryOptions"),
  // ── Role-specific: Machinery Dealer ──────────────────────────────────────
  serviceType: varchar("serviceType", { length: 64 }),
  machineryTypes: text("machineryTypes"),
  rentalAvailable: boolean("rentalAvailable").default(false),
  // ── Shared extras ─────────────────────────────────────────────────────────
  showContactInfo: boolean("showContactInfo").default(true),
  emailNotifications: boolean("emailNotifications").default(true),
  smsNotifications: boolean("smsNotifications").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("sellerId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: categoryEnum("category").notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 32 }).default("kg"),
    stock: integer("stock").default(0),
    imageUrl: text("imageUrl"),
    location: varchar("location", { length: 255 }),
    country: varchar("country", { length: 64 }),
    isOrganic: boolean("isOrganic").default(false),
    isAvailable: boolean("isAvailable").default(true),
    isApproved: boolean("isApproved").default(false),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    reviewCount: integer("reviewCount").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  t => [
    index("idx_products_seller").on(t.sellerId),
    index("idx_products_category").on(t.category),
  ]
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Cart Items ───────────────────────────────────────────────────────────────
export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    productId: integer("productId").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [index("idx_cart_user").on(t.userId)]
);

export type CartItem = typeof cartItems.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    buyerId: integer("buyerId").notNull(),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    status: statusEnum("status").default("pending").notNull(),
    paymentMethod: paymentMethodEnum("paymentMethod").default("cash"),
    paymentStatus: paymentStatusEnum("paymentStatus").default("pending"),
    deliveryAddress: text("deliveryAddress"),
    deliveryCountry: varchar("deliveryCountry", { length: 64 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  t => [index("idx_orders_buyer").on(t.buyerId)]
);

export type Order = typeof orders.$inferSelect;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId").notNull(),
    productId: integer("productId").notNull(),
    sellerId: integer("sellerId").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  },
  t => [index("idx_order_items_order").on(t.orderId)]
);

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    userId: integer("userId").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [index("idx_reviews_product").on(t.productId)]
);

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    senderId: integer("senderId").notNull(),
    receiverId: integer("receiverId").notNull(),
    content: text("content").notNull(),
    isRead: boolean("isRead").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [
    index("idx_messages_sender").on(t.senderId),
    index("idx_messages_receiver").on(t.receiverId),
  ]
);

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: notificationTypeEnum("type").default("system"),
    isRead: boolean("isRead").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [index("idx_notif_user").on(t.userId)]
);

// ─── Logistics Services ───────────────────────────────────────────────────────
export const logisticsServices = pgTable("logistics_services", {
  id: serial("id").primaryKey(),
  providerId: integer("providerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  vehicleType: varchar("vehicleType", { length: 100 }),
  capacity: varchar("capacity", { length: 100 }),
  pricePerKm: decimal("pricePerKm", { precision: 8, scale: 2 }),
  coverageArea: text("coverageArea"),
  isAvailable: boolean("isAvailable").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Storage Services ─────────────────────────────────────────────────────────
export const storageServices = pgTable("storage_services", {
  id: serial("id").primaryKey(),
  providerId: integer("providerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  capacity: varchar("capacity", { length: 100 }),
  pricePerMonth: decimal("pricePerMonth", { precision: 8, scale: 2 }),
  features: text("features"),
  isAvailable: boolean("isAvailable").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId"),
    action: varchar("action", { length: 255 }).notNull(),
    entity: varchar("entity", { length: 100 }),
    entityId: integer("entityId"),
    details: text("details"),
    ipAddress: varchar("ipAddress", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [index("idx_audit_user").on(t.userId)]
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlist = pgTable(
  "wishlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    productId: integer("productId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [index("idx_wishlist_user").on(t.userId)]
);
