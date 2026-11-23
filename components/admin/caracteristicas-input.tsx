"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const SUGESTOES = [
  "Piscina",
  "Churrasqueira",
  "Área gourmet",
  "Cozinha planejada",
  "Armários embutidos",
  "Quintal",
  "Varanda",
  "Ar-condicionado",
  "Energia solar",
  "Portão eletrônico",
  "Cerca elétrica",
  "Mobiliado",
  "Elevador",
  "Portaria 24h",
  "Escriturado",
  "Poço artesiano",
];

export function CaracteristicasInput({
  valor,
  onChange,
}: {
  valor: string[];
  onChange: (v: string[]) => void;
}) {
  const [texto, setTexto] = useState("");

  const adicionar = (item: string) => {
    const limpo = item.trim();
    if (!limpo) return;
    if (!valor.some((v) => v.toLowerCase() === limpo.toLowerCase())) onChange([...valor, limpo]);
    setTexto("");
  };

  const sugestoes = SUGESTOES.filter((s) => !valor.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      {valor.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {valor.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1 rounded-full bg-primary py-1 pr-1.5 pl-3 text-sm font-medium text-white"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(valor.filter((v) => v !== item))}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/20"
                aria-label={`Remover ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              adicionar(texto);
            }
          }}
          placeholder="Digite e pressione Enter (ex.: Piscina)"
          maxLength={60}
          aria-label="Nova característica"
          className="h-11 flex-1 rounded-xl border border-primary/10 bg-white px-3.5 text-sm outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
        />
        <button
          type="button"
          onClick={() => adicionar(texto)}
          className="grid h-11 w-11 place-items-center rounded-xl bg-secondary-100 text-primary transition hover:bg-secondary-200"
          aria-label="Adicionar característica"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>

      {sugestoes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-xs text-ink/45">Sugestões:</span>
          {sugestoes.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => adicionar(s)}
              className="rounded-md border border-dashed border-primary/20 px-2.5 py-1 text-xs text-ink/60 transition hover:border-primary/40 hover:text-primary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
