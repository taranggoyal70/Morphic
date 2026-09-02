import { z } from "zod";

export const workspacePlanSchema = z
  .object({
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
          sourceType: z.enum([
            "issue",
            "pull_request",
            "repository",
            "inferred",
          ]),
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
  })
  .superRefine((plan, context) => {
    const criticalPathIds = plan.criticalPath.map((item) => item.id);
    if (new Set(criticalPathIds).size !== criticalPathIds.length) {
      context.addIssue({
        code: "custom",
        message: "Critical Path Item identifiers must be unique.",
        path: ["criticalPath"],
      });
    }

    for (const [index, item] of plan.criticalPath.entries()) {
      const numberedSource =
        item.sourceType === "issue" || item.sourceType === "pull_request";
      if (numberedSource !== (item.sourceNumber !== null)) {
        context.addIssue({
          code: "custom",
          message:
            "Issue and pull request evidence requires a source number; repository and inferred evidence must omit it.",
          path: ["criticalPath", index, "sourceNumber"],
        });
      }

      if (new Set(item.dependencyIds).size !== item.dependencyIds.length) {
        context.addIssue({
          code: "custom",
          message: "Critical Path dependencies must be unique.",
          path: ["criticalPath", index, "dependencyIds"],
        });
      }

      if (item.dependencyIds.includes(item.id)) {
        context.addIssue({
          code: "custom",
          message: "A Critical Path Item cannot depend on itself.",
          path: ["criticalPath", index, "dependencyIds"],
        });
      }

      const missingDependency = item.dependencyIds.find(
        (dependencyId) => !criticalPathIds.includes(dependencyId),
      );
      if (missingDependency) {
        context.addIssue({
          code: "custom",
          message: `Unknown Critical Path dependency: ${missingDependency}.`,
          path: ["criticalPath", index, "dependencyIds"],
        });
      }
    }

    const dependencies = new Map(
      plan.criticalPath.map((item) => [item.id, item.dependencyIds]),
    );
    const visiting = new Set<string>();
    const visited = new Set<string>();
    function hasCycle(itemId: string): boolean {
      if (visiting.has(itemId)) return true;
      if (visited.has(itemId)) return false;
      visiting.add(itemId);
      const cyclic = (dependencies.get(itemId) ?? []).some(hasCycle);
      visiting.delete(itemId);
      visited.add(itemId);
      return cyclic;
    }
    if (criticalPathIds.some(hasCycle)) {
      context.addIssue({
        code: "custom",
        message: "Critical Path dependencies cannot contain a cycle.",
        path: ["criticalPath"],
      });
    }

    const impactPaths = plan.repositoryImpact.map((impact) => impact.path);
    if (new Set(impactPaths).size !== impactPaths.length) {
      context.addIssue({
        code: "custom",
        message: "Repository Impact paths must be unique.",
        path: ["repositoryImpact"],
      });
    }

    const decisionIds = plan.decisions.map((decision) => decision.id);
    if (new Set(decisionIds).size !== decisionIds.length) {
      context.addIssue({
        code: "custom",
        message: "Open Decision identifiers must be unique.",
        path: ["decisions"],
      });
    }

    for (const [index, decision] of plan.decisions.entries()) {
      const optionIds = decision.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length) {
        context.addIssue({
          code: "custom",
          message: "Open Decision option identifiers must be unique.",
          path: ["decisions", index, "options"],
        });
      }
      if (!optionIds.includes(decision.recommendedOptionId)) {
        context.addIssue({
          code: "custom",
          message: "The recommended option must belong to its Open Decision.",
          path: ["decisions", index, "recommendedOptionId"],
        });
      }
    }
  });

export type WorkspacePlan = z.infer<typeof workspacePlanSchema>;

export const createWorkspaceSchema = z
  .object({
    repositoryId: z.string().uuid(),
    objective: z
      .string()
      .trim()
      .min(8)
      .max(500)
      .transform((value) => value.replace(/\s+/g, " ")),
    targetDate: z.string().datetime().nullable().optional(),
    constraints: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(180)
          .transform((value) => value.replace(/\s+/g, " ")),
      )
      .max(12)
      .default([]),
  })
  .refine(
    (input) =>
      !input.targetDate || new Date(input.targetDate).getTime() > Date.now(),
    {
      message: "Review target must be in the future.",
      path: ["targetDate"],
    },
  )
  .transform((input) => ({
    ...input,
    constraints: input.constraints.filter(
      (constraint, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.toLocaleLowerCase() === constraint.toLocaleLowerCase(),
        ) === index,
    ),
  }));

export const adaptWorkspaceSchema = z.object({
  command: z.string().trim().min(3).max(800),
});

export const createCodexRunSchema = z.object({
  workspaceId: z.string().uuid(),
  instruction: z.string().trim().min(8).max(4_000),
  approvalRequired: z.literal(true),
});
