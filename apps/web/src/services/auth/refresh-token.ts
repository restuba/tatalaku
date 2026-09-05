import { performTokenRefresh } from "@/helpers/fetcher";

export async function refreshToken(): Promise<string | null> {
  return performTokenRefresh();
}

export default refreshToken;
