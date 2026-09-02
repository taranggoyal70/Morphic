"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useVisiblePolling } from "@/hooks/use-visible-polling";

export function WorkspaceRefresh({
  workspaceId,
  active,
}: {
  workspaceId: string;
  active: boolean;
}) {
  const router = useRouter();

  const refreshWhenComplete = useCallback(
    async (signal: AbortSignal) => {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        cache: "no-store",
        signal,
      });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        data?: { workspace?: { status?: string } };
      };
      if (payload.data?.workspace?.status !== "generating") {
        router.refresh();
      }
    },
    [router, workspaceId],
  );
  useVisiblePolling(refreshWhenComplete, 2_500, active);

  return null;
}
