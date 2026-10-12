"use client";

import { WorkspaceContentSkeleton } from "./_components/workspace-skeleton";

// Route-level Suspense fallback: rendered inside the layout's <main>,
// where the real sidebar is already visible — so content skeleton only.
export default function WorkspaceLoading() {
  return <WorkspaceContentSkeleton />;
}
