import type { ReactNode } from "react";

export type TabVariant = "standard" | "fullWidth";

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode | undefined;
  disabled?: boolean | undefined;
}

export interface TabsProps {
  items: TabItem[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  variant?: TabVariant | undefined;
  centered?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
}

export interface TabPanelProps {
  value: string;
  className?: string | undefined;
  children?: ReactNode | undefined;
}
