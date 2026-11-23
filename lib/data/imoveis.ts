import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { POR_PAGINA, type FiltrosImoveis } from "@/lib/filtros";
import type { FotoImovel, Imovel, ImovelCard, ImovelComFotos } from "@/types/imovel";

/**
 * Leituras PÚBLICAS do site. Todas usam o cliente anônimo (sem cookies),
 * então o RLS só devolve imóveis com status = 'publicado'.
 * O resultado fica em cache e é invalidado pelo painel com updateTag('imoveis').
 */
export const TAG_IMOVEIS = "imoveis";

const CAMPOS_CARD =
  "id, codigo, slug, titulo, finalidade, tipo, preco, cidade, bairro, quartos, banheiros, vagas, area_total, area_construida, destaque, status, fotos_imovel(url, url_thumb, capa, ordem)";

type LinhaCard = Omit<ImovelCard, "capa"> & {
  fotos_imovel: Pick<FotoImovel, "url" | "url_thumb" | "capa" | "ordem">[];
};

function paraCard({ fotos_imovel, ...imovel }: LinhaCard): ImovelCard {
  const capa =
    [...fotos_imovel].sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem)[0] ??
    null;
  return { ...imovel, capa: capa ? { url: capa.url, url_thumb: capa.url_thumb } : null };
}

function falhar(contexto: string, error: { message: string }): never {
  throw new Error(`[supabase] ${contexto}: ${error.message}`);
}

export async function getImoveisDestaque(limite = 6): Promise<ImovelCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(CAMPOS_CARD)
    .eq("status", "publicado")
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limite)
    .overrideTypes<LinhaCard[], { merge: false }>();

  if (error) falhar("destaques", error);
  return data.map(paraCard);
}

export type ResultadoBusca = {
  itens: ImovelCard[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

export async function buscarImoveis(filtros: FiltrosImoveis): Promise<ResultadoBusca> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return { itens: [], total: 0, pagina: 1, totalPaginas: 0 };

  const supabase = createPublicClient();
  let query = supabase
    .from("imoveis")
    .select(CAMPOS_CARD, { count: "exact" })
    .eq("status", "publicado");

  if (filtros.finalidade) query = query.eq("finalidade", filtros.finalidade);
  if (filtros.tipo) query = query.eq("tipo", filtros.tipo);
  if (filtros.cidade) query = query.eq("cidade", filtros.cidade);
  if (filtros.bairro) query = query.eq("bairro", filtros.bairro);
  if (filtros.precoMin !== undefined) query = query.gte("preco", filtros.precoMin);
  if (filtros.precoMax !== undefined) query = query.lte("preco", filtros.precoMax);
  if (filtros.quartos) query = query.gte("quartos", filtros.quartos);
  if (filtros.vagas) query = query.gte("vagas", filtros.vagas);

  if (filtros.ordem === "menor-preco") {
    query = query.order("preco", { ascending: true, nullsFirst: false });
  } else if (filtros.ordem === "maior-preco") {
    query = query.order("preco", { ascending: false, nullsFirst: false });
  }
  query = query.order("created_at", { ascending: false });

  const inicio = (filtros.pagina - 1) * POR_PAGINA;
  const { data, error, count } = await query
    .range(inicio, inicio + POR_PAGINA - 1)
    .overrideTypes<LinhaCard[], { merge: false }>();

  // Página além do fim (PGRST103) → trata como lista vazia.
  if (error && error.code !== "PGRST103") falhar("busca", error);

  const total = count ?? 0;
  return {
    itens: (data ?? []).map(paraCard),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.ceil(total / POR_PAGINA),
  };
}

export async function getImovelPorSlug(slug: string): Promise<ImovelComFotos | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("*, fotos: fotos_imovel(*)")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle()
    .overrideTypes<ImovelComFotos, { merge: false }>();

  if (error) falhar("imóvel", error);
  if (!data) return null;

  return {
    ...data,
    fotos: [...data.fotos].sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem),
  };
}

/** Para redirecionar links antigos (slug mudou junto com o título) usando o código no fim do slug. */
export async function getSlugAtualPorCodigo(codigo: string): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return null;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("imoveis")
    .select("slug")
    .eq("codigo", codigo.toUpperCase())
    .eq("status", "publicado")
    .maybeSingle();
  return data?.slug ?? null;
}

export async function getImoveisSemelhantes(
  imovel: Pick<Imovel, "id" | "tipo" | "finalidade" | "cidade">,
  limite = 3,
): Promise<ImovelCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return [];

  const supabase = createPublicClient();
  const base = () =>
    supabase
      .from("imoveis")
      .select(CAMPOS_CARD)
      .eq("status", "publicado")
      .neq("id", imovel.id)
      .eq("finalidade", imovel.finalidade);

  // 1º: mesmo tipo e finalidade; completa com outros da mesma finalidade.
  const { data: mesmos, error } = await base()
    .eq("tipo", imovel.tipo)
    .order("created_at", { ascending: false })
    .limit(limite)
    .overrideTypes<LinhaCard[], { merge: false }>();
  if (error) falhar("semelhantes", error);

  let lista = mesmos;
  if (lista.length < limite) {
    const { data: outros } = await base()
      .neq("tipo", imovel.tipo)
      .order("created_at", { ascending: false })
      .limit(limite - lista.length)
      .overrideTypes<LinhaCard[], { merge: false }>();
    lista = [...lista, ...(outros ?? [])];
  }
  return lista.map(paraCard);
}

export type OpcoesFiltro = {
  cidades: string[];
  bairrosPorCidade: Record<string, string[]>;
};

/** Cidades e bairros que possuem imóveis publicados (para os selects de filtro). */
export async function getOpcoesFiltro(): Promise<OpcoesFiltro> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return { cidades: [], bairrosPorCidade: {} };

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("cidade, bairro")
    .eq("status", "publicado");
  if (error) falhar("opções de filtro", error);

  const mapa = new Map<string, Set<string>>();
  for (const { cidade, bairro } of data) {
    if (!cidade) continue;
    if (!mapa.has(cidade)) mapa.set(cidade, new Set());
    if (bairro) mapa.get(cidade)!.add(bairro);
  }
  const ordenar = (a: string, b: string) => a.localeCompare(b, "pt-BR");
  const cidades = [...mapa.keys()].sort(ordenar);
  return {
    cidades,
    bairrosPorCidade: Object.fromEntries(
      cidades.map((c) => [c, [...mapa.get(c)!].sort(ordenar)]),
    ),
  };
}

/** Slugs publicados — usado no sitemap e no generateStaticParams. */
export async function getSlugsPublicados(): Promise<{ slug: string; updated_at: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_IMOVEIS);
  if (!isSupabaseConfigured) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("slug, updated_at")
    .eq("status", "publicado")
    .order("updated_at", { ascending: false })
    .limit(5000);
  if (error) falhar("slugs", error);
  return data;
}
