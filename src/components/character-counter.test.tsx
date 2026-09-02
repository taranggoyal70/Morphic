import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CharacterCounter } from "@/components/character-counter";

describe("CharacterCounter", () => {
  it("announces remaining capacity", () => {
    render(<CharacterCounter current={42} maximum={100} label="Objective" />);

    expect(screen.getByText("58 characters remaining")).toBeInTheDocument();
    expect(screen.getByText("58 characters remaining")).toHaveAccessibleName(
      "Objective: 58 characters remaining",
    );
  });
});
