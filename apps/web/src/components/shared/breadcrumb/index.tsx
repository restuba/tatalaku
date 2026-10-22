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

  // On narrow screens only the last two crumbs (parent + current) are useful;
  // a workspace name shrunk to "S…" is just noise. Everything before them
  // collapses to a single ellipsis below sm, and the full trail returns from sm.
  const collapseFrom = items.length - 2;
  const hasCollapsed = collapseFrom > 0;

  return (
    <nav aria-label="Breadcrumb" className={`flex min-w-0 items-center text-sm ${className}`}>
      {/* Single line: long labels truncate instead of wrapping */}
      <ol className="flex min-w-0 items-center gap-0.5">
        {hasCollapsed && (
          <li aria-hidden="true" className="flex items-center gap-0.5 sm:hidden">
            <span className="flex h-7 items-center px-1.5 text-codex-muted">…</span>
            <ChevronRightIcon size={12} aria-hidden="true" className="shrink-0 text-codex-faint" />
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          // Hidden on phones when it sits before the last two crumbs
          const collapsed = hasCollapsed && index < collapseFrom;

          return (
            <li
              key={index}
              className={`${collapsed ? "hidden sm:flex" : "flex"} min-w-0 items-center gap-0.5 ${
                isLast ? "" : "shrink"
              }`}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex h-7 min-w-0 items-center gap-1.5 rounded-codex-md px-1.5 text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground"
                >
                  {item.icon && <span className="flex shrink-0 leading-none">{item.icon}</span>}
                  <span className="max-w-40 truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`flex h-7 min-w-0 items-center gap-1.5 px-1.5 ${
                    isLast ? "text-codex-foreground" : "text-codex-muted"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <span className="flex shrink-0 leading-none">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </span>
              )}

              {!isLast && (
                <ChevronRightIcon
                  size={12}
                  aria-hidden="true"
                  className="shrink-0 text-codex-faint"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
