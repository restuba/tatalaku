export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WORKSPACE: "/workspace",
  INVITE: "/invite",
  DESIGN_TOKENS: "/design-tokens",
} as const;

export interface NavItem {
  key: string;
  label: string;
  href?: string | undefined;
  icon?: string | undefined;
  badge?: string | number | undefined;
}
