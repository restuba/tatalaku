import { fetcher } from "@/helpers/fetcher";
import type { AuthResponse } from "@/types/auth.types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function register(body: RegisterPayload): Promise<AuthResponse> {
  return fetcher<AuthResponse>({
    url: "/auth/register",
    method: "POST",
    body,
  });
}

export default register;
