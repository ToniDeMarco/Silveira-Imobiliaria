"use client";

import { useEffect } from "react";

/**
 * Marca o cabeçalho com `data-scrolled` quando a página rola.
 * Na home (hero em tela cheia) o cabeçalho fica transparente sobre a foto
 * e ganha fundo ao rolar — ver regras `[data-site-header]` em globals.css.
 */
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    const atualizar = () => header.toggleAttribute("data-scrolled", window.scrollY > 24);
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    return () => window.removeEventListener("scroll", atualizar);
  }, []);
  return null;
}
