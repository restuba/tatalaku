import { fetcher } from "@/helpers/fetcher";
import type { User } from "@tatalaku/shared";

export interface GetMeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export async function getMe(): Promise<GetMeResponse> {
  return fetcher<GetMeResponse>({
    url: "/auth/me",
    method: "GET",
  });
}

export default getMe;
