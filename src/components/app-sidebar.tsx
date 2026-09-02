"use client";

import { UserButton } from "@clerk/nextjs";
import {
  GearIcon,
  GitBranchIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Brand } from "@/components/brand";
import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";
import { cn } from "@/lib/utils";

type SidebarWorkspace = {
  id: string;
  objective: string;
  status: "generating" | "active" | "archived" | "failed";
  repository: string;
};

export function AppSidebar({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: SidebarWorkspace[];
  activeWorkspaceId?: string;
}) {
  const ordered = [...workspaces].sort(
    (a, b) => Number(a.status === "archived") - Number(b.status === "archived"),
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[264px] flex-col border-r border-line-strong bg-surface lg:flex">
      <div className="flex h-[72px] items-center border-b border-line px-5">
        <Brand />
      </div>

      <div className="px-3 pb-2 pt-5">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Outcome routes
          </span>
          <Link
            href="/workspaces"
            aria-label="Create objective"
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted-light transition hover:bg-evidence/10 hover:text-evidence"
          >
            <PlusIcon size={15} />
          </Link>
        </div>
        <nav className="space-y-1">
          {ordered.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className={cn(
                "group flex min-h-14 gap-3 rounded-xl border px-3 py-3 text-sm transition",
                activeWorkspaceId === workspace.id
                  ? "border-evidence/30 bg-evidence/10 text-paper"
                  : "border-transparent text-muted-light hover:border-line hover:bg-white/[0.035] hover:text-paper",
              )}
            >
              <span
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-sm border",
                  workspace.status === "active" && "border-violet bg-violet/30",
                  workspace.status === "generating" &&
                    "animate-pulse border-amber bg-amber/30",
                  workspace.status === "failed" && "border-danger bg-danger/30",
                  workspace.status === "archived" && "border-muted",
                )}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {workspace.objective}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] text-muted">
                  {workspace.repository}
                </span>
              </span>
            </Link>
          ))}
          {workspaces.length === 0 && (
            <p className="px-2.5 py-3 text-xs leading-5 text-muted">
              Create an objective to pin its repository evidence and next
              decision here.
            </p>
          )}
        </nav>
      </div>

      <div className="mt-auto border-t border-line p-3">
        <Link
          href="/workspaces"
          className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
        >
          <SparkleIcon size={17} />
          New objective
        </Link>
        <Link
          href="/settings/integrations"
          className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
        >
          <GitBranchIcon size={17} />
          Integrations
        </Link>
        <div className="mt-1 flex items-center justify-between rounded-lg px-2.5 py-2">
          <span className="flex items-center gap-2 text-sm text-muted-light">
            <GearIcon size={17} />
            Account
          </span>
          <UserButton
            userProfileProps={{
              additionalOAuthScopes: {
                github: [...GITHUB_OAUTH_SCOPES],
              },
            }}
          />
        </div>
      </div>
    </aside>
  );
}
