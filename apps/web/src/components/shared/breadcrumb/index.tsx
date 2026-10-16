import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string | undefined;
  icon?: ReactNode | undefined;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string | undefined;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex min-w-0 items-center text-sm text-codex-muted ${className}`}
    >
      {/* Single line: long labels truncate instead of wrapping */}
      <ol className="flex min-w-0 items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className={`flex min-w-0 items-center gap-1 ${isLast ? "" : "shrink"}`}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex min-w-0 items-center gap-1.5 rounded-codex-sm px-1.5 py-0.5 transition-colors hover:text-codex-foreground"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="max-w-40 truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`flex min-w-0 items-center gap-1.5 px-1.5 py-0.5 ${
                    isLast ? "text-codex-foreground" : "text-codex-muted"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </span>
              )}

              {!isLast && <ChevronRightIcon size={12} className="shrink-0 text-codex-muted/60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
