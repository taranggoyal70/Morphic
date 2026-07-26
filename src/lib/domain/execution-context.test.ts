import { describe, expect, it } from "vitest";

import { repositoryCommitShaSchema } from "./execution-context";

describe("repositoryCommitShaSchema", () => {
  it("accepts a full lowercase Git commit SHA", () => {
    const sha = "a".repeat(40);

    expect(repositoryCommitShaSchema.parse(sha)).toBe(sha);
  });

  it.each([
    ["short SHA", "abc1234"],
    ["uppercase SHA", "A".repeat(40)],
    ["non-hex SHA", "z".repeat(40)],
    ["ref name", "refs/heads/main"],
  ])("rejects a %s", (_label, value) => {
    expect(() => repositoryCommitShaSchema.parse(value)).toThrow();
  });
});
