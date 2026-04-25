CREATE TABLE "aiTasks" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"targetId" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"resultUrl" text,
	"error" text,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendorRequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"type" text NOT NULL,
	"data" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"adminNotes" text,
	"scheduledAt" timestamp,
	"isExecuted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "commissionRate" SET DEFAULT 15;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "aiBackgroundImage" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "availability" text DEFAULT 'sale' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "condition" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "usageCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rentPrice" double precision;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "salePrice" double precision;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "usagePrices" jsonb;--> statement-breakpoint
CREATE INDEX "aiTasks_type_idx" ON "aiTasks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "aiTasks_targetId_idx" ON "aiTasks" USING btree ("targetId");--> statement-breakpoint
CREATE INDEX "aiTasks_status_idx" ON "aiTasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendorRequests_vendorId_idx" ON "vendorRequests" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "vendorRequests_status_idx" ON "vendorRequests" USING btree ("status");