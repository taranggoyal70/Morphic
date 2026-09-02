import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlannerInput } from "@/lib/planner-input";

const mocks = vi.hoisted(() => ({
  parse: vi.fn(),
  openAiConstructor: vi.fn(),
  getGitHubAccessToken: vi.fn(),
}));

vi.mock("openai", () => ({
  default: mocks.openAiConstructor,
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth", () => ({
  getGitHubAccessToken: mocks.getGitHubAccessToken,
}));

import { generateWorkspacePlan } from "@/lib/workspace-planner";

const plan = {
  summary: "Ship onboarding safely.",
  outcome: {
    statement: "Users can complete onboarding.",
    definitionOfDone: ["A reviewer can verify the flow."],
    successSignal: "A user reaches the dashboard.",
  },
  criticalPath: [
    {
      id: "map-flow",
      title: "Map the flow",
      detail: "Review the current onboarding route.",
      status: "todo",
      sourceType: "repository",
      sourceNumber: null,
      dependencyIds: [],
      estimatedMinutes: 30,
    },
  ],
  repositoryImpact: [
    {
      path: "src/app/onboarding/page.tsx",
      reason: "Primary onboarding surface.",
      changeKind: "inspect",
      confidence: 0.8,
    },
  ],
  decisions: [],
  risks: [],
  interface: {
    primaryModule: "critical_path",
    moduleOrder: ["outcome", "critical_path", "repository_impact", "risks"],
    density: "comfortable",
  },
};

function plannerInput(): PlannerInput {
  return {
    userId: "user_123",
    objective: "Ship reliable onboarding",
    targetDate: null,
    constraints: [],
    repository: {
      fullName: "acme/product",
      defaultBranch: "main",
    },
    snapshot: {
      headSha: "head-sha",
      issues: [],
      pullRequests: [],
      tree: [
        {
          path: "src/app/onboarding/page.tsx",
          type: "blob" as const,
          sha: "blob-sha",
          size: 12_345,
        },
      ],
    },
  };
}

describe("generateWorkspacePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DATABASE_URL", "https://database.example/morphic");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_morphic");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_morphic");
    vi.stubEnv("MORPHIC_PLANNER_MODEL", "openai/gpt-4.1-mini");
    vi.stubEnv("MORPHIC_PROMPT_VERSION", "workspace-v1");

    mocks.getGitHubAccessToken.mockResolvedValue("github-user-token");
    mocks.parse.mockResolvedValue({
      id: "github-model-response",
      choices: [{ message: { parsed: plan } }],
    });
    mocks.openAiConstructor.mockImplementation(function OpenAI() {
      return {
        chat: { completions: { parse: mocks.parse } },
      };
    });
  });

  it("uses the signed-in user's GitHub token against GitHub Models", async () => {
    const result = await generateWorkspacePlan(plannerInput());

    expect(mocks.getGitHubAccessToken).toHaveBeenCalledWith("user_123");
    expect(mocks.openAiConstructor).toHaveBeenCalledWith({
      apiKey: "github-user-token",
      baseURL: "https://models.github.ai/inference",
    });
    expect(mocks.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "openai/gpt-4.1-mini",
        max_tokens: 4096,
      }),
    );
    expect(result).toEqual({
      plan,
      responseId: "github-model-response",
      model: "openai/gpt-4.1-mini",
      promptVersion: "workspace-v1",
    });
  });
});
