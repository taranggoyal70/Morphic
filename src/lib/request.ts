import { AppError } from "@/lib/errors";

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError(
      "The request body must be valid JSON.",
      400,
      "invalid_json",
    );
  }
}
