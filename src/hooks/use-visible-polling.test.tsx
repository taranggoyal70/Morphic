import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVisiblePolling } from "@/hooks/use-visible-polling";

describe("useVisiblePolling", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("polls only while the document is visible", () => {
    const callback = vi.fn();
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");

    renderHook(() => useVisiblePolling(callback, 1_000, true));
    act(() => vi.advanceTimersByTime(1_000));
    expect(callback).toHaveBeenCalledOnce();

    visibility.mockReturnValue("hidden");
    act(() => vi.advanceTimersByTime(1_000));
    expect(callback).toHaveBeenCalledOnce();
  });
});
