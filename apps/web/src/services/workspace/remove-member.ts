import { fetcher } from "@/helpers/fetcher";

export interface RemoveMemberResponse {
  success: boolean;
  data: null;
  message: string;
}

export async function removeMember(
  workspaceId: string,
  userId: string,
): Promise<RemoveMemberResponse> {
  return fetcher<RemoveMemberResponse>({
    url: `/workspaces/${workspaceId}/members/${userId}`,
    method: "DELETE",
  });
}

export default removeMember;
