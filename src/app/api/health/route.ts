import { getDb } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    await getDb().execute(sql`SELECT 1`);
    return Response.json({
      status: "ok",
      service: "morphic",
      database: "connected",
      timestamp,
    });
  } catch {
    return Response.json(
      {
        status: "degraded",
        service: "morphic",
        database: "unreachable",
        timestamp,
      },
      { status: 503 },
    );
  }
}
