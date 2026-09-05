import { fetcher } from "@/helpers/fetcher";
import type { Workspace } from "@tatalaku/shared";

export interface CreateWorkspacePayload {
  name: string;
}

export interface CreateWorkspaceResponse {
  success: boolean;
  data: Workspace;
}

export async function createWorkspace(
  body: CreateWorkspacePayload,
): Promise<CreateWorkspaceResponse> {
  return fetcher<CreateWorkspaceResponse>({
    url: "/workspaces",
    method: "POST",
    body,
  });
}

export default createWorkspace;
