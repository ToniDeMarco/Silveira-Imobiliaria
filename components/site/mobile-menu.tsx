"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClasses } from "@/components/ui/button";

export function MobileMenu() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  // true somente no navegador (o painel é renderizado via portal no <body>,
  // pois o `backdrop-blur` do header prenderia um elemento `fixed` dentro dele).
  const noCliente = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Fecha o menu ao trocar de página.
  const [ultimoPath, setUltimoPath] = useState(pathname);
  if (pathname !== ultimoPath) {
    setUltimoPath(pathname);
    setAberto(false);
  }

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        className="grid h-11 w-11 place-items-center rounded-md text-white transition hover:bg-white/10"
      >
        {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {noCliente &&
        createPortal(
      <div
        id="menu-mobile"
        className={`fixed inset-x-0 top-[4.5rem] bottom-0 z-40 lg:hidden bg-surface/98 backdrop-blur transition-all duration-300 ${
          aberto ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="container-site flex h-full flex-col gap-2 py-8" aria-label="Menu principal">
          {siteConfig.nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAberto(false)}
              style={{ transitionDelay: aberto ? `${i * 50}ms` : "0ms" }}
              className={`border-b border-primary/10 py-4 font-serif text-3xl text-primary transition-all duration-300 ${
                aberto ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={whatsappLink("Olá! Vim pelo site e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ size: "lg", className: "mt-8 w-full" })}
          >
            <WhatsAppIcon className="h-5 w-5" />
            Falar no WhatsApp
          </a>
          <p className="mt-auto text-center text-xs text-ink/50">{siteConfig.creci}</p>
        </nav>
      </div>,
          document.body,
        )}
    </div>
  );
}
