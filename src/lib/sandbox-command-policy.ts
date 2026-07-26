export type SandboxCommandDecision =
  | { allowed: true }
  | {
      allowed: false;
      category: "git_history" | "destructive" | "secret_access";
      reason: string;
    };

const GIT_HISTORY_MUTATION =
  /\bgit\s+(?:push|reset|clean|rebase|filter-branch|filter-repo)\b|\bgit\s+checkout\s+--|\bgit\s+commit\b[^;&|]*--amend\b/i;
const DESTRUCTIVE_COMMAND = /\brm\s+(?:-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\b/i;

export function evaluateSandboxCommand(
  command: string,
): SandboxCommandDecision {
  if (GIT_HISTORY_MUTATION.test(command)) {
    return {
      allowed: false,
      category: "git_history",
      reason:
        "Git history and publication are controlled by Morphic after verification.",
    };
  }
  if (DESTRUCTIVE_COMMAND.test(command)) {
    return {
      allowed: false,
      category: "destructive",
      reason: "Recursive forced deletion is not allowed in an agent run.",
    };
  }
  return { allowed: true };
}
