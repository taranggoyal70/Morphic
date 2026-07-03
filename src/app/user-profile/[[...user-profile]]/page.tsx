import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";

export const metadata: Metadata = {
  title: "Profile",
};

export default function UserProfilePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-12">
      <UserProfile
        additionalOAuthScopes={{
          github: [...GITHUB_OAUTH_SCOPES],
        }}
      />
    </main>
  );
}
