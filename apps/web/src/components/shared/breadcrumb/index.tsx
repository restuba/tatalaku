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
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-muted ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-ink transition-colors"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`flex items-center gap-1 ${
                    isLast ? "font-medium text-ink" : "text-muted"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && <ChevronRightIcon size={12} className="text-muted/60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
