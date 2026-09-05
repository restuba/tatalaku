import { fetcher } from "@/helpers/fetcher";

export interface DeleteWorkspaceResponse {
  success: boolean;
  data: null;
}

export async function deleteWorkspace(id: string): Promise<DeleteWorkspaceResponse> {
  return fetcher<DeleteWorkspaceResponse>({
    url: `/workspaces/${id}`,
    method: "DELETE",
  });
}

export default deleteWorkspace;
