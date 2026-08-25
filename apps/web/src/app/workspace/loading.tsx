export default function WorkspaceLoading() {
  return (
    <div className="flex flex-col flex-1 p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800/50 rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20"
          >
            <div className="p-5 flex flex-col h-full justify-between">
              <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
