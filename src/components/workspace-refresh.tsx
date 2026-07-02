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
    const timer = window.setInterval(async () => {
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
    }, 2_500);
    return () => window.clearInterval(timer);
  }, [active, router, workspaceId]);

  return null;
}
