import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";

export default function WorkspaceLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink">
      <div className="text-center">
        <SparkleIcon
          size={30}
          weight="fill"
          className="mx-auto animate-pulse text-violet-light"
        />
        <p className="mt-4 text-sm text-muted">Loading workspace evidence…</p>
      </div>
    </main>
  );
}
