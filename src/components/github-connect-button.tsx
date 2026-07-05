"use client";

import { useReverification, useUser } from "@clerk/nextjs";
import { GithubLogoIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { resolveGitHubAuthorizationUrl } from "@/lib/github-connection";
import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";
import { cn } from "@/lib/utils";

type GitHubConnectButtonProps = {
  returnUrl?: string;
  label?: string;
  className?: string;
};

export function GitHubConnectButton({
  returnUrl = "/settings/integrations?github=connected",
  label = "Connect GitHub",
  className,
}: GitHubConnectButtonProps) {
  const { isLoaded, user } = useUser();
  const [pending, setPending] = useState(false);
  const createExternalAccount = useReverification(
    (
      params: Parameters<NonNullable<typeof user>["createExternalAccount"]>[0],
    ) => user?.createExternalAccount(params),
  );

  async function connect() {
    if (!user) {
      toast.error("Your account is still loading. Please try again.");
      return;
    }

    setPending(true);
    try {
      const existing = user.externalAccounts.find(
        (account) => account.provider === "github",
      );
      const verificationUrl = await resolveGitHubAuthorizationUrl({
        existingAccount: Boolean(existing),
        create: () =>
          createExternalAccount({
            strategy: "oauth_github",
            additionalScopes: [...GITHUB_OAUTH_SCOPES],
            redirectUrl: returnUrl,
          }),
        reauthorize: async () => {
          if (!existing) return undefined;
          return existing.reauthorize({
            additionalScopes: [...GITHUB_OAUTH_SCOPES],
            redirectUrl: returnUrl,
          });
        },
      });

      window.location.assign(verificationUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "GitHub authorization could not be started.",
      );
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={!isLoaded || pending}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet px-4 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink disabled:cursor-wait disabled:opacity-60",
        className,
      )}
    >
      {pending ? (
        <SpinnerGapIcon size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <GithubLogoIcon size={16} weight="fill" aria-hidden="true" />
      )}
      {pending ? "Opening GitHub…" : label}
    </button>
  );
}
