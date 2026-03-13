CREATE TYPE "public"."category" AS ENUM('produce', 'livestock', 'farm_inputs', 'machinery', 'tools');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order', 'product', 'message', 'system', 'payment');--> statement-breakpoint
CREATE TYPE "public"."paymentMethod" AS ENUM('mtn_momo', 'vodafone_cash', 'airteltigo', 'bank_transfer', 'card', 'cash');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('farmer', 'buyer', 'logistics', 'storage', 'input_supplier', 'machinery_dealer');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"action" varchar(255) NOT NULL,
	"entity" varchar(100),
	"entityId" integer,
	"details" text,
	"ipAddress" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logistics_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"providerId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"vehicleType" varchar(100),
	"capacity" varchar(100),
	"pricePerKm" numeric(8, 2),
	"coverageArea" text,
	"isAvailable" boolean DEFAULT true,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"senderId" integer NOT NULL,
	"receiverId" integer NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'system',
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"sellerId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyerId" integer NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"paymentMethod" "paymentMethod" DEFAULT 'cash',
	"paymentStatus" "paymentStatus" DEFAULT 'pending',
	"deliveryAddress" text,
	"deliveryCountry" varchar(64),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sellerId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" "category" NOT NULL,
	"subcategory" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"unit" varchar(32) DEFAULT 'kg',
	"stock" integer DEFAULT 0,
	"imageUrl" text,
	"location" varchar(255),
	"country" varchar(64),
	"isOrganic" boolean DEFAULT false,
	"isAvailable" boolean DEFAULT true,
	"isApproved" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"reviewCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"userId" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"providerId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"capacity" varchar(100),
	"pricePerMonth" numeric(8, 2),
	"features" text,
	"isAvailable" boolean DEFAULT true,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" varchar(255),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"userRole" "userRole" DEFAULT 'buyer',
	"phone" varchar(32),
	"country" varchar(64),
	"region" varchar(64),
	"avatarUrl" text,
	"bio" text,
	"whatsapp" varchar(32),
	"address" text,
	"website" varchar(255),
	"linkedinUrl" varchar(255),
	"twitterUrl" varchar(255),
	"facebookUrl" varchar(255),
	"instagramUrl" varchar(255),
	"isVerified" boolean DEFAULT false,
	"emailVerificationToken" varchar(128),
	"emailVerifiedAt" timestamp,
	"passwordResetToken" varchar(128),
	"passwordResetExpiresAt" timestamp,
	"isActive" boolean DEFAULT true,
	"profileCompleted" boolean DEFAULT false,
	"farmName" varchar(255),
	"farmerType" varchar(255),
	"farmSize" varchar(64),
	"cropTypes" text,
	"livestockTypes" text,
	"district" varchar(128),
	"farmingPractices" text,
	"certifications" text,
	"buyerType" varchar(64),
	"productInterests" text,
	"purchaseFrequency" varchar(64),
	"preferredPayment" varchar(64),
	"companyName" varchar(255),
	"servicesOffered" text,
	"serviceArea" text,
	"vehicleTypes" text,
	"fleetSize" integer,
	"coldChain" boolean DEFAULT false,
	"facilityName" varchar(255),
	"facilityType" varchar(64),
	"storageCapacity" varchar(64),
	"storageFeatures" text,
	"productCategories" text,
	"brands" text,
	"deliveryOptions" text,
	"serviceType" varchar(64),
	"machineryTypes" text,
	"rentalAvailable" boolean DEFAULT false,
	"showContactInfo" boolean DEFAULT true,
	"emailNotifications" boolean DEFAULT true,
	"smsNotifications" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_cart_user" ON "cart_items" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_messages_sender" ON "messages" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "idx_messages_receiver" ON "messages" USING btree ("receiverId");--> statement-breakpoint
CREATE INDEX "idx_notif_user" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "idx_orders_buyer" ON "orders" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "idx_products_seller" ON "products" USING btree ("sellerId");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_reviews_product" ON "reviews" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "idx_wishlist_user" ON "wishlist" USING btree ("userId");