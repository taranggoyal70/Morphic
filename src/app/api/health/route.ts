import { getDb } from "@/db";
import { authenticationReadiness } from "@/lib/deployment-readiness";
import { sql } from "drizzle-orm";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const timestamp = new Date().toISOString();
  const authentication = authenticationReadiness({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  try {
    await getDb().execute(sql`SELECT 1`);
    return Response.json(
      {
        status: "ok",
        service: "morphic",
        database: "connected",
        authentication,
        timestamp,
      },
      { headers },
    );
  } catch {
    return Response.json(
      {
        status: "degraded",
        service: "morphic",
        database: "unreachable",
        authentication,
        timestamp,
      },
      { status: 503, headers },
    );
  }
}
