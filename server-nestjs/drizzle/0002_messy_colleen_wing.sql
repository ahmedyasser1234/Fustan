CREATE TABLE "contentItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"data" jsonb NOT NULL,
	"isActive" boolean DEFAULT true,
	"displayOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "storeReviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerId" integer,
	"guestName" text,
	"city" text,
	"rating" integer NOT NULL,
	"comment" text,
	"isApproved" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cartItems" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "commission" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "productColors" ADD COLUMN "images" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "vendorPrice" double precision;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "coverImage" text;--> statement-breakpoint
CREATE INDEX "contentItems_type_idx" ON "contentItems" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "settings_key_idx" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "storeReviews_customerId_idx" ON "storeReviews" USING btree ("customerId");--> statement-breakpoint
ALTER TABLE "productColors" DROP COLUMN "imageUrl";