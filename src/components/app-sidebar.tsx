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
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[238px] flex-col border-r border-line bg-[#090b10] lg:flex">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>

      <div className="px-3 pb-2 pt-5">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Objectives
          </span>
          <Link
            href="/workspaces"
            aria-label="Create objective"
            className="rounded-md p-1 text-muted transition hover:bg-white/5 hover:text-paper"
          >
            <PlusIcon size={15} />
          </Link>
        </div>
        <nav className="space-y-1">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className={cn(
                "group flex gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition",
                activeWorkspaceId === workspace.id
                  ? "bg-violet/10 text-paper ring-1 ring-inset ring-violet/20"
                  : "text-muted-light hover:bg-white/[0.035] hover:text-paper",
              )}
            >
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full border",
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
              Your objectives will appear here after you create the first
              workspace.
            </p>
          )}
        </nav>
      </div>

      <div className="mt-auto border-t border-line p-3">
        <Link
          href="/workspaces"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
        >
          <SparkleIcon size={17} />
          New objective
        </Link>
        <Link
          href="/settings/integrations"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
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
