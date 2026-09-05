import { fetcher } from "@/helpers/fetcher";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "owner" | "member";
}

export interface GetMembersResponse {
  success: boolean;
  data: WorkspaceMember[];
}

export async function getMembers(workspaceId: string): Promise<GetMembersResponse> {
  return fetcher<GetMembersResponse>({
    url: `/workspaces/${workspaceId}/members`,
    method: "GET",
  });
}

export default getMembers;
