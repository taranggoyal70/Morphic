import { describe, expect, it } from "vitest";

import { evaluateSandboxCommand } from "@/lib/sandbox-command-policy";

describe("evaluateSandboxCommand", () => {
  it.each([
    "git push origin feature",
    "git reset --hard HEAD~1",
    "git checkout -- src/app/page.tsx",
    "git clean -fd",
    "git rebase main",
    "git commit --amend",
    "git filter-branch -- --all",
  ])("blocks Git history or publication mutation: %s", (command) => {
    expect(evaluateSandboxCommand(command)).toMatchObject({
      allowed: false,
      category: "git_history",
    });
  });

  it.each([
    "git diff --check",
    "git status --short",
    "pnpm test",
    "pnpm typecheck",
  ])("allows verification command: %s", (command) => {
    expect(evaluateSandboxCommand(command)).toEqual({ allowed: true });
  });
});
