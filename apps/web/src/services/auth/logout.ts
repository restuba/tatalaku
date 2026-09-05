import { fetcher } from "@/helpers/fetcher";

export interface LogoutResponse {
  success: boolean;
  data: null;
}

export async function logout(): Promise<LogoutResponse> {
  return fetcher<LogoutResponse>({
    url: "/auth/logout",
    method: "POST",
  });
}

export default logout;
