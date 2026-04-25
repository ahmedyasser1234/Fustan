CREATE TABLE "pointsTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userPoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userPoints_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "vendorWallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"availableBalance" double precision DEFAULT 0 NOT NULL,
	"pendingBalance" double precision DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendorWallets_vendorId_unique" UNIQUE("vendorId")
);
--> statement-breakpoint
CREATE TABLE "walletTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"walletId" integer NOT NULL,
	"amount" double precision NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"description" text,
	"relatedId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlistSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"shareToken" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wishlistSettings_userId_unique" UNIQUE("userId"),
	CONSTRAINT "wishlistSettings_shareToken_unique" UNIQUE("shareToken")
);
--> statement-breakpoint
DROP TABLE "settings" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "vendorOriginalPrice" double precision;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "aiQualifiedImage" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "measurements" jsonb;--> statement-breakpoint
CREATE INDEX "pointsTransactions_userId_idx" ON "pointsTransactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userPoints_userId_idx" ON "userPoints" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "vendorWallets_vendorId_idx" ON "vendorWallets" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "walletTransactions_walletId_idx" ON "walletTransactions" USING btree ("walletId");--> statement-breakpoint
CREATE INDEX "wishlistSettings_userId_idx" ON "wishlistSettings" USING btree ("userId");