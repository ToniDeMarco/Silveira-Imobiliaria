"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();
  return <NavLinksStatic pathname={pathname} />;
}

/** Versão sem hook (usada como fallback do Suspense). */
export function NavLinksStatic({ pathname = "" }: { pathname?: string }) {
  return (
    <ul className="flex items-center gap-1">
      {siteConfig.nav.map((item) => {
        const ativo = pathname !== "" && isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                ativo ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
              {ativo && (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-secondary-300" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
