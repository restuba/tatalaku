import { fetcher } from "@/helpers/fetcher";
import type { Workspace } from "@tatalaku/shared";

export interface GetWorkspaceResponse {
  success: boolean;
  data: Workspace;
}

export async function getWorkspace(id: string): Promise<GetWorkspaceResponse> {
  return fetcher<GetWorkspaceResponse>({
    url: `/workspaces/${id}`,
    method: "GET",
  });
}

export default getWorkspace;
