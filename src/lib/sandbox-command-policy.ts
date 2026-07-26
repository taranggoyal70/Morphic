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
const SECRET_ACCESS =
  /(?:^|[;&|]\s*)(?:env|printenv)(?:\s|$)|\b(?:cat|sed|head|tail|less|more|rg|grep)\b[^;&|]*(?:\.env(?:\.|$)|\/\.ssh\/|\/proc\/(?:self|\d+)\/environ)|\$(?:\{)?[A-Z0-9_]*(?:TOKEN|KEY|SECRET|PASSWORD)\b|\b(?:process\.env|os\.environ)\b|\bgit\s+remote\s+(?:-v|get-url)\b/i;

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
  if (SECRET_ACCESS.test(command)) {
    return {
      allowed: false,
      category: "secret_access",
      reason:
        "Commands may not enumerate environment variables, credentials, secret files, or authenticated remotes.",
    };
  }
  return { allowed: true };
}
