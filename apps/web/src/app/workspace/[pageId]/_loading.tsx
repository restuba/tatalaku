export default function PageLoading() {
  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 max-w-4xl mx-auto w-full animate-pulse">
      {/* Title Skeleton */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-codex-xl bg-codex-sidebar dark:bg-codex-sidebar shrink-0" />
        <div className="h-10 w-3/4 max-w-lg bg-codex-sidebar dark:bg-codex-sidebar rounded-codex-lg" />
      </div>

      {/* Editor Content Skeleton */}
      <div className="space-y-6">
        <div className="h-4 w-full bg-codex-sidebar dark:bg-codex-sidebar/50 rounded-codex-md" />
        <div className="h-4 w-5/6 bg-codex-sidebar dark:bg-codex-sidebar/50 rounded-codex-md" />
        <div className="h-4 w-4/6 bg-codex-sidebar dark:bg-codex-sidebar/50 rounded-codex-md" />
        <div className="py-4">
          <div className="h-32 w-full bg-codex-sidebar dark:bg-codex-sidebar/30 rounded-codex-xl" />
        </div>
        <div className="h-4 w-full bg-codex-sidebar dark:bg-codex-sidebar/50 rounded-codex-md" />
        <div className="h-4 w-2/3 bg-codex-sidebar dark:bg-codex-sidebar/50 rounded-codex-md" />
      </div>
    </div>
  );
}
