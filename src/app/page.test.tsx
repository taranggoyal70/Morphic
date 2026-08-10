import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
}));

afterEach(cleanup);

describe("HomePage", () => {
  it("presents the shipped source-drift control without inventing customer evidence", async () => {
    render(await HomePage());

    expect(
      screen.getByText(/blocks publication when the reviewed source drifts/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/illustrative synthetic evidence/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/seeking three paid design partners/i),
    ).toBeInTheDocument();
  });
});
