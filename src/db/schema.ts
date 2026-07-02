import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { WorkspacePlan } from "@/lib/domain/workspace";

export const workspaceStatus = pgEnum("workspace_status", [
  "generating",
  "active",
  "archived",
  "failed",
]);
export const commandStatus = pgEnum("command_status", [
  "queued",
  "running",
  "completed",
  "failed",
]);
export const runStatus = pgEnum("run_status", [
  "awaiting_approval",
  "queued",
  "provisioning",
  "running",
  "completed",
  "failed",
  "cancelled",
]);
export const approvalStatus = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
  "expired",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const repositories = pgTable(
  "repositories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    githubId: bigint("github_id", { mode: "number" }).notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(),
    description: text("description"),
    defaultBranch: text("default_branch").notNull(),
    isPrivate: boolean("is_private").default(false).notNull(),
    pushedAt: timestamp("pushed_at", { withTimezone: true }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("repositories_user_github_uidx").on(
      table.userId,
      table.githubId,
    ),
    index("repositories_user_idx").on(table.userId),
  ],
);

export type GitHubIssueEvidence = {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  assignees: string[];
  updatedAt: string;
  url: string;
};

export type GitHubPullEvidence = {
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  head: string;
  base: string;
  updatedAt: string;
  url: string;
};

export type RepositoryTreeEntry = {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

export const githubSnapshots = pgTable(
  "github_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    branch: text("branch").notNull(),
    headSha: text("head_sha").notNull(),
    issues: jsonb("issues").$type<GitHubIssueEvidence[]>().notNull(),
    pullRequests: jsonb("pull_requests")
      .$type<GitHubPullEvidence[]>()
      .notNull(),
    tree: jsonb("tree").$type<RepositoryTreeEntry[]>().notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("github_snapshots_repo_sha_uidx").on(
      table.repositoryId,
      table.headSha,
    ),
    index("github_snapshots_repo_idx").on(table.repositoryId),
  ],
);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    objective: text("objective").notNull(),
    targetDate: timestamp("target_date", { withTimezone: true }),
    constraints: jsonb("constraints").$type<string[]>().default([]).notNull(),
    status: workspaceStatus("status").default("generating").notNull(),
    currentVersion: integer("current_version").default(0).notNull(),
    generationRunId: text("generation_run_id"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("workspaces_user_idx").on(table.userId),
    index("workspaces_repository_idx").on(table.repositoryId),
  ],
);

export const workspaceVersions = pgTable(
  "workspace_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    snapshotId: uuid("snapshot_id")
      .notNull()
      .references(() => githubSnapshots.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    generationKey: text("generation_key").notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    openaiResponseId: text("openai_response_id"),
    plan: jsonb("plan").$type<WorkspacePlan>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_versions_workspace_version_uidx").on(
      table.workspaceId,
      table.version,
    ),
    uniqueIndex("workspace_versions_generation_key_uidx").on(
      table.generationKey,
    ),
    index("workspace_versions_workspace_idx").on(table.workspaceId),
  ],
);

export const workspaceCommands = pgTable(
  "workspace_commands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    command: text("command").notNull(),
    status: commandStatus("status").default("queued").notNull(),
    resultVersion: integer("result_version"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("workspace_commands_workspace_idx").on(table.workspaceId),
    index("workspace_commands_user_idx").on(table.userId),
  ],
);

export const codexRuns = pgTable(
  "codex_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    instruction: text("instruction").notNull(),
    status: runStatus("status").default("awaiting_approval").notNull(),
    workflowRunId: text("workflow_run_id"),
    sandboxId: text("sandbox_id"),
    codexThreadId: text("codex_thread_id"),
    branchName: text("branch_name"),
    baseSha: text("base_sha"),
    commitSha: text("commit_sha"),
    pullRequestNumber: integer("pull_request_number"),
    pullRequestUrl: text("pull_request_url"),
    resultSummary: text("result_summary"),
    usage: jsonb("usage").$type<{
      inputTokens: number;
      cachedInputTokens: number;
      outputTokens: number;
      reasoningOutputTokens: number;
    }>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("codex_runs_workspace_idx").on(table.workspaceId),
    index("codex_runs_user_idx").on(table.userId),
  ],
);

export const codexRunEvents = pgTable(
  "codex_run_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => codexRuns.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("codex_run_events_run_sequence_uidx").on(
      table.runId,
      table.sequence,
    ),
    index("codex_run_events_run_idx").on(table.runId),
  ],
);

export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => codexRuns.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: approvalStatus("status").default("pending").notNull(),
    note: text("note"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    actedAt: timestamp("acted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("approvals_run_uidx").on(table.runId),
    index("approvals_user_idx").on(table.userId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
  ],
);
