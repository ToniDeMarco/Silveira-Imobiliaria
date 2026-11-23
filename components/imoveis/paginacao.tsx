import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filtrosParaQuery, type FiltrosImoveis } from "@/lib/filtros";

/** Ex.: atual=6, total=12 → [1, "…", 5, 6, 7, "…", 12] */
function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, total, atual - 1, atual, atual + 1]);
  const lista = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado: (number | "…")[] = [];
  lista.forEach((p, i) => {
    if (i > 0 && p - lista[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

export function Paginacao({
  filtros,
  totalPaginas,
}: {
  filtros: FiltrosImoveis;
  totalPaginas: number;
}) {
  if (totalPaginas <= 1) return null;
  const atual = filtros.pagina;
  const href = (pagina: number) => `/imoveis${filtrosParaQuery(filtros, { pagina })}`;
  const base = "grid h-11 min-w-11 place-items-center rounded-md px-3 text-sm font-semibold transition";

  return (
    <nav aria-label="Paginação" className="mt-12 flex items-center justify-center gap-1.5">
      {atual > 1 ? (
        <Link href={href(atual - 1)} aria-label="Página anterior" className={`${base} text-primary hover:bg-white`}>
          <ChevronLeft className="h-4.5 w-4.5" />
        </Link>
      ) : (
        <span className={`${base} text-ink/25`} aria-hidden="true">
          <ChevronLeft className="h-4.5 w-4.5" />
        </span>
      )}

      {paginasVisiveis(atual, totalPaginas).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink/40">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === atual ? "page" : undefined}
            className={`${base} ${
              p === atual ? "bg-primary text-white" : "text-primary hover:bg-white"
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {atual < totalPaginas ? (
        <Link href={href(atual + 1)} aria-label="Próxima página" className={`${base} text-primary hover:bg-white`}>
          <ChevronRight className="h-4.5 w-4.5" />
        </Link>
      ) : (
        <span className={`${base} text-ink/25`} aria-hidden="true">
          <ChevronRight className="h-4.5 w-4.5" />
        </span>
      )}
    </nav>
  );
}
