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
    const refreshWhenComplete = async () => {
      if (document.visibilityState !== "visible") return;
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        data?: { workspace?: { status?: string } };
      };
      if (payload.data?.workspace?.status !== "generating") {
        router.refresh();
      }
    };
    const timer = window.setInterval(refreshWhenComplete, 2_500);
    document.addEventListener("visibilitychange", refreshWhenComplete);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenComplete);
    };
  }, [active, router, workspaceId]);

  return null;
}
