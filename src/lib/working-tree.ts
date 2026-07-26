function normalizeStatus(status: string) {
  return status
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .sort()
    .join("\n");
}

export function didWorkingTreeChange(before: string, after: string) {
  return normalizeStatus(before) !== normalizeStatus(after);
}
