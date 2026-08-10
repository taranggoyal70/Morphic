export type PackageManager = "pnpm" | "npm" | "yarn" | "bun" | "unknown";

export type VerificationCapability =
  | "repository-tests"
  | "static-analysis"
  | "production-build"
  | "behavioral-regression";

export type VerificationCommand = {
  id: string;
  label: string;
  command: string;
  timeoutMs: number;
  capabilities: VerificationCapability[];
  execution?: {
    executable: string;
    args: string[];
  };
};

export type VerificationPlan = {
  packageManager: PackageManager;
  commands: VerificationCommand[];
  reason: string;
};

export type VerificationResult = {
  status: "passed" | "failed";
  behavioralEvidence?: {
    incidentExternalId: string;
    testPaths: string[];
  };
  commands: Array<
    VerificationCommand & {
      exitCode: number;
      output: string;
    }
  >;
};
