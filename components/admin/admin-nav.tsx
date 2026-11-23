"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ExternalLink, LayoutDashboard, Plus, Users } from "lucide-react";

const ITENS = [
  { href: "/admin", label: "Visão geral", Icon: LayoutDashboard, exato: true },
  { href: "/admin/imoveis", label: "Imóveis", Icon: Building2, exato: false },
  { href: "/admin/imoveis/novo", label: "Novo imóvel", Icon: Plus, exato: true },
  { href: "/admin/leads", label: "Leads", Icon: Users, exato: false },
];

export function AdminNav() {
  const pathname = usePathname();
  const ativo = (href: string, exato: boolean) =>
    exato
      ? pathname === href
      : pathname.startsWith(href) && pathname !== "/admin/imoveis/novo";

  return (
    <nav aria-label="Menu do painel" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITENS.map(({ href, label, Icon, exato }) => {
        const a = ativo(href, exato);
        return (
          <Link
            key={href}
            href={href}
            aria-current={a ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              a ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white lg:mt-4"
      >
        <ExternalLink className="h-4.5 w-4.5" aria-hidden="true" />
        Ver site
      </a>
    </nav>
  );
}
