export function GET() {
  return Response.json({
    status: "ok",
    service: "morphic",
    timestamp: new Date().toISOString(),
  });
}
