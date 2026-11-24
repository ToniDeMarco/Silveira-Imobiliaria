import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import {
  Bath,
  BedDouble,
  Car,
  Check,
  ChevronRight,
  Hash,
  LandPlot,
  MapPin,
  Ruler,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  getImoveisSemelhantes,
  getImovelPorSlug,
  getSlugAtualPorCodigo,
  getSlugsPublicados,
} from "@/lib/data/imoveis";
import { formatArea, formatPreco, whatsappLink } from "@/lib/format";
import { capaDoImovel, descricaoCurta, jsonLdImovel, serializarJsonLd, urlAbsoluta } from "@/lib/seo";
import { FINALIDADE_LABEL, TIPO_LABEL, TIPO_LABEL_PLURAL, type ImovelComFotos } from "@/types/imovel";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Galeria } from "@/components/imoveis/galeria";
import { LeadForm } from "@/components/imoveis/lead-form";
import { ImovelGrid, ImovelGridSkeleton } from "@/components/imoveis/imovel-card";
import { SectionHeading } from "@/components/ui/eyebrow";

/** Slug usado só para validar a rota no build quando ainda não há imóveis publicados. */
const PLACEHOLDER = "__sem-imoveis__";

export async function generateStaticParams() {
  const slugs = await getSlugsPublicados();
  // Com Cache Components é obrigatório retornar ao menos 1 parâmetro.
  // Os demais imóveis são gerados na primeira visita e ficam em cache (ISR).
  return slugs.length ? slugs.slice(0, 200).map(({ slug }) => ({ slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/imoveis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const imovel = await getImovelPorSlug(slug);
  if (!imovel) return { title: "Imóvel não encontrado", robots: { index: false } };

  const capa = capaDoImovel(imovel);
  const titulo = `${imovel.titulo} - ${imovel.codigo}`;
  const descricao = descricaoCurta(imovel);
  const caminho = `/imoveis/${imovel.slug}`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: siteConfig.name,
      url: urlAbsoluta(caminho),
      title: titulo,
      description: descricao,
      images: capa ? [{ url: capa.url, alt: imovel.titulo }] : undefined,
    },
    twitter: {
      card: capa ? "summary_large_image" : "summary",
      title: titulo,
      description: descricao,
      images: capa ? [capa.url] : undefined,
    },
  };
}

export default function ImovelPage({ params }: PageProps<"/imoveis/[slug]">) {
  return (
    <Suspense fallback={<ImovelSkeleton />}>
      <ImovelConteudo params={params} />
    </Suspense>
  );
}

async function ImovelConteudo({ params }: { params: PageProps<"/imoveis/[slug]">["params"] }) {
  const { slug } = await params;
  const imovel = await getImovelPorSlug(slug);

  if (!imovel) {
    // O slug muda quando o título muda; links antigos são redirecionados pelo código (…-im0001).
    const codigo = slug.match(/-(im\d{4,})$/i)?.[1];
    const slugAtual = codigo ? await getSlugAtualPorCodigo(codigo) : null;
    if (slugAtual && slugAtual !== slug) permanentRedirect(`/imoveis/${slugAtual}`);
    notFound();
  }

  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
  const msgWhatsApp = `Olá! Tenho interesse no imóvel ${imovel.codigo} - ${imovel.titulo}. ${urlAbsoluta(`/imoveis/${imovel.slug}`)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLdImovel(imovel)) }}
      />

      <div className="container-site pt-8 sm:pt-10">
        <nav aria-label="Você está em" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink/50">
            <li>
              <Link href="/" className="hover:text-primary">Início</Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link href="/imoveis" className="hover:text-primary">Imóveis</Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link href={`/imoveis?tipo=${imovel.tipo}`} className="hover:text-primary">
                {TIPO_LABEL_PLURAL[imovel.tipo]}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span aria-current="page" className="text-ink/70">{imovel.codigo}</span>
            </li>
          </ol>
        </nav>

        <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                {FINALIDADE_LABEL[imovel.finalidade]}
              </span>
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-primary-800 ring-1 ring-secondary-200">
                {TIPO_LABEL[imovel.tipo]}
              </span>
              {imovel.destaque && (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary-950">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> Destaque
                </span>
              )}
            </div>
            <h1 className="mt-4 max-w-3xl text-left text-3xl leading-tight text-balance text-primary sm:text-[2.6rem]">
              {imovel.titulo}
            </h1>
            {local && (
              <p className="mt-3 flex items-center gap-2 text-ink/60">
                <MapPin className="h-4.5 w-4.5 text-secondary-600" aria-hidden="true" />
                {local} - {siteConfig.state}
              </p>
            )}
          </div>
          <div className="lg:text-right">
            <p className="text-sm text-ink/50">
              {imovel.finalidade === "aluguel" ? "Valor do aluguel" : "Valor de venda"}
            </p>
            <p className="text-3xl font-bold text-primary sm:text-4xl">
              {formatPreco(imovel.preco)}
              {imovel.finalidade === "aluguel" && imovel.preco ? (
                <span className="text-lg font-medium text-ink/50">/mês</span>
              ) : null}
            </p>
          </div>
        </header>

        <Galeria fotos={imovel.fotos} titulo={imovel.titulo} />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="space-y-12">
            <Especificacoes imovel={imovel} />

            {imovel.descricao && (
              <section>
                <h2 className="text-2xl text-primary">Sobre o imóvel</h2>
                <div className="mt-4 space-y-4 leading-relaxed whitespace-pre-line text-ink/75">
                  {imovel.descricao}
                </div>
              </section>
            )}

            {imovel.caracteristicas.length > 0 && (
              <section>
                <h2 className="text-2xl text-primary">Características</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {imovel.caracteristicas.map((c) => (
                    <li key={c} className="flex items-center gap-3 text-ink/80">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Localizacao imovel={imovel} />
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="bg-white p-6 shadow-[0_20px_50px_-24px_rgba(12,18,32,0.25)] ring-1 ring-primary/5 sm:p-7">
              <p className="text-sm text-ink/50">Código {imovel.codigo}</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatPreco(imovel.preco)}
                {imovel.finalidade === "aluguel" && imovel.preco ? (
                  <span className="text-base font-medium text-ink/50">/mês</span>
                ) : null}
              </p>
              {(imovel.condominio || imovel.iptu) && (
                <dl className="mt-4 space-y-2 border-t border-primary/5 pt-4 text-sm">
                  {imovel.condominio ? (
                    <div className="flex justify-between">
                      <dt className="text-ink/55">Condomínio</dt>
                      <dd className="font-semibold text-ink/80">{formatPreco(imovel.condominio)}</dd>
                    </div>
                  ) : null}
                  {imovel.iptu ? (
                    <div className="flex justify-between">
                      <dt className="text-ink/55">IPTU</dt>
                      <dd className="font-semibold text-ink/80">{formatPreco(imovel.iptu)}</dd>
                    </div>
                  ) : null}
                </dl>
              )}

              <a
                href={whatsappLink(msgWhatsApp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex h-13 w-full items-center justify-center gap-2.5 rounded-md bg-[#25D366] font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Quero saber mais pelo WhatsApp
              </a>

              <div className="my-6 flex items-center gap-3 text-xs text-ink/40 uppercase">
                <span className="h-px flex-1 bg-primary/10" />
                ou envie uma mensagem
                <span className="h-px flex-1 bg-primary/10" />
              </div>

              <LeadForm
                imovelId={imovel.id}
                mensagemPadrao={`Olá! Tenho interesse no imóvel ${imovel.codigo}. Gostaria de mais informações.`}
                textoWhatsApp={msgWhatsApp}
                botao="Tenho interesse"
              />
            </div>
            <p className="mt-4 text-center text-xs text-ink/45">
              {siteConfig.name} · {siteConfig.creci}
            </p>
          </aside>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="container-site mt-24">
            <ImovelGridSkeleton quantidade={3} />
          </div>
        }
      >
        <Semelhantes imovel={imovel} />
      </Suspense>
    </>
  );
}

function Especificacoes({ imovel }: { imovel: ImovelComFotos }) {
  const itens = [
    { Icon: Ruler, label: "Área construída", valor: formatArea(imovel.area_construida) },
    { Icon: LandPlot, label: "Área total", valor: formatArea(imovel.area_total) },
    { Icon: BedDouble, label: "Quartos", valor: imovel.quartos || null },
    { Icon: Sparkles, label: "Suítes", valor: imovel.suites || null },
    { Icon: Bath, label: "Banheiros", valor: imovel.banheiros || null },
    { Icon: Car, label: "Vagas", valor: imovel.vagas || null },
    { Icon: Hash, label: "Código", valor: imovel.codigo },
  ].filter((i) => i.valor !== null && i.valor !== undefined);

  return (
    <section aria-label="Dados principais">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {itens.map(({ Icon, label, valor }) => (
          <li key={label} className="flex items-center gap-3.5 bg-white p-4 ring-1 ring-primary/5 sombra-card">
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-secondary-100 text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-ink/50">{label}</p>
              <p className="truncate font-bold text-primary">{valor}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Localizacao({ imovel }: { imovel: ImovelComFotos }) {
  const temMapa = imovel.latitude !== null && imovel.longitude !== null;
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
  if (!temMapa && !local) return null;

  return (
    <section>
      <h2 className="text-2xl text-primary">Localização</h2>
      {local && (
        <p className="mt-2 flex items-center gap-2 text-ink/65">
          <MapPin className="h-4 w-4 text-secondary-600" aria-hidden="true" />
          {local} - {siteConfig.state}
        </p>
      )}
      {temMapa && (
        <div className="mt-5 overflow-hidden ring-1 ring-primary/5">
          <iframe
            title={`Mapa da localização aproximada de ${imovel.titulo}`}
            src={`https://maps.google.com/maps?q=${imovel.latitude},${imovel.longitude}&z=15&output=embed`}
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
      <p className="mt-3 text-xs text-ink/45">
        Localização aproximada. O endereço completo é informado no atendimento.
      </p>
    </section>
  );
}

async function Semelhantes({ imovel }: { imovel: ImovelComFotos }) {
  const semelhantes = await getImoveisSemelhantes(
    { id: imovel.id, tipo: imovel.tipo, finalidade: imovel.finalidade, cidade: imovel.cidade },
    3,
  );
  if (semelhantes.length === 0) return null;

  return (
    <section className="container-site mt-24">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow="Você também pode gostar" title="Imóveis semelhantes" />
        <Link
          href={`/imoveis?finalidade=${imovel.finalidade}&tipo=${imovel.tipo}`}
          className={buttonClasses({ variant: "outline", className: "shrink-0" })}
        >
          Ver mais {TIPO_LABEL_PLURAL[imovel.tipo].toLowerCase()}
        </Link>
      </div>
      <div className="mt-10">
        <ImovelGrid imoveis={semelhantes} />
      </div>
    </section>
  );
}

function ImovelSkeleton() {
  return (
    <div className="container-site pt-10" aria-hidden="true">
      <div className="h-4 w-64 animate-pulse rounded bg-secondary-100" />
      <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-secondary-100" />
      <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-secondary-100" />
      <div className="mt-8 h-[22rem] animate-pulse bg-secondary-100 md:h-[30rem]" />
    </div>
  );
}
