import { AppError } from "@/lib/errors";

const MAX_JSON_BODY_BYTES = 256 * 1_024;

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
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_JSON_BODY_BYTES) {
      throw new AppError(
        "The request body is too large.",
        413,
        "payload_too_large",
      );
    }
    return JSON.parse(body) as unknown;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "The request body must be valid JSON.",
      400,
      "invalid_json",
    );
  }
}
