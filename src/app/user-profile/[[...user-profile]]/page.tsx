import { UserProfile } from "@clerk/nextjs";

import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";

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
