import { describe, expect, it } from "vitest";

import { assertPublishablePaths } from "@/lib/publication-policy";

describe("assertPublishablePaths", () => {
  it("accepts normalized repository-relative paths", () => {
    expect(assertPublishablePaths(["src/app/page.tsx", ".github/ci.yml"])).toEqual(
      ["src/app/page.tsx", ".github/ci.yml"],
    );
  });

  it.each([
    [["/etc/passwd"]],
    [["../outside"]],
    [["src/../secret"]],
    [[""]],
  ])(
    "rejects a path outside the repository contract",
    (paths) => {
      expect(() => assertPublishablePaths(paths)).toThrow();
    },
  );
});
