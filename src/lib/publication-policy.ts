export function assertPublishablePaths(paths: string[]) {
  for (const path of paths) {
    if (
      !path ||
      path.startsWith("/") ||
      path === ".." ||
      path.startsWith("../") ||
      path.includes("/../") ||
      path.includes("\0")
    ) {
      throw new Error(
        `Publication was blocked because the diff contains an invalid repository path: ${JSON.stringify(path)}.`,
      );
    }
  }
  return paths;
}
