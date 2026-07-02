import { z } from "zod";

export const workspacePlanSchema = z.object({
  summary: z.string().min(1).max(600),
  outcome: z.object({
    statement: z.string().min(1).max(500),
    definitionOfDone: z.array(z.string().min(1).max(240)).min(1).max(8),
    successSignal: z.string().min(1).max(300),
  }),
  criticalPath: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(180),
        detail: z.string().min(1).max(400),
        status: z.enum(["todo", "in_progress", "blocked", "done"]),
        sourceType: z.enum(["issue", "pull_request", "repository", "inferred"]),
        sourceNumber: z.number().int().positive().nullable(),
        dependencyIds: z.array(z.string().min(1).max(80)).max(8),
        estimatedMinutes: z.number().int().positive().max(10_080).nullable(),
      }),
    )
    .min(1)
    .max(20),
  repositoryImpact: z
    .array(
      z.object({
        path: z.string().min(1).max(500),
        reason: z.string().min(1).max(400),
        changeKind: z.enum(["create", "modify", "delete", "inspect"]),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(30),
  decisions: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        question: z.string().min(1).max(320),
        context: z.string().min(1).max(500),
        options: z
          .array(
            z.object({
              id: z.string().min(1).max(80),
              label: z.string().min(1).max(180),
              tradeoff: z.string().min(1).max(360),
            }),
          )
          .min(2)
          .max(4),
        recommendedOptionId: z.string().min(1).max(80),
      }),
    )
    .max(8),
  risks: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(180),
        detail: z.string().min(1).max(400),
        severity: z.enum(["low", "medium", "high", "critical"]),
        mitigation: z.string().min(1).max(400),
      }),
    )
    .max(12),
  interface: z.object({
    primaryModule: z.enum([
      "critical_path",
      "repository_impact",
      "decisions",
      "risks",
    ]),
    moduleOrder: z
      .array(
        z.enum([
          "outcome",
          "critical_path",
          "repository_impact",
          "decisions",
          "risks",
          "codex_proposal",
        ]),
      )
      .min(4)
      .max(6),
    density: z.enum(["comfortable", "compact"]),
  }),
});

export type WorkspacePlan = z.infer<typeof workspacePlanSchema>;

export const createWorkspaceSchema = z.object({
  repositoryId: z.string().uuid(),
  objective: z.string().trim().min(8).max(500),
  targetDate: z.iso.datetime().nullable().optional(),
  constraints: z.array(z.string().trim().min(1).max(180)).max(12).default([]),
});

export const adaptWorkspaceSchema = z.object({
  command: z.string().trim().min(3).max(800),
});

export const createCodexRunSchema = z.object({
  workspaceId: z.string().uuid(),
  instruction: z.string().trim().min(8).max(4_000),
  approvalRequired: z.literal(true),
});
