import { fetcher } from "@/helpers/fetcher";
import type { AuthResponse } from "@/types/auth.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(body: LoginPayload): Promise<AuthResponse> {
  return fetcher<AuthResponse>({
    url: "/auth/login",
    method: "POST",
    body,
  });
}

export default login;
