import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { formatPreco } from "@/lib/format";
import { FINALIDADE_LABEL, TIPO_LABEL, type ImovelCard as ImovelCardData } from "@/types/imovel";
import { FotoPlaceholder } from "./foto-placeholder";
import { ImovelSpecsInline } from "./imovel-specs";

export function ImovelCard({ imovel }: { imovel: ImovelCardData }) {
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
  const href = `/imoveis/${imovel.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(16,24,20,0.04),0_8px_24px_-12px_rgba(16,24,20,0.12)] ring-1 ring-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(16,24,20,0.04),0_20px_40px_-16px_rgba(16,24,20,0.22)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary-100">
        {imovel.capa ? (
          <Image
            src={imovel.capa.url_thumb}
            alt={imovel.titulo}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <FotoPlaceholder />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            {FINALIDADE_LABEL[imovel.finalidade]}
          </span>
          {imovel.destaque && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary-950 shadow-sm">
              Destaque
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold tracking-wide text-secondary-700 uppercase">
            {TIPO_LABEL[imovel.tipo]}
          </span>
          <span className="text-ink/40">{imovel.codigo}</span>
        </div>

        <h3 className="font-serif text-xl leading-snug text-primary">
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
            {imovel.titulo}
          </Link>
        </h3>

        {local && (
          <p className="-mt-1 flex items-center gap-1.5 text-sm text-ink/55">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {local}
          </p>
        )}

        <ImovelSpecsInline imovel={imovel} />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-primary/5 pt-4">
          <div>
            <p className="text-[0.7rem] font-medium text-ink/45 uppercase">
              {imovel.finalidade === "aluguel" ? "Aluguel" : "Valor"}
            </p>
            <p className="text-xl font-bold text-primary">
              {formatPreco(imovel.preco)}
              {imovel.finalidade === "aluguel" && imovel.preco ? (
                <span className="text-sm font-medium text-ink/50">/mês</span>
              ) : null}
            </p>
          </div>
          <span
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:rotate-45"
            aria-hidden="true"
          >
            <ArrowUpRight className="h-4.5 w-4.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function ImovelGrid({
  imoveis,
  colunas = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  imoveis: ImovelCardData[];
  colunas?: string;
}) {
  return (
    <div className={`grid gap-6 ${colunas}`}>
      {imoveis.map((imovel) => (
        <ImovelCard key={imovel.id} imovel={imovel} />
      ))}
    </div>
  );
}

export function ImovelGridSkeleton({
  quantidade = 6,
  colunas = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  quantidade?: number;
  colunas?: string;
}) {
  return (
    <div className={`grid gap-6 ${colunas}`} aria-hidden="true">
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl bg-white ring-1 ring-primary/5">
          <div className="aspect-[4/3] animate-pulse bg-secondary-100" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-secondary-100" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-secondary-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary-100" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-secondary-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
