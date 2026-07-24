import "server-only";

import { getServerEnv } from "@/lib/env";

const LOCUS_API_URL = "https://locus-five-iota.vercel.app/api/v1/locate";
const LOCUS_TIMEOUT_MS = 10_000;

export type LocusSlice = {
  reason: string;
  files: string[];
  context: string;
  savedPct: number;
};

// Best-effort: Locus scopes the task down to the files most likely relevant,
// so the agent can start editing instead of spending its first several turns
// exploring the tree. If Locus is unavailable or misses, the agent still has
// its own file tools to fall back on — this never blocks a Codex run.
export async function fetchLocusSlice(
  repositoryFullName: string,
  task: string,
): Promise<LocusSlice | null> {
  const env = getServerEnv();
  if (!env.LOCUS_API_KEY) return null;

  try {
    const response = await fetch(LOCUS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LOCUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repo: repositoryFullName, task }),
      signal: AbortSignal.timeout(LOCUS_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      reason?: string;
      slice?: Array<{ path: string }>;
      context?: string;
      tokens?: { savedPct?: number };
    };
    if (!data.slice || data.slice.length === 0) return null;

    return {
      reason: data.reason ?? "",
      files: data.slice.map((f) => f.path),
      context: data.context ?? "",
      savedPct: data.tokens?.savedPct ?? 0,
    };
  } catch {
    return null;
  }
}
