import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buscarImoveis, getOpcoesFiltro } from "@/lib/data/imoveis";
import {
  contarFiltrosAtivos,
  filtrosParaQuery,
  parseFiltros,
  type FiltrosImoveis,
} from "@/lib/filtros";
import { formatPreco, whatsappLink } from "@/lib/format";
import { FINALIDADE_LABEL, TIPO_LABEL } from "@/types/imovel";
import { PageHeader } from "@/components/site/page-header";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { ImovelGrid, ImovelGridSkeleton } from "@/components/imoveis/imovel-card";
import { FiltrosForm } from "@/components/imoveis/filtros-form";
import { FiltrosPainel } from "@/components/imoveis/filtros-painel";
import { OrdenacaoSelect } from "@/components/imoveis/ordenacao-select";
import { Paginacao } from "@/components/imoveis/paginacao";

export const metadata: Metadata = {
  title: `Imóveis à venda e para alugar em ${siteConfig.city}`,
  description: `Encontre casas, apartamentos, terrenos, imóveis comerciais, chácaras e imóveis rurais à venda e para alugar em ${siteConfig.region}.`,
  alternates: { canonical: "/imoveis" },
};

export default function ImoveisPage({ searchParams }: PageProps<"/imoveis">) {
  return (
    <>
      <PageHeader
        eyebrow="Nossos imóveis"
        title="Encontre o seu próximo imóvel"
        description={`Imóveis à venda e para alugar em ${siteConfig.region}. Use os filtros para refinar a busca.`}
        breadcrumb={[{ label: "Imóveis" }]}
      />
      <div className="container-site grid items-start gap-8 lg:grid-cols-[18.5rem_1fr]">
        <aside>
          <Suspense fallback={<div className="h-14 animate-pulse bg-white lg:h-[42rem]" />}>
            <Filtros searchParams={searchParams} />
          </Suspense>
        </aside>
        <section aria-label="Resultados da busca">
          <Suspense fallback={<ResultadosSkeleton />}>
            <Resultados searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </>
  );
}

const COLUNAS = "sm:grid-cols-2 xl:grid-cols-3";

type SP = PageProps<"/imoveis">["searchParams"];

async function Filtros({ searchParams }: { searchParams: SP }) {
  const [filtros, opcoes] = await Promise.all([
    searchParams.then(parseFiltros),
    getOpcoesFiltro(),
  ]);
  return (
    <FiltrosPainel ativos={contarFiltrosAtivos(filtros)}>
      <FiltrosForm filtros={filtros} opcoes={opcoes} />
    </FiltrosPainel>
  );
}

async function Resultados({ searchParams }: { searchParams: SP }) {
  const filtros = parseFiltros(await searchParams);
  const { itens, total, totalPaginas } = await buscarImoveis(filtros);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink/60" aria-live="polite">
          <strong className="text-lg font-bold text-primary">{total}</strong>{" "}
          {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        <OrdenacaoSelect filtros={filtros} />
      </div>

      <FiltrosAtivos filtros={filtros} />

      {itens.length > 0 ? (
        <>
          <ImovelGrid imoveis={itens} colunas={COLUNAS} />
          <Paginacao filtros={filtros} totalPaginas={totalPaginas} />
        </>
      ) : (
        <div className="border border-dashed border-primary/15 bg-white/60 px-6 py-16 text-center">
          <SearchX className="mx-auto h-10 w-10 text-secondary-600" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 font-serif text-2xl text-primary">Nenhum imóvel encontrado</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            Tente ajustar os filtros ou fale com a gente: muitas oportunidades chegam antes de serem
            anunciadas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/imoveis" className={buttonClasses({ variant: "outline" })}>
              Limpar filtros
            </Link>
            <a
              href={whatsappLink("Olá! Não encontrei o imóvel que procuro no site. Podem me ajudar?")}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses()}
            >
              <WhatsAppIcon className="h-4.5 w-4.5" />
              Pedir ajuda no WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function FiltrosAtivos({ filtros }: { filtros: FiltrosImoveis }) {
  const chips: { label: string; remover: Partial<FiltrosImoveis> }[] = [];
  if (filtros.finalidade) chips.push({ label: FINALIDADE_LABEL[filtros.finalidade], remover: { finalidade: undefined } });
  if (filtros.tipo) chips.push({ label: TIPO_LABEL[filtros.tipo], remover: { tipo: undefined } });
  if (filtros.cidade) chips.push({ label: filtros.cidade, remover: { cidade: undefined } });
  if (filtros.bairro) chips.push({ label: filtros.bairro, remover: { bairro: undefined } });
  if (filtros.precoMin !== undefined) chips.push({ label: `A partir de ${formatPreco(filtros.precoMin)}`, remover: { precoMin: undefined } });
  if (filtros.precoMax !== undefined) chips.push({ label: `Até ${formatPreco(filtros.precoMax)}`, remover: { precoMax: undefined } });
  if (filtros.quartos) chips.push({ label: `${filtros.quartos}+ quartos`, remover: { quartos: undefined } });
  if (filtros.vagas) chips.push({ label: `${filtros.vagas}+ vagas`, remover: { vagas: undefined } });

  if (chips.length === 0) return null;

  return (
    <ul className="mb-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <li key={c.label}>
          <Link
            href={`/imoveis${filtrosParaQuery(filtros, { ...c.remover, pagina: 1 })}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 py-1.5 pr-2.5 pl-3.5 text-sm font-medium text-primary-800 ring-1 ring-secondary-200 transition hover:bg-secondary-200"
            aria-label={`Remover filtro ${c.label}`}
          >
            {c.label}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ResultadosSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-secondary-100" />
        <div className="h-10 w-44 animate-pulse rounded-full bg-secondary-100" />
      </div>
      <ImovelGridSkeleton colunas={COLUNAS} />
    </>
  );
}
