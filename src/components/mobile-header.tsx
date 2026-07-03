"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Brand } from "@/components/brand";
import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur lg:hidden">
      <Brand />
      <div className="flex items-center gap-3">
        <Link
          href="/workspaces"
          className="text-xs font-medium text-violet-light"
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
