import { fetcher } from "@/helpers/fetcher";

export interface ReorderPagesParams {
  workspaceId: string;
  parentPageId?: string | null | undefined;
  orderedIds: string[];
}

/** Persists a new sibling order (and optional reparent) for a set of pages. */
export async function reorderPages(params: ReorderPagesParams): Promise<void> {
  await fetcher<void>({
    url: `/pages/reorder`,
    method: "PATCH",
    body: {
      workspaceId: params.workspaceId,
      parentPageId: params.parentPageId ?? null,
      orderedIds: params.orderedIds,
    },
  });
}

export default reorderPages;
