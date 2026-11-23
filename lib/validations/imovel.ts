import { z } from "zod";
import { FINALIDADES, STATUS, TIPOS } from "@/types/imovel";
import type { TablesInsert } from "@/types/database";

/**
 * Converte números digitados no padrão brasileiro:
 * "780.000" → 780000 · "1.800,50" → 1800.5 · "95000" → 95000 · "" → null
 */
export function parseNumeroBR(valor: string): number | null {
  const s = valor.replace(/R\$|\s|m²/gi, "").trim();
  if (!s) return null;
  let normalizado = s;
  if (s.includes(",")) normalizado = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) normalizado = s.replace(/\./g, "");
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : NaN;
}

/** Coordenadas sempre com ponto ou vírgula decimal, aceitando sinal negativo. */
export function parseCoordenada(valor: string): number | null {
  const s = valor.trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

const numero = (rotulo: string, { inteiro = false, max = 1e10 } = {}) =>
  z.string().refine((v) => {
    const n = parseNumeroBR(v);
    if (n === null) return true;
    return !Number.isNaN(n) && n >= 0 && n <= max && (!inteiro || Number.isInteger(n));
  }, `${rotulo}: informe um número válido${inteiro ? " (inteiro)" : ""}.`);

const coordenada = (rotulo: string, limite: number) =>
  z.string().refine((v) => {
    const n = parseCoordenada(v);
    return n === null || (!Number.isNaN(n) && Math.abs(n) <= limite);
  }, `${rotulo} inválida.`);

const textoOpcional = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`);

/** Campos do formulário (numéricos como texto, para aceitar o formato brasileiro). */
export const imovelFormSchema = z.object({
  titulo: z.string().trim().min(3, "Informe um título (mín. 3 caracteres).").max(150, "Título muito longo."),
  descricao: textoOpcional(10000),
  finalidade: z.enum(FINALIDADES),
  tipo: z.enum(TIPOS),
  status: z.enum(STATUS),
  destaque: z.boolean(),
  preco: numero("Preço"),
  condominio: numero("Condomínio"),
  iptu: numero("IPTU"),
  cidade: textoOpcional(80),
  bairro: textoOpcional(80),
  endereco: textoOpcional(200),
  quartos: numero("Quartos", { inteiro: true, max: 100 }),
  suites: numero("Suítes", { inteiro: true, max: 100 }),
  banheiros: numero("Banheiros", { inteiro: true, max: 100 }),
  vagas: numero("Vagas", { inteiro: true, max: 1000 }),
  area_total: numero("Área total"),
  area_construida: numero("Área construída"),
  caracteristicas: z.array(z.string().trim().min(1).max(60)).max(60),
  latitude: coordenada("Latitude", 90),
  longitude: coordenada("Longitude", 180),
});

export type ImovelFormValues = z.infer<typeof imovelFormSchema>;

/** Converte os valores do formulário para o formato do banco. */
export function formParaBanco(v: ImovelFormValues): Omit<TablesInsert<"imoveis">, "id" | "codigo" | "slug"> {
  const num = (s: string) => parseNumeroBR(s);
  const int = (s: string) => {
    const n = parseNumeroBR(s);
    return n === null ? null : Math.trunc(n);
  };
  const txt = (s: string) => s.trim() || null;
  return {
    titulo: v.titulo.trim(),
    descricao: txt(v.descricao),
    finalidade: v.finalidade,
    tipo: v.tipo,
    status: v.status,
    destaque: v.destaque,
    preco: num(v.preco),
    condominio: num(v.condominio),
    iptu: num(v.iptu),
    cidade: txt(v.cidade),
    bairro: txt(v.bairro),
    endereco: txt(v.endereco),
    quartos: int(v.quartos),
    suites: int(v.suites),
    banheiros: int(v.banheiros),
    vagas: int(v.vagas),
    area_total: num(v.area_total),
    area_construida: num(v.area_construida),
    caracteristicas: [...new Set(v.caracteristicas.map((c) => c.trim()).filter(Boolean))],
    latitude: parseCoordenada(v.latitude),
    longitude: parseCoordenada(v.longitude),
  };
}

const paraTexto = (n: number | null | undefined) =>
  n === null || n === undefined ? "" : String(n).replace(".", ",");

/** Converte um registro do banco para os valores iniciais do formulário. */
export function bancoParaForm(i: Partial<TablesInsert<"imoveis">> = {}): ImovelFormValues {
  return {
    titulo: i.titulo ?? "",
    descricao: i.descricao ?? "",
    finalidade: i.finalidade ?? "venda",
    tipo: i.tipo ?? "casa",
    status: i.status ?? "rascunho",
    destaque: i.destaque ?? false,
    preco: paraTexto(i.preco),
    condominio: paraTexto(i.condominio),
    iptu: paraTexto(i.iptu),
    cidade: i.cidade ?? "",
    bairro: i.bairro ?? "",
    endereco: i.endereco ?? "",
    quartos: paraTexto(i.quartos),
    suites: paraTexto(i.suites),
    banheiros: paraTexto(i.banheiros),
    vagas: paraTexto(i.vagas),
    area_total: paraTexto(i.area_total),
    area_construida: paraTexto(i.area_construida),
    caracteristicas: i.caracteristicas ?? [],
    latitude: i.latitude === null || i.latitude === undefined ? "" : String(i.latitude),
    longitude: i.longitude === null || i.longitude === undefined ? "" : String(i.longitude),
  };
}
