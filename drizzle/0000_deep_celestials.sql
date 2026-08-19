CREATE TABLE "brand_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"description" text NOT NULL,
	"audience" text,
	"personality" text,
	"avoid_words" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"prompt" text NOT NULL,
	"tone" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'Ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
