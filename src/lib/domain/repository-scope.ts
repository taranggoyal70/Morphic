export type RepositoryScopeInput = {
  instruction: string;
  objective: string;
  repositoryImpactPaths: string[];
  snapshotPaths: string[];
  limit?: number;
};

export type RepositoryScope = {
  paths: string[];
  totalPathCount: number;
  selectedPathCount: number;
  savedPercent: number;
  reason: string;
};
