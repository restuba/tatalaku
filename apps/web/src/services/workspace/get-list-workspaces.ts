import { fetcher } from "@/helpers/fetcher";
import type { Workspace, PaginatedResponse } from "@tatalaku/shared";

export interface GetListWorkspacesParams {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface GetListWorkspacesResponse {
  success: boolean;
  data: Workspace[];
  meta: PaginatedResponse<Workspace>["meta"];
}

export async function getListWorkspaces(
  params?: GetListWorkspacesParams | undefined,
): Promise<GetListWorkspacesResponse> {
  const sp = new URLSearchParams();
  if (params?.page !== undefined) sp.set("page", params.page.toString());
  if (params?.limit !== undefined) sp.set("limit", params.limit.toString());
  const query = sp.toString();

  return fetcher<GetListWorkspacesResponse>({
    url: `/workspaces${query ? `?${query}` : ""}`,
    method: "GET",
  });
}

export default getListWorkspaces;
