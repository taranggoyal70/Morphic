import "server-only";

import { Octokit } from "@octokit/rest";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import {
  githubSnapshots,
  type GitHubIssueEvidence,
  type GitHubPullEvidence,
  repositories,
  type RepositoryTreeEntry,
} from "@/db/schema";
import { getGitHubAccessToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

function getGitHubClient(token: string) {
  return new Octokit({
    auth: token,
    userAgent: "morphic/0.1.0",
    request: {
      timeout: 20_000,
    },
  });
}

export async function syncRepositories(userId: string) {
  const token = await getGitHubAccessToken(userId);
  const github = getGitHubClient(token);
  const remoteRepositories = await github.paginate(
    github.rest.repos.listForAuthenticatedUser,
    {
      affiliation: "owner,collaborator,organization_member",
      visibility: "all",
      sort: "pushed",
      per_page: 100,
    },
  );

  const now = new Date();
  for (const repository of remoteRepositories) {
    const owner = repository.owner?.login;
    if (!owner) continue;

    await getDb()
      .insert(repositories)
      .values({
        userId,
        githubId: repository.id,
        owner,
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        defaultBranch: repository.default_branch,
        isPrivate: repository.private,
        pushedAt: repository.pushed_at ? new Date(repository.pushed_at) : null,
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [repositories.userId, repositories.githubId],
        set: {
          owner,
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description,
          defaultBranch: repository.default_branch,
          isPrivate: repository.private,
          pushedAt: repository.pushed_at
            ? new Date(repository.pushed_at)
            : null,
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
  }

  return getDb()
    .select()
    .from(repositories)
    .where(eq(repositories.userId, userId))
    .orderBy(desc(repositories.pushedAt));
}

export async function listRepositories(userId: string) {
  return getDb()
    .select()
    .from(repositories)
    .where(eq(repositories.userId, userId))
    .orderBy(desc(repositories.pushedAt));
}

export async function getOwnedRepository(userId: string, repositoryId: string) {
  const [repository] = await getDb()
    .select()
    .from(repositories)
    .where(
      and(eq(repositories.id, repositoryId), eq(repositories.userId, userId)),
    )
    .limit(1);

  if (!repository) {
    throw new AppError("Repository not found.", 404, "repository_not_found");
  }

  return repository;
}

export async function captureRepositorySnapshot(input: {
  userId: string;
  repositoryId: string;
}) {
  const repository = await getOwnedRepository(input.userId, input.repositoryId);
  const token = await getGitHubAccessToken(input.userId);
  const github = getGitHubClient(token);
  const owner = repository.owner;
  const repo = repository.name;
  const branch = repository.defaultBranch;

  const reference = await github.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const headSha = reference.data.object.sha;

  const [existing] = await getDb()
    .select()
    .from(githubSnapshots)
    .where(
      and(
        eq(githubSnapshots.repositoryId, repository.id),
        eq(githubSnapshots.headSha, headSha),
      ),
    )
    .limit(1);
  if (existing) return existing;

  const [issueData, pullData, treeData] = await Promise.all([
    github.paginate(github.rest.issues.listForRepo, {
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    }),
    github.paginate(github.rest.pulls.list, {
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    }),
    github.rest.git.getTree({
      owner,
      repo,
      tree_sha: headSha,
      recursive: "1",
    }),
  ]);

  const issues: GitHubIssueEvidence[] = issueData
    .filter((issue) => !issue.pull_request)
    .slice(0, 200)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state === "closed" ? "closed" : "open",
      labels: issue.labels
        .map((label) => (typeof label === "string" ? label : label.name))
        .filter((label): label is string => Boolean(label)),
      assignees: (issue.assignees ?? []).map((assignee) => assignee.login),
      updatedAt: issue.updated_at,
      url: issue.html_url,
    }));

  const pullRequests: GitHubPullEvidence[] = pullData
    .slice(0, 100)
    .map((pull) => ({
      number: pull.number,
      title: pull.title,
      state: pull.state === "closed" ? "closed" : "open",
      draft: pull.draft ?? false,
      head: pull.head.ref,
      base: pull.base.ref,
      updatedAt: pull.updated_at,
      url: pull.html_url,
    }));

  const tree: RepositoryTreeEntry[] = treeData.data.tree
    .filter(
      (
        entry,
      ): entry is typeof entry & {
        path: string;
        sha: string;
        type: "blob" | "tree";
      } =>
        Boolean(entry.path) &&
        Boolean(entry.sha) &&
        (entry.type === "blob" || entry.type === "tree"),
    )
    .slice(0, 8_000)
    .map((entry) => ({
      path: entry.path,
      sha: entry.sha,
      type: entry.type,
      size: entry.size,
    }));

  const [snapshot] = await getDb()
    .insert(githubSnapshots)
    .values({
      repositoryId: repository.id,
      branch,
      headSha,
      issues,
      pullRequests,
      tree,
    })
    .onConflictDoNothing({
      target: [githubSnapshots.repositoryId, githubSnapshots.headSha],
    })
    .returning();

  if (snapshot) return snapshot;

  const [concurrentSnapshot] = await getDb()
    .select()
    .from(githubSnapshots)
    .where(
      and(
        eq(githubSnapshots.repositoryId, repository.id),
        eq(githubSnapshots.headSha, headSha),
      ),
    )
    .limit(1);

  if (!concurrentSnapshot) {
    throw new AppError(
      "Repository snapshot could not be persisted.",
      500,
      "snapshot_persist_failed",
    );
  }
  return concurrentSnapshot;
}
