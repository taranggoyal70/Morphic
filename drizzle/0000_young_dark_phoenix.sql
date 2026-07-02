CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."command_status" AS ENUM('queued', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('awaiting_approval', 'queued', 'provisioning', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."workspace_status" AS ENUM('generating', 'active', 'archived', 'failed');--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"note" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codex_run_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"run_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codex_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"instruction" text NOT NULL,
	"status" "run_status" DEFAULT 'awaiting_approval' NOT NULL,
	"workflow_run_id" text,
	"sandbox_id" text,
	"codex_thread_id" text,
	"branch_name" text,
	"base_sha" text,
	"commit_sha" text,
	"pull_request_number" integer,
	"pull_request_url" text,
	"result_summary" text,
	"usage" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "github_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"branch" text NOT NULL,
	"head_sha" text NOT NULL,
	"issues" jsonb NOT NULL,
	"pull_requests" jsonb NOT NULL,
	"tree" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"github_id" bigint NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"description" text,
	"default_branch" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"pushed_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"command" text NOT NULL,
	"status" "command_status" DEFAULT 'queued' NOT NULL,
	"result_version" integer,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workspace_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"generation_key" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"openai_response_id" text,
	"plan" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"repository_id" uuid NOT NULL,
	"objective" text NOT NULL,
	"target_date" timestamp with time zone,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "workspace_status" DEFAULT 'generating' NOT NULL,
	"current_version" integer DEFAULT 0 NOT NULL,
	"generation_run_id" text,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_run_id_codex_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."codex_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codex_run_events" ADD CONSTRAINT "codex_run_events_run_id_codex_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."codex_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codex_runs" ADD CONSTRAINT "codex_runs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codex_runs" ADD CONSTRAINT "codex_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_snapshots" ADD CONSTRAINT "github_snapshots_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_commands" ADD CONSTRAINT "workspace_commands_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_commands" ADD CONSTRAINT "workspace_commands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_versions" ADD CONSTRAINT "workspace_versions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_versions" ADD CONSTRAINT "workspace_versions_snapshot_id_github_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."github_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "approvals_run_uidx" ON "approvals" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "approvals_user_idx" ON "approvals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "codex_run_events_run_sequence_uidx" ON "codex_run_events" USING btree ("run_id","sequence");--> statement-breakpoint
CREATE INDEX "codex_run_events_run_idx" ON "codex_run_events" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "codex_runs_workspace_idx" ON "codex_runs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "codex_runs_user_idx" ON "codex_runs" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_snapshots_repo_sha_uidx" ON "github_snapshots" USING btree ("repository_id","head_sha");--> statement-breakpoint
CREATE INDEX "github_snapshots_repo_idx" ON "github_snapshots" USING btree ("repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repositories_user_github_uidx" ON "repositories" USING btree ("user_id","github_id");--> statement-breakpoint
CREATE INDEX "repositories_user_idx" ON "repositories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspace_commands_workspace_idx" ON "workspace_commands" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_commands_user_idx" ON "workspace_commands" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_versions_workspace_version_uidx" ON "workspace_versions" USING btree ("workspace_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_versions_generation_key_uidx" ON "workspace_versions" USING btree ("generation_key");--> statement-breakpoint
CREATE INDEX "workspace_versions_workspace_idx" ON "workspace_versions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspaces_user_idx" ON "workspaces" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspaces_repository_idx" ON "workspaces" USING btree ("repository_id");