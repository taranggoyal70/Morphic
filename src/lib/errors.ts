import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "The request contains invalid data.",
          details: { fields: error.flatten().fieldErrors },
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (error instanceof AppError) {
    const headers = new Headers({ "Cache-Control": "no-store" });
    const resetAt = error.details?.resetAt;
    if (
      error.status === 429 &&
      typeof resetAt === "number" &&
      Number.isFinite(resetAt)
    ) {
      headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1_000))),
      );
    }
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      {
        status: error.status,
        headers,
      },
    );
  }

  console.error("Unhandled request error", error);
  return Response.json(
    {
      error: {
        code: "internal_error",
        message: "Something went wrong. Please try again.",
      },
    },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}
