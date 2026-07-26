import { describe, expect, it } from "vitest";

import { didWorkingTreeChange } from "@/lib/working-tree";

describe("didWorkingTreeChange", () => {
  it("does not mark read-only commands as a change", () => {
    expect(didWorkingTreeChange("", "")).toBe(false);
    expect(didWorkingTreeChange(" M src/app/page.tsx", " M src/app/page.tsx")).toBe(
      false,
    );
  });

  it("detects newly modified, deleted, and untracked paths", () => {
    expect(didWorkingTreeChange("", " M src/app/page.tsx")).toBe(true);
    expect(didWorkingTreeChange("", " D src/old.ts")).toBe(true);
    expect(didWorkingTreeChange("", "?? src/new.ts")).toBe(true);
  });
});
