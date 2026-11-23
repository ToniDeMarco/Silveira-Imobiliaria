"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ORDENS, ORDEM_LABEL, filtrosParaQuery, type FiltrosImoveis, type Ordem } from "@/lib/filtros";

export function OrdenacaoSelect({ filtros }: { filtros: FiltrosImoveis }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-ink/60">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        value={filtros.ordem}
        disabled={pendente}
        onChange={(e) => {
          const ordem = e.target.value as Ordem;
          startTransition(() =>
            router.push(`/imoveis${filtrosParaQuery(filtros, { ordem, pagina: 1 })}`, { scroll: false }),
          );
        }}
        className="h-10 cursor-pointer rounded-md border border-primary/10 bg-white pr-8 pl-4 font-semibold text-primary outline-none focus:border-secondary-500 disabled:opacity-60"
      >
        {ORDENS.map((o) => (
          <option key={o} value={o}>
            {ORDEM_LABEL[o]}
          </option>
        ))}
      </select>
    </label>
  );
}
