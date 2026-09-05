import { fetcher } from "@/helpers/fetcher";
import type { Page, PaginatedResponse } from "@tatalaku/shared";

export interface GetListPagesParams {
  workspaceId: string;
  parentPageId?: string | null | undefined;
  includeArchived?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface GetListPagesResponse {
  success: boolean;
  data: Page[];
  meta: PaginatedResponse<Page>["meta"];
}

export async function getListPages(params: GetListPagesParams): Promise<GetListPagesResponse> {
  const sp = new URLSearchParams();
  sp.set("workspaceId", params.workspaceId);
  if (params.parentPageId !== undefined && params.parentPageId !== null) {
    sp.set("parentPageId", params.parentPageId);
  }
  if (params.includeArchived) {
    sp.set("includeArchived", "true");
  }
  if (params.page !== undefined) sp.set("page", params.page.toString());
  if (params.limit !== undefined) sp.set("limit", params.limit.toString());

  return fetcher<GetListPagesResponse>({
    url: `/pages?${sp.toString()}`,
    method: "GET",
  });
}

export default getListPages;
