import { z } from "zod";
import { FINALIDADES, TIPOS } from "@/types/imovel";

export const ORDENS = ["recentes", "menor-preco", "maior-preco"] as const;
export type Ordem = (typeof ORDENS)[number];

export const ORDEM_LABEL: Record<Ordem, string> = {
  recentes: "Mais recentes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
};

export const POR_PAGINA = 12;

const texto = z
  .string()
  .trim()
  .max(80)
  .transform((v) => v || undefined)
  .optional()
  .catch(undefined);

const inteiro = (max: number) =>
  z.coerce.number().int().min(0).max(max).optional().catch(undefined);

const filtrosSchema = z.object({
  finalidade: z.enum(FINALIDADES).optional().catch(undefined),
  tipo: z.enum(TIPOS).optional().catch(undefined),
  cidade: texto,
  bairro: texto,
  precoMin: inteiro(1_000_000_000),
  precoMax: inteiro(1_000_000_000),
  quartos: inteiro(20),
  vagas: inteiro(20),
  ordem: z.enum(ORDENS).catch("recentes"),
  pagina: z.coerce.number().int().min(1).max(1000).catch(1),
});

export type FiltrosImoveis = z.infer<typeof filtrosSchema>;

type SearchParams = Record<string, string | string[] | undefined>;

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Converte a query string (?finalidade=venda&tipo=casa...) em filtros validados. */
export function parseFiltros(sp: SearchParams): FiltrosImoveis {
  return filtrosSchema.parse({
    finalidade: primeiro(sp.finalidade) || undefined,
    tipo: primeiro(sp.tipo) || undefined,
    cidade: primeiro(sp.cidade),
    bairro: primeiro(sp.bairro),
    precoMin: primeiro(sp.preco_min) || undefined,
    precoMax: primeiro(sp.preco_max) || undefined,
    quartos: primeiro(sp.quartos) || undefined,
    vagas: primeiro(sp.vagas) || undefined,
    ordem: primeiro(sp.ordem) ?? "recentes",
    pagina: primeiro(sp.pagina) ?? 1,
  });
}

/** Gera a query string compartilhável a partir dos filtros. */
export function filtrosParaQuery(
  filtros: Partial<FiltrosImoveis>,
  alteracoes: Partial<FiltrosImoveis> = {},
): string {
  const f = { ...filtros, ...alteracoes };
  const params = new URLSearchParams();
  if (f.finalidade) params.set("finalidade", f.finalidade);
  if (f.tipo) params.set("tipo", f.tipo);
  if (f.cidade) params.set("cidade", f.cidade);
  if (f.bairro) params.set("bairro", f.bairro);
  if (f.precoMin !== undefined) params.set("preco_min", String(f.precoMin));
  if (f.precoMax !== undefined) params.set("preco_max", String(f.precoMax));
  if (f.quartos) params.set("quartos", String(f.quartos));
  if (f.vagas) params.set("vagas", String(f.vagas));
  if (f.ordem && f.ordem !== "recentes") params.set("ordem", f.ordem);
  if (f.pagina && f.pagina > 1) params.set("pagina", String(f.pagina));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function contarFiltrosAtivos(f: FiltrosImoveis): number {
  return [f.finalidade, f.tipo, f.cidade, f.bairro, f.precoMin, f.precoMax, f.quartos, f.vagas].filter(
    (v) => v !== undefined && v !== 0,
  ).length;
}
