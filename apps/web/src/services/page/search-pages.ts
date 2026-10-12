import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface PageSearchResult extends Page {
  snippet: string | null;
}

export interface SearchPagesParams {
  workspaceId: string;
  q: string;
  limit?: number | undefined;
}

export interface SearchPagesResponse {
  success: boolean;
  data: PageSearchResult[];
}

export async function searchPages(params: SearchPagesParams): Promise<SearchPagesResponse> {
  const sp = new URLSearchParams();
  sp.set("workspaceId", params.workspaceId);
  sp.set("q", params.q);
  if (params.limit !== undefined) sp.set("limit", params.limit.toString());

  return fetcher<SearchPagesResponse>({
    url: `/pages/search?${sp.toString()}`,
    method: "GET",
  });
}

export default searchPages;
