import Link from "next/link";
import { Suspense } from "react";
import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatTelefone, whatsappLink } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavLinks, NavLinksStatic } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { HeaderScroll } from "./header-scroll";

export function Header() {
  return (
    <header
      data-site-header
      className="sticky top-0 z-50 border-b border-white/10 bg-primary transition-shadow duration-300"
    >
      <HeaderScroll />
      <div className="container-site flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" aria-label={`${siteConfig.name} — página inicial`} className="shrink-0">
          <Logo tone="light" className="h-14 w-auto" />
        </Link>

        <nav className="hidden lg:block" aria-label="Menu principal">
          <Suspense fallback={<NavLinksStatic />}>
            <NavLinks />
          </Suspense>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={whatsappLink("Olá! Vim pelo site e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <Phone className="h-4 w-4 text-secondary-300" aria-hidden="true" />
            {formatTelefone(siteConfig.whatsapp)}
          </a>
          <Link
            href="/imoveis"
            className={buttonClasses({ variant: "secondary", size: "sm", className: "h-10 px-5" })}
          >
            Ver imóveis
          </Link>
        </div>

        <Suspense fallback={null}>
          <MobileMenu />
        </Suspense>
      </div>
    </header>
  );
}
