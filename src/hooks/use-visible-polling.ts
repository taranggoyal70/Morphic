"use client";

import { useEffect } from "react";

export function useVisiblePolling(
  callback: (signal: AbortSignal) => void | Promise<void>,
  intervalMilliseconds: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      void Promise.resolve(callback(controller.signal)).catch(() => {
        // A later poll can retry a transient callback failure.
      });
    };
    const timer = window.setInterval(poll, intervalMilliseconds);
    document.addEventListener("visibilitychange", poll);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
      controller.abort();
    };
  }, [callback, enabled, intervalMilliseconds]);
}
