"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function WorkspaceRefresh({
  workspaceId,
  active,
}: {
  workspaceId: string;
  active: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const refreshWhenComplete = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          data?: { workspace?: { status?: string } };
        };
        if (payload.data?.workspace?.status !== "generating") {
          router.refresh();
        }
      } catch {
        // A later poll or navigation can retry transient failures.
      }
    };
    const timer = window.setInterval(refreshWhenComplete, 2_500);
    document.addEventListener("visibilitychange", refreshWhenComplete);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenComplete);
      controller.abort();
    };
  }, [active, router, workspaceId]);

  return null;
}
