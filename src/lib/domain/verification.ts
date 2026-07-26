export type PackageManager = "pnpm" | "npm" | "yarn" | "bun" | "unknown";

export type VerificationCommand = {
  id: string;
  label: string;
  command: string;
  timeoutMs: number;
};

export type VerificationPlan = {
  packageManager: PackageManager;
  commands: VerificationCommand[];
  reason: string;
};

export type VerificationResult = {
  status: "passed" | "failed";
  commands: Array<
    VerificationCommand & {
      exitCode: number;
      output: string;
    }
  >;
};
