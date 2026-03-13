import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addReview, addToCart, addToWishlist, clearCart, createLogisticsService,
  createNotification, createOrder, createProduct, createStorageService,
  getCartItems, getConversations, getLogisticsServices,
  getMessageThread, getNotifications, getOrdersByBuyer, getOrdersBySeller,
  getProductById, getProducts, getProductReviews,
  getStorageServices, getMyLogisticsServices, getMyStorageServices,
  getUserByEmail, getUsersByEmail, getUserById,
  logAudit, markMessagesRead, markNotificationRead,
  removeFromCart, removeFromWishlist, sendMessage, updateOrderStatus,
  updateProduct, updateUser, getWishlist, upsertUser,
} from "./db";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import * as crypto from "crypto";
import { supabase } from "./supabase";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "afriagrocore_salt_2024").digest("hex");
}

function generateOpenId(email: string, userRole?: string): string {
  const key = userRole ? `${email}:${userRole}` : email;
  return "local_" + crypto.createHash("md5").update(key).digest("hex");
}

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    register: publicProcedure.input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(4),
      userRole: z.enum(["farmer", "buyer", "logistics", "storage", "input_supplier", "machinery_dealer"]),
      phone: z.string().optional(),
      country: z.string().optional(),
      region: z.string().optional(),
      origin: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      // Check if this specific email+role combination already exists
      const existing = await getUserByEmail(input.email, input.userRole);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: `You already have a ${input.userRole} account. Please sign in instead.` });
      
      // Attempt to register/signin against Supabase Auth
      let supabaseUser: any = null;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (signInError || !signInData.user) {
        // User maybe doesn't exist, try sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: { data: { name: input.name, role: input.userRole } }
        });
        if (signUpError) throw new TRPCError({ code: "BAD_REQUEST", message: signUpError.message });
        supabaseUser = signUpData.user;
      } else {
        supabaseUser = signInData.user;
      }

      if (!supabaseUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Supabase authentication failed" });

      const openId = supabaseUser.id; // Instead of local hash, use the official Supabase Auth ID
      const verificationToken = crypto.randomBytes(32).toString("hex");

      await upsertUser({
        openId, name: input.name, email: input.email, passwordHash: "", // No longer needed
        loginMethod: "email", userRole: input.userRole, role: "user",
        phone: input.phone, country: input.country, region: input.region,
        isVerified: false, isActive: true, emailVerificationToken: verificationToken,
      });

      const user = await getUserByEmail(input.email, input.userRole) ?? await getUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration failed" });
      
      await logAudit(user.id, "user_register", "users", user.id, `New ${input.userRole} registered`);
      
      const origin = input.origin ?? "https://afriagro-mdh85cqi.manus.space";
      const verifyUrl = `${origin}/verify-email?token=${verificationToken}`;
      const emailResult = await sendVerificationEmail(user.email ?? "", user.name ?? "there", verifyUrl);
      
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const token = await new SignJWT({ id: user.id, openId: user.openId, role: user.role, appId: ENV.appId, name: user.name ?? "" })
        .setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
      
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      return { success: true, user: { id: user.id, name: user.name, email: user.email, userRole: user.userRole, role: user.role }, emailSent: emailResult.sent, verifyUrl: emailResult.previewUrl };
    }),

    login: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string(),
      userRole: z.enum(["farmer", "buyer", "logistics", "storage", "input_supplier", "machinery_dealer"]).optional(),
    })).mutation(async ({ input, ctx }) => {
      // Authenticate directly against Supabase first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (authError || !authData.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // Get all local accounts associated with this email
      const allAccounts = await getUsersByEmail(input.email);
      if (allAccounts.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "Local account not found. Please register." });

      // If no specific role requested and multiple accounts exist, return list for role selection
      if (!input.userRole && allAccounts.length > 1) {
        return {
          success: true,
          requireRoleSelection: true,
          availableRoles: allAccounts.map((a: any) => ({ userRole: a.userRole, name: a.name, id: a.id })),
          user: null,
        };
      }

      // Pick the right account based on selected role
      const user = input.userRole
        ? allAccounts.find((a: any) => a.userRole === input.userRole) ?? allAccounts[0]
        : allAccounts[0];
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      if (!user.isActive) throw new TRPCError({ code: "FORBIDDEN", message: "Account is deactivated" });
      await updateUser(user.id, { lastSignedIn: new Date() });
      await logAudit(user.id, "user_login", "users", user.id, "User logged in");
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const token = await new SignJWT({ id: user.id, openId: user.openId, role: user.role, appId: ENV.appId, name: user.name ?? "" })
        .setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      return { success: true, requireRoleSelection: false, availableRoles: [], user: { id: user.id, name: user.name, email: user.email, userRole: user.userRole, role: user.role, avatarUrl: user.avatarUrl } };
    }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      return user ?? ctx.user;
    }),

    verifyEmail: publicProcedure.input(z.object({
      token: z.string(),
    })).mutation(async ({ input }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const [found] = await db.select().from(users).where(eq(users.emailVerificationToken, input.token)).limit(1);
      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired verification link" });
      if (found.isVerified) return { success: true, alreadyVerified: true };
      await db.update(users).set({
        isVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
      }).where(eq(users.id, found.id));
      return { success: true, alreadyVerified: false, userName: found.name };
    }),

    resendVerification: protectedProcedure.input(z.object({
      origin: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.isVerified) return { success: true, alreadyVerified: true };
      const newToken = crypto.randomBytes(32).toString("hex");
      await updateUser(user.id, { emailVerificationToken: newToken } as any);
      const verifyUrl = `${input.origin}/verify-email?token=${newToken}`;
      const emailResult = await sendVerificationEmail(user.email ?? "", user.name ?? "there", verifyUrl);
      return { success: true, alreadyVerified: false, emailSent: emailResult.sent, verifyUrl: emailResult.previewUrl };
    }),

    requestPasswordReset: publicProcedure.input(z.object({
      email: z.string().email(),
      origin: z.string(),
    })).mutation(async ({ input }) => {
      // Always return success to avoid email enumeration
      const accounts = await getUsersByEmail(input.email.toLowerCase());
      if (!accounts || accounts.length === 0) return { success: true };
      const db = await import("./db").then(m => m.getDb());
      if (!db) return { success: true };
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      // Update all accounts with this email (they share the same password)
      for (const account of accounts) {
        await db.update(users).set({
          passwordResetToken: token,
          passwordResetExpiresAt: expiresAt,
        } as any).where(eq(users.id, account.id));
      }
      const resetUrl = `${input.origin}/reset-password?token=${token}`;
      const primaryAccount = accounts[0];
      const emailResult = await sendPasswordResetEmail(
        input.email,
        primaryAccount.name ?? "there",
        resetUrl
      );
      return { success: true, emailSent: emailResult.sent, resetUrl: emailResult.previewUrl };
    }),

    resetPassword: publicProcedure.input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
    })).mutation(async ({ input }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { users } = await import("../drizzle/schema");
      const { eq, and, gt } = await import("drizzle-orm");
      const now = new Date();
      const [found] = await db.select().from(users)
        .where(and(
          eq(users.passwordResetToken, input.token),
          gt(users.passwordResetExpiresAt as any, now)
        ))
        .limit(1);
      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "This reset link is invalid or has expired. Please request a new one." });
      const newHash = hashPassword(input.newPassword);
      // Update all accounts with the same email (they share the same password)
      const allAccounts = await getUsersByEmail(found.email ?? "");
      for (const account of allAccounts) {
        await db.update(users).set({
          passwordHash: newHash,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        } as any).where(eq(users.id, account.id));
      }
      return { success: true };
    }),

    updateProfile: protectedProcedure.input(z.object({
      // Common fields
      name: z.string().optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
      region: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      whatsapp: z.string().optional(),
      address: z.string().optional(),
      website: z.string().optional(),
      linkedinUrl: z.string().optional(),
      twitterUrl: z.string().optional(),
      facebookUrl: z.string().optional(),
      instagramUrl: z.string().optional(),
      // Farmer fields
      farmName: z.string().optional(),
      farmerType: z.string().optional(),
      farmSize: z.string().optional(),
      cropTypes: z.string().optional(),
      livestockTypes: z.string().optional(),
      district: z.string().optional(),
      farmingPractices: z.string().optional(),
      certifications: z.string().optional(),
      // Buyer fields
      buyerType: z.string().optional(),
      productInterests: z.string().optional(),
      purchaseFrequency: z.string().optional(),
      preferredPayment: z.string().optional(),
      // Logistics fields
      companyName: z.string().optional(),
      servicesOffered: z.string().optional(),
      serviceArea: z.string().optional(),
      vehicleTypes: z.string().optional(),
      fleetSize: z.number().optional(),
      coldChain: z.boolean().optional(),
      // Storage fields
      facilityName: z.string().optional(),
      facilityType: z.string().optional(),
      capacity: z.string().optional(),
      storageFeatures: z.string().optional(),
      // Input Supplier fields
      productCategories: z.string().optional(),
      brands: z.string().optional(),
      deliveryOptions: z.string().optional(),
      // Machinery Dealer fields
      serviceType: z.string().optional(),
      machineryTypes: z.string().optional(),
      rentalAvailable: z.boolean().optional(),
      // Notification prefs
      showContactInfo: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Merge input with existing user data to compute completeness
      const merged = { ...user, ...input };
      const role = user.userRole ?? "buyer";

      // Determine profileCompleted based on role-specific required fields
      let profileCompleted = false;
      if (role === "farmer") {
        profileCompleted = !!(merged.name && merged.country && merged.district && merged.farmName && merged.farmerType);
      } else if (role === "buyer") {
        profileCompleted = !!(merged.name && merged.country && merged.district);
      } else if (role === "logistics") {
        profileCompleted = !!(merged.name && merged.companyName && merged.servicesOffered && merged.serviceArea && merged.country);
      } else if (role === "storage") {
        profileCompleted = !!(merged.name && merged.facilityName && merged.facilityType && merged.capacity && merged.country && merged.district);
      } else if (role === "input_supplier") {
        profileCompleted = !!(merged.name && merged.companyName && merged.productCategories && merged.country && merged.district);
      } else if (role === "machinery_dealer") {
        profileCompleted = !!(merged.name && merged.companyName && merged.serviceType && merged.country && merged.district);
      }

      await updateUser(user.id, { ...input, profileCompleted } as any);
      return { success: true, profileCompleted };
    }),
  }),

  // ─── Products ──────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure.input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return getProducts({ ...input, isApproved: true });
    }),

    listAll: protectedProcedure.query(async () => {
      return getProducts({});
    }),

    myProducts: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getProducts({ sellerId: user.id });
    }),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

    create: protectedProcedure.input(z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      category: z.enum(["produce", "livestock", "farm_inputs", "machinery", "tools"]),
      subcategory: z.string().optional(),
      price: z.number().positive(),
      unit: z.string().optional(),
      stock: z.number().optional(),
      imageUrl: z.string().optional(),
      location: z.string().optional(),
      country: z.string().optional(),
      isOrganic: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await createProduct({ ...input, sellerId: user.id });
      await logAudit(user.id, "product_create", "products", undefined, `Created product: ${input.name}`);
      return { success: true };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      stock: z.number().optional(),
      imageUrl: z.string().optional(),
      isAvailable: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const product = await getProductById(id);
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!product || !user) throw new TRPCError({ code: "NOT_FOUND" });
      if (product.sellerId !== user.id) throw new TRPCError({ code: "FORBIDDEN" });
      const updateData: any = { ...data };
      if (data.price !== undefined) updateData.price = data.price.toString();
      await updateProduct(id, updateData);
      return { success: true };
    }),

    reviews: publicProcedure.input(z.object({ productId: z.number() })).query(async ({ input }) => {
      return getProductReviews(input.productId);
    }),

    addReview: protectedProcedure.input(z.object({
      productId: z.number(), rating: z.number().min(1).max(5), comment: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await addReview(input.productId, user.id, input.rating, input.comment);
      return { success: true };
    }),
  }),

  // ─── Cart ──────────────────────────────────────────────────────────────────
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getCartItems(user.id);
    }),

    add: protectedProcedure.input(z.object({
      productId: z.number(), quantity: z.number().min(1).default(1),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await addToCart(user.id, input.productId, input.quantity);
      return { success: true };
    }),

    remove: protectedProcedure.input(z.object({ cartItemId: z.number() })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await removeFromCart(user.id, input.cartItemId);
      return { success: true };
    }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await clearCart(user.id);
      return { success: true };
    }),
  }),

  // ─── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getOrdersByBuyer(user.id);
    }),

    sellerOrders: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getOrdersBySeller(user.id);
    }),

    create: protectedProcedure.input(z.object({
      paymentMethod: z.string().optional(),
      deliveryAddress: z.string().optional(),
      deliveryCountry: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const cartData = await getCartItems(user.id);
      if (!cartData.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      const total = cartData.reduce((sum, item) => sum + Number(item.productPrice) * item.quantity, 0);
      const items = cartData.map(item => ({
        productId: item.productId!, sellerId: 0,
        quantity: item.quantity, unitPrice: Number(item.productPrice),
      }));
      const orderId = await createOrder({ buyerId: user.id, totalAmount: total, ...input, items });
      await clearCart(user.id);
      await createNotification(user.id, "Order Placed!", `Your order #${orderId} for $${total.toFixed(2)} has been placed successfully.`, "order");
      await logAudit(user.id, "order_create", "orders", orderId, `Order total: $${total.toFixed(2)}`);
      return { success: true, orderId };
    }),

    updateStatus: protectedProcedure.input(z.object({
      orderId: z.number(), status: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
  }),

  // ─── Messages ──────────────────────────────────────────────────────────────
  messages: router({
    conversations: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getConversations(user.id);
    }),

    thread: protectedProcedure.input(z.object({ partnerId: z.number() })).query(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      await markMessagesRead(user.id, input.partnerId);
      return getMessageThread(user.id, input.partnerId);
    }),

    send: protectedProcedure.input(z.object({
      receiverId: z.number(), content: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await sendMessage(user.id, input.receiverId, input.content);
      await createNotification(input.receiverId, "New Message", `You have a new message from ${user.name}`, "message");
      return { success: true };
    }),
  }),

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getNotifications(user.id);
    }),

    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await markNotificationRead(input.id, user.id);
      return { success: true };
    }),
  }),

  // ─── Wishlist ──────────────────────────────────────────────────────────────
  wishlist: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getWishlist(user.id);
    }),

    add: protectedProcedure.input(z.object({ productId: z.number() })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await addToWishlist(user.id, input.productId);
      return { success: true };
    }),

    remove: protectedProcedure.input(z.object({ productId: z.number() })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await removeFromWishlist(user.id, input.productId);
      return { success: true };
    }),
  }),

  // ─── Logistics & Storage ───────────────────────────────────────────────────
  logistics: router({
    list: publicProcedure.query(async () => getLogisticsServices()),
    myServices: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getMyLogisticsServices(user.id);
    }),
    create: protectedProcedure.input(z.object({
      name: z.string(), vehicleType: z.string().optional(),
      capacity: z.string().optional(), pricePerKm: z.number().optional(),
      coverageArea: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await createLogisticsService({ ...input, providerId: user.id, pricePerKm: input.pricePerKm?.toString() });
      return { success: true };
    }),
  }),

  storage: router({
    list: publicProcedure.query(async () => getStorageServices()),
    myServices: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) return [];
      return getMyStorageServices(user.id);
    }),
    create: protectedProcedure.input(z.object({
      name: z.string(), location: z.string().optional(),
      capacity: z.string().optional(), pricePerMonth: z.number().optional(),
      features: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await createStorageService({ ...input, providerId: user.id, pricePerMonth: input.pricePerMonth?.toString() });
      return { success: true };
    }),
  }),

  // ─── Upload ────────────────────────────────────────────────────────────────
  upload: router({
    image: publicProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.filename.split(".").pop() || "jpg";
        const key = `uploads/profile-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url, key };
      }),
  }),

  // ─── Users (public lookup) ─────────────────────────────────────────────────
  users: router({
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return { id: user.id, name: user.name, userRole: user.userRole, country: user.country, avatarUrl: user.avatarUrl, isVerified: user.isVerified };
    }),
  }),
});

export type AppRouter = typeof appRouter;
