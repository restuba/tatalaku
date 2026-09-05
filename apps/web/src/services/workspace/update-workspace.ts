import { fetcher } from "@/helpers/fetcher";
import type { Workspace } from "@tatalaku/shared";

export interface UpdateWorkspacePayload {
  name: string;
}

export interface UpdateWorkspaceResponse {
  success: boolean;
  data: Workspace;
}

export async function updateWorkspace(
  id: string,
  body: UpdateWorkspacePayload,
): Promise<UpdateWorkspaceResponse> {
  return fetcher<UpdateWorkspaceResponse>({
    url: `/workspaces/${id}`,
    method: "PATCH",
    body,
  });
}

export default updateWorkspace;
