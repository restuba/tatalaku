import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface GetPageTreeParams {
  workspaceId: string;
  /** `true` for Trash (archived pages), `false` for the sidebar tree */
  archived?: boolean | undefined;
}

export interface GetPageTreeResponse {
  success: boolean;
  /** Every matching page, sorted by order. `content` is always null here. */
  data: Page[];
}

/** Loads all pages of a workspace (no pagination, no content). */
export async function getPageTree(params: GetPageTreeParams): Promise<GetPageTreeResponse> {
  const sp = new URLSearchParams();
  sp.set("workspaceId", params.workspaceId);
  if (params.archived) sp.set("archived", "true");

  return fetcher<GetPageTreeResponse>({
    url: `/pages/tree?${sp.toString()}`,
    method: "GET",
  });
}

export default getPageTree;
