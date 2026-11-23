import type { ReactNode } from "react";
import { STATUS_LABEL, type StatusImovel } from "@/types/imovel";

export function AdminTitulo({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl text-primary">{titulo}</h1>
        {descricao && <p className="mt-1.5 text-sm text-ink/60">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

export const STATUS_CORES: Record<StatusImovel, string> = {
  publicado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rascunho: "bg-stone-100 text-stone-600 ring-stone-200",
  vendido: "bg-sky-50 text-sky-700 ring-sky-200",
  alugado: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function StatusBadge({ status }: { status: StatusImovel }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_CORES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-primary/5 ${className}`}>{children}</div>;
}

export function SkeletonTabela() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}
