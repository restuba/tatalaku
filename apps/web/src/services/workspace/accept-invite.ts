import { fetcher } from "@/helpers/fetcher";

export interface AcceptInviteResponse {
  success: boolean;
  data: null;
  message: string;
}

export async function acceptInvite(
  workspaceId: string,
  token: string,
): Promise<AcceptInviteResponse> {
  return fetcher<AcceptInviteResponse>({
    url: `/workspaces/${workspaceId}/invites/accept`,
    method: "POST",
    body: { token },
  });
}

export default acceptInvite;
