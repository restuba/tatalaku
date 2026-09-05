import { fetcher } from "@/helpers/fetcher";

export interface InviteMemberPayload {
  email: string;
}

export interface InviteMemberResponse {
  success: boolean;
  data: null;
  message: string;
}

export async function inviteMember(
  workspaceId: string,
  email: string,
): Promise<InviteMemberResponse> {
  return fetcher<InviteMemberResponse>({
    url: `/workspaces/${workspaceId}/invites`,
    method: "POST",
    body: { email },
  });
}

export default inviteMember;
