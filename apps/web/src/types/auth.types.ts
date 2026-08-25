/** Local form value types for auth UI — not the same as the User entity from shared */

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

/** Shape of the auth API success response */
export interface AuthResponse {
  success: boolean;
  data: {
    user: import("@tatalaku/shared").User;
    accessToken: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}
