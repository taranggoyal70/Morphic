"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Brand } from "@/components/brand";
import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line-strong bg-surface/95 px-4 backdrop-blur-xl lg:hidden">
      <Brand />
      <div className="flex items-center gap-3">
        <Link
          href="/workspaces"
          className="inline-flex min-h-10 items-center rounded-lg px-2 text-xs font-semibold text-evidence"
        >
          Workspaces
        </Link>
        <UserButton
          userProfileProps={{
            additionalOAuthScopes: {
              github: [...GITHUB_OAUTH_SCOPES],
            },
          }}
        />
      </div>
    </header>
  );
}
