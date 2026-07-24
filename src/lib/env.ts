import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(20),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  MORPHIC_PLANNER_MODEL: z.string().min(1).default("openai/gpt-4.1-mini"),
  MORPHIC_CODEX_MODEL: z.string().min(1).default("openai/gpt-4.1"),
  MORPHIC_PROMPT_VERSION: z.string().min(1).default("workspace-v1"),
  VERCEL_TOKEN: z.string().min(1).optional(),
  VERCEL_TEAM_ID: z.string().min(1).optional(),
  VERCEL_PROJECT_ID: z.string().min(1).optional(),
  LOCUS_API_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const result = serverSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    MORPHIC_PLANNER_MODEL: process.env.MORPHIC_PLANNER_MODEL,
    MORPHIC_CODEX_MODEL: process.env.MORPHIC_CODEX_MODEL,
    MORPHIC_PROMPT_VERSION: process.env.MORPHIC_PROMPT_VERSION,
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
    LOCUS_API_KEY: process.env.LOCUS_API_KEY,
  });

  if (!result.success) {
    throw new Error(
      `Invalid server configuration: ${z.prettifyError(result.error)}`,
    );
  }

  cached = result.data;
  return cached;
}
