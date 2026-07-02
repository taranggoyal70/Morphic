import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { GITHUB_OAUTH_SCOPES } from "@/lib/github-oauth";

export async function requireMorphicUser() {
  const session = await auth();
  if (!session.userId) {
    throw new AppError("Authentication required.", 401, "unauthenticated");
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(session.userId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? null;
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    primaryEmail;

  await getDb()
    .insert(users)
    .values({
      id: clerkUser.id,
      email: primaryEmail,
      displayName,
      avatarUrl: clerkUser.imageUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: primaryEmail,
        displayName,
        avatarUrl: clerkUser.imageUrl,
        updatedAt: new Date(),
      },
    });

  return {
    id: clerkUser.id,
    email: primaryEmail,
    displayName,
    avatarUrl: clerkUser.imageUrl,
  };
}

export async function getGitHubAccessToken(userId: string) {
  const client = await clerkClient();
  const result = await client.users.getUserOauthAccessToken(userId, "github");
  const connection = result.data[0];
  const accessToken = connection?.token;

  if (!accessToken) {
    throw new AppError(
      "Connect GitHub to sync repositories.",
      409,
      "github_connection_required",
    );
  }

  const grantedScopes = new Set(connection.scopes ?? []);
  if (!GITHUB_OAUTH_SCOPES.every((scope) => grantedScopes.has(scope))) {
    throw new AppError(
      "Reconnect GitHub and approve repository and organization access.",
      409,
      "github_scope_required",
      { requiredScopes: GITHUB_OAUTH_SCOPES },
    );
  }

  return accessToken;
}
