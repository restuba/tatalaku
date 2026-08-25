export default function PageLoading() {
  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 max-w-4xl mx-auto w-full animate-pulse">
      {/* Title Skeleton */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0" />
        <div className="h-10 w-3/4 max-w-lg bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      </div>

      {/* Editor Content Skeleton */}
      <div className="space-y-6">
        <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-md" />
        <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800/50 rounded-md" />
        <div className="h-4 w-4/6 bg-neutral-100 dark:bg-neutral-800/50 rounded-md" />
        <div className="py-4">
          <div className="h-32 w-full bg-neutral-100 dark:bg-neutral-800/30 rounded-xl" />
        </div>
        <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-md" />
        <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800/50 rounded-md" />
      </div>
    </div>
  );
}
