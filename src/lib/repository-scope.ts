import type {
  RepositoryScope,
  RepositoryScopeInput,
} from "@/lib/domain/repository-scope";

const DEFAULT_SCOPE_LIMIT = 40;
const TOKEN_PATTERN = /[a-z0-9]+/g;
const IGNORED_TOKENS = new Set([
  "and",
  "the",
  "for",
  "from",
  "into",
  "with",
  "this",
  "that",
  "implement",
  "ship",
  "reliable",
]);

function tokens(value: string) {
  return new Set(
    (value.toLowerCase().match(TOKEN_PATTERN) ?? []).filter(
      (token) => token.length >= 3 && !IGNORED_TOKENS.has(token),
    ),
  );
}

function directory(path: string) {
  const separator = path.lastIndexOf("/");
  return separator === -1 ? "" : path.slice(0, separator);
}

function pathScore(
  path: string,
  taskTokens: Set<string>,
  impactPaths: Set<string>,
  impactDirectories: Set<string>,
) {
  if (impactPaths.has(path)) return 10_000;

  const normalizedPath = path.toLowerCase();
  let score = normalizedPath.startsWith("src/") ? 1 : 0;
  for (const token of taskTokens) {
    if (normalizedPath.includes(token)) score += 20;
  }
  for (const impactDirectory of impactDirectories) {
    if (impactDirectory && directory(path) === impactDirectory) score += 100;
  }
  if (/\.(test|spec)\.[^.]+$/.test(normalizedPath)) score += 2;
  return score;
}

export function selectRepositoryScope(
  input: RepositoryScopeInput,
): RepositoryScope {
  const uniquePaths = [...new Set(input.snapshotPaths)].sort();
  const limit = Math.max(
    1,
    Math.min(input.limit ?? DEFAULT_SCOPE_LIMIT, uniquePaths.length || 1),
  );
  const impactPaths = new Set(input.repositoryImpactPaths);
  const impactDirectories = new Set(input.repositoryImpactPaths.map(directory));
  const taskTokens = tokens(`${input.objective} ${input.instruction}`);

  const paths = uniquePaths
    .map((path) => ({
      path,
      score: pathScore(path, taskTokens, impactPaths, impactDirectories),
    }))
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, limit)
    .map(({ path }) => path);

  const totalPathCount = uniquePaths.length;
  const selectedPathCount = paths.length;
  const savedPercent =
    totalPathCount === 0
      ? 0
      : Math.round((1 - selectedPathCount / totalPathCount) * 100);

  return {
    paths,
    totalPathCount,
    selectedPathCount,
    savedPercent,
    reason:
      "Selected from the approved Repository Snapshot using accepted impact paths and task-language matches.",
  };
}
