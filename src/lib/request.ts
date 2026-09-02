import { AppError } from "@/lib/errors";

export async function parseJsonBody(request: Request): Promise<unknown> {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLocaleLowerCase();
  const isJson =
    mediaType === "application/json" ||
    Boolean(
      mediaType?.startsWith("application/") && mediaType.endsWith("+json"),
    );
  if (!isJson) {
    throw new AppError(
      "The request body must use a JSON content type.",
      415,
      "unsupported_media_type",
    );
  }

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
