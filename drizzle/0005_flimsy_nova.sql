CREATE TYPE "public"."design_partner_status" AS ENUM('submitted', 'interview_scheduled', 'artifact_received', 'pilot_proposed', 'pilot_active', 'closed');--> statement-breakpoint
CREATE TABLE "design_partner_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"status" "design_partner_status" DEFAULT 'submitted' NOT NULL,
	"company_name" text NOT NULL,
	"role" text NOT NULL,
	"engineering_team_size" text NOT NULL,
	"production_agent_confirmed" boolean NOT NULL,
	"github_confirmed" boolean NOT NULL,
	"incident_occurred_at" timestamp with time zone NOT NULL,
	"incident_summary" text NOT NULL,
	"current_stack" jsonb NOT NULL,
	"current_proof_process" text NOT NULL,
	"artifact_willing" boolean NOT NULL,
	"pilot_readiness" text NOT NULL,
	"redaction_confirmed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "design_partner_applications" ADD CONSTRAINT "design_partner_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "design_partner_applications_user_uidx" ON "design_partner_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "design_partner_applications_status_idx" ON "design_partner_applications" USING btree ("status");