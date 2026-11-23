import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Building2, ChevronLeft, ChevronRight, ImageOff, Plus, Search, Star } from "lucide-react";
import { listarImoveisAdmin, parseFiltroAdmin, type FiltroAdmin } from "@/lib/data/admin";
import { formatData, formatPreco } from "@/lib/format";
import { FINALIDADE_LABEL, STATUS, STATUS_LABEL, TIPO_LABEL } from "@/types/imovel";
import { buttonClasses } from "@/components/ui/button";
import { AdminTitulo, SkeletonTabela } from "@/components/admin/ui";
import { ImovelAcoes, StatusSelect } from "@/components/admin/imovel-acoes";

export const metadata: Metadata = { title: "Imóveis" };

export default function AdminImoveisPage({ searchParams }: PageProps<"/admin/imoveis">) {
  return (
    <>
      <AdminTitulo
        titulo="Imóveis"
        descricao="Cadastre, edite e publique os imóveis do site."
        acoes={
          <Link href="/admin/imoveis/novo" className={buttonClasses()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo imóvel
          </Link>
        }
      />
      <Suspense fallback={<SkeletonTabela />}>
        {searchParams.then((sp) => (
          <Lista filtro={parseFiltroAdmin(sp)} />
        ))}
      </Suspense>
    </>
  );
}

function hrefFiltro(f: FiltroAdmin, alteracoes: Partial<FiltroAdmin>) {
  const v = { ...f, ...alteracoes };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.status) p.set("status", v.status);
  if (v.pagina > 1) p.set("pagina", String(v.pagina));
  const qs = p.toString();
  return `/admin/imoveis${qs ? `?${qs}` : ""}`;
}

async function Lista({ filtro }: { filtro: FiltroAdmin }) {
  const { itens, total, totalPaginas } = await listarImoveisAdmin(filtro);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Form action="/admin/imoveis" className="flex w-full max-w-md gap-2" key={filtro.q ?? ""}>
          {filtro.status && <input type="hidden" name="status" value={filtro.status} />}
          <label className="relative flex-1">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              name="q"
              defaultValue={filtro.q}
              placeholder="Buscar por título, código ou bairro"
              className="h-11 w-full rounded-md border border-primary/10 bg-white pr-4 pl-10 text-sm outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
            />
          </label>
          <button type="submit" className={buttonClasses({ variant: "outline" })}>
            Buscar
          </button>
        </Form>

        <nav aria-label="Filtrar por status" className="flex flex-wrap gap-1.5">
          {[undefined, ...STATUS].map((s) => {
            const ativo = filtro.status === s;
            return (
              <Link
                key={s ?? "todos"}
                href={hrefFiltro(filtro, { status: s, pagina: 1 })}
                aria-current={ativo ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                  ativo ? "bg-primary text-white" : "bg-white text-ink/65 ring-1 ring-primary/10 hover:text-primary"
                }`}
              >
                {s ? STATUS_LABEL[s] : "Todos"}
              </Link>
            );
          })}
        </nav>
      </div>

      <p className="mb-3 text-sm text-ink/55">
        {total} {total === 1 ? "imóvel" : "imóveis"}
        {filtro.q && <> para “{filtro.q}”</>}
      </p>

      {itens.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/15 bg-white/60 px-6 py-16 text-center">
          <Building2 className="mx-auto h-10 w-10 text-secondary-600" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 font-serif text-xl text-primary">Nenhum imóvel encontrado</p>
          <Link href="/admin/imoveis/novo" className={buttonClasses({ className: "mt-6" })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Cadastrar imóvel
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {itens.map((imovel) => {
            const capa =
              [...imovel.fotos_imovel].sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem)[0] ?? null;
            return (
              <li
                key={imovel.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-primary/5 sm:flex-row sm:items-center sm:gap-4"
              >
                <Link href={`/admin/imoveis/${imovel.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary-100">
                    {capa ? (
                      <Image src={capa.url_thumb} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto h-5 w-5 text-ink/25" aria-label="Sem fotos" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-xs text-ink/50">
                      <span className="font-semibold text-secondary-700">{imovel.codigo}</span>
                      {TIPO_LABEL[imovel.tipo]} · {FINALIDADE_LABEL[imovel.finalidade]}
                      {imovel.destaque && <Star className="h-3.5 w-3.5 fill-secondary-400 text-secondary-500" aria-label="Destaque" />}
                    </span>
                    <span className="block truncate font-semibold text-primary">{imovel.titulo}</span>
                    <span className="block text-xs text-ink/50">
                      {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
                      {" · "}Atualizado em {formatData(imovel.updated_at)}
                    </span>
                  </span>
                </Link>
                <div className="flex items-center justify-between gap-4 border-t border-primary/5 pt-3 sm:border-0 sm:pt-0">
                  <span className="text-sm font-bold whitespace-nowrap text-primary">{formatPreco(imovel.preco)}</span>
                  <StatusSelect id={imovel.id} status={imovel.status} />
                  <ImovelAcoes
                    id={imovel.id}
                    codigo={imovel.codigo}
                    titulo={imovel.titulo}
                    slug={imovel.slug}
                    publicado={imovel.status === "publicado"}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-3 text-sm">
          {filtro.pagina > 1 && (
            <Link href={hrefFiltro(filtro, { pagina: filtro.pagina - 1 })} className={buttonClasses({ variant: "outline", size: "sm" })}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Anterior
            </Link>
          )}
          <span className="text-ink/55">
            Página {filtro.pagina} de {totalPaginas}
          </span>
          {filtro.pagina < totalPaginas && (
            <Link href={hrefFiltro(filtro, { pagina: filtro.pagina + 1 })} className={buttonClasses({ variant: "outline", size: "sm" })}>
              Próxima <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
