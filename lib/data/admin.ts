import "server-only";
import { requireAdmin } from "@/lib/auth";
import { STATUS, type FotoImovel, type Imovel, type ImovelComFotos, type Lead, type StatusImovel } from "@/types/imovel";

/**
 * Leituras do PAINEL. Sem cache: sempre dados atuais, com a sessão do admin
 * (o RLS só libera tudo para quem está na tabela `admins`).
 */

export const ADMIN_POR_PAGINA = 20;

export type FiltroAdmin = { q?: string; status?: StatusImovel; pagina: number };

export function parseFiltroAdmin(sp: Record<string, string | string[] | undefined>): FiltroAdmin {
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = um(sp.status) as StatusImovel;
  const pagina = Math.max(1, Math.min(1000, Number.parseInt(um(sp.pagina), 10) || 1));
  return {
    q: um(sp.q).trim().slice(0, 80) || undefined,
    status: STATUS.includes(status) ? status : undefined,
    pagina,
  };
}

export type ImovelAdminLinha = Pick<
  Imovel,
  "id" | "codigo" | "slug" | "titulo" | "tipo" | "finalidade" | "preco" | "status" | "destaque" | "bairro" | "cidade" | "updated_at"
> & { fotos_imovel: Pick<FotoImovel, "url_thumb" | "capa" | "ordem">[] };

export async function listarImoveisAdmin(filtro: FiltroAdmin) {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("imoveis")
    .select(
      "id, codigo, slug, titulo, tipo, finalidade, preco, status, destaque, bairro, cidade, updated_at, fotos_imovel(url_thumb, capa, ordem)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (filtro.status) query = query.eq("status", filtro.status);
  if (filtro.q) {
    // Remove caracteres que têm significado na sintaxe de filtro do PostgREST.
    const termo = filtro.q.replace(/[,()%*\\.:"']/g, " ").trim();
    if (termo) {
      query = query.or(`titulo.ilike.*${termo}*,codigo.ilike.*${termo}*,bairro.ilike.*${termo}*`);
    }
  }

  const inicio = (filtro.pagina - 1) * ADMIN_POR_PAGINA;
  const { data, count, error } = await query
    .range(inicio, inicio + ADMIN_POR_PAGINA - 1)
    .overrideTypes<ImovelAdminLinha[], { merge: false }>();
  if (error && error.code !== "PGRST103") throw new Error(error.message);

  return {
    itens: data ?? [],
    total: count ?? 0,
    totalPaginas: Math.ceil((count ?? 0) / ADMIN_POR_PAGINA),
  };
}

export async function getImovelAdmin(id: string): Promise<ImovelComFotos | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("imoveis")
    .select("*, fotos: fotos_imovel(*)")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<ImovelComFotos, { merge: false }>();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...data, fotos: [...data.fotos].sort((a, b) => a.ordem - b.ordem) };
}

export type LeadComImovel = Lead & { imovel: Pick<Imovel, "id" | "codigo" | "titulo"> | null };

export async function listarLeads(pagina = 1, limite = 50) {
  const { supabase } = await requireAdmin();
  const inicio = (pagina - 1) * limite;
  const { data, count, error } = await supabase
    .from("leads")
    .select("*, imovel: imoveis(id, codigo, titulo)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(inicio, inicio + limite - 1)
    .overrideTypes<LeadComImovel[], { merge: false }>();
  if (error && error.code !== "PGRST103") throw new Error(error.message);
  return { itens: data ?? [], total: count ?? 0, totalPaginas: Math.ceil((count ?? 0) / limite) };
}

export async function getResumoPainel() {
  const { supabase } = await requireAdmin();
  const contar = (status?: StatusImovel) => {
    const q = supabase.from("imoveis").select("id", { count: "exact", head: true });
    return status ? q.eq("status", status) : q;
  };
  const seteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [total, publicados, rascunhos, leadsSemana, leadsTotal] = await Promise.all([
    contar(),
    contar("publicado"),
    contar("rascunho"),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", seteDias),
    supabase.from("leads").select("id", { count: "exact", head: true }),
  ]);

  return {
    imoveis: total.count ?? 0,
    publicados: publicados.count ?? 0,
    rascunhos: rascunhos.count ?? 0,
    leadsSemana: leadsSemana.count ?? 0,
    leadsTotal: leadsTotal.count ?? 0,
  };
}
