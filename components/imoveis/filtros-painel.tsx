"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/** No celular, os filtros ficam recolhidos atrás de um botão. No desktop, sempre visíveis. */
export function FiltrosPainel({ ativos, children }: { ativos: number; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="painel-filtros"
        className="flex w-full items-center justify-between bg-white px-5 py-4 font-semibold text-primary sombra-card ring-1 ring-primary/5 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
          Filtros
          {ativos > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1.5 text-xs text-primary-950">
              {ativos}
            </span>
          )}
        </span>
        {aberto && <X className="h-4.5 w-4.5" aria-hidden="true" />}
      </button>

      <div
        id="painel-filtros"
        className={`${aberto ? "mt-3 block" : "hidden"} bg-white p-6 sombra-card ring-1 ring-primary/5 lg:sticky lg:top-24 lg:mt-0 lg:block`}
      >
        <p className="mb-6 hidden font-serif text-xl text-primary lg:block">Filtrar imóveis</p>
        {children}
      </div>
    </div>
  );
}
