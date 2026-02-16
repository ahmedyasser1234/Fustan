CREATE TABLE "cartItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"size" text,
	"addedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"nameAr" text NOT NULL,
	"nameEn" text NOT NULL,
	"slug" text NOT NULL,
	"descriptionAr" text,
	"descriptionEn" text,
	"image" text,
	"parentId" integer,
	"isActive" boolean DEFAULT true,
	"displayOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"nameAr" text NOT NULL,
	"nameEn" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"coverImage" text,
	"categoryId" integer,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"vendorId" integer NOT NULL,
	"lastMessageId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"code" text NOT NULL,
	"discountPercent" integer NOT NULL,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0,
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversationId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"senderRole" text NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"relatedId" integer,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offerItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"offerId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"nameAr" text NOT NULL,
	"nameEn" text NOT NULL,
	"discountPercent" integer NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"usageLimit" integer,
	"minQuantity" integer DEFAULT 1,
	"usedCount" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"vendorId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" double precision NOT NULL,
	"total" double precision NOT NULL,
	"size" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" text NOT NULL,
	"customerId" integer NOT NULL,
	"vendorId" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotal" double precision NOT NULL,
	"shippingCost" double precision DEFAULT 0,
	"tax" double precision DEFAULT 0,
	"discount" double precision DEFAULT 0,
	"total" double precision NOT NULL,
	"shippingAddress" jsonb,
	"billingAddress" jsonb,
	"paymentMethod" text,
	"paymentStatus" text DEFAULT 'pending' NOT NULL,
	"stripePaymentId" text,
	"trackingNumber" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "productColors" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"colorName" text NOT NULL,
	"colorCode" text NOT NULL,
	"imageUrl" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"collectionId" integer,
	"categoryId" integer,
	"brandId" integer,
	"nameAr" text NOT NULL,
	"nameEn" text NOT NULL,
	"slug" text NOT NULL,
	"descriptionAr" text,
	"descriptionEn" text,
	"sizes" jsonb,
	"shortDescription" text,
	"price" double precision NOT NULL,
	"originalPrice" double precision,
	"discount" double precision DEFAULT 0,
	"sku" text,
	"stock" integer DEFAULT 0,
	"images" jsonb,
	"specifications" jsonb,
	"cutType" text,
	"bodyShape" text,
	"impression" text,
	"occasion" text,
	"rating" double precision DEFAULT 0,
	"reviewCount" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"isFeatured" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"images" jsonb,
	"isVerifiedPurchase" boolean DEFAULT false,
	"helpful" integer DEFAULT 0,
	"unhelpful" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"vendorId" integer NOT NULL,
	"shippingCost" double precision DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"address" text,
	"password" text,
	"loginMethod" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"avatar" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "vendorPayouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"amount" double precision NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"period" text,
	"stripePayoutId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendorReviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"customerId" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"isVerifiedPurchase" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"storeNameAr" text,
	"storeNameEn" text,
	"storeSlug" text NOT NULL,
	"descriptionAr" text,
	"descriptionEn" text,
	"logo" text,
	"banner" text,
	"email" text NOT NULL,
	"phone" text,
	"addressAr" text,
	"addressEn" text,
	"cityAr" text,
	"cityEn" text,
	"countryAr" text,
	"countryEn" text,
	"zipCode" text,
	"website" text,
	"socialLinks" jsonb,
	"gallery" text[],
	"isVerified" boolean DEFAULT false,
	"isActive" boolean DEFAULT true,
	"commissionRate" double precision DEFAULT 10,
	"rating" double precision DEFAULT 0,
	"totalReviews" integer DEFAULT 0,
	"shippingCost" double precision DEFAULT 0 NOT NULL,
	"hasFreeShipping" boolean DEFAULT false NOT NULL,
	"freeShippingThreshold" double precision DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_storeSlug_unique" UNIQUE("storeSlug")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cartItems_customerId_idx" ON "cartItems" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "cartItems_productId_idx" ON "cartItems" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "collections_vendorId_idx" ON "collections" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "collections_categoryId_idx" ON "collections" USING btree ("categoryId");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_vendor_slug_idx" ON "collections" USING btree ("vendorId","slug");--> statement-breakpoint
CREATE INDEX "conversations_customerId_idx" ON "conversations" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "conversations_vendorId_idx" ON "conversations" USING btree ("vendorId");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_unique_idx" ON "conversations" USING btree ("customerId","vendorId");--> statement-breakpoint
CREATE INDEX "coupons_vendorId_idx" ON "coupons" USING btree ("vendorId");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "messages_conversationId_idx" ON "messages" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "notifications_userId_idx" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "offerItems_offerId_idx" ON "offerItems" USING btree ("offerId");--> statement-breakpoint
CREATE INDEX "offerItems_productId_idx" ON "offerItems" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "offerItems_unique_idx" ON "offerItems" USING btree ("offerId","productId");--> statement-breakpoint
CREATE INDEX "offers_vendorId_idx" ON "offers" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "orderItems_orderId_idx" ON "orderItems" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "orderItems_productId_idx" ON "orderItems" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "orderItems_vendorId_idx" ON "orderItems" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "orders_customerId_idx" ON "orders" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "orders_vendorId_idx" ON "orders" USING btree ("vendorId");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_orderNumber_idx" ON "orders" USING btree ("orderNumber");--> statement-breakpoint
CREATE INDEX "productColors_productId_idx" ON "productColors" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "products_vendorId_idx" ON "products" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "products_categoryId_idx" ON "products" USING btree ("categoryId");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reviews_productId_idx" ON "reviews" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "reviews_customerId_idx" ON "reviews" USING btree ("customerId");--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_productId_idx" ON "shipping" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "shipping_vendorId_idx" ON "shipping" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "vendorPayouts_vendorId_idx" ON "vendorPayouts" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "vendorReviews_vendorId_idx" ON "vendorReviews" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "vendorReviews_customerId_idx" ON "vendorReviews" USING btree ("customerId");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_userId_idx" ON "vendors" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_storeSlug_idx" ON "vendors" USING btree ("storeSlug");--> statement-breakpoint
CREATE INDEX "wishlist_customerId_idx" ON "wishlist" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "wishlist_productId_idx" ON "wishlist" USING btree ("productId");