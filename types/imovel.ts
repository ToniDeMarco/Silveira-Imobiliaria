import type { Tables } from "./database";

export type Imovel = Tables<"imoveis">;
export type FotoImovel = Tables<"fotos_imovel">;
export type Lead = Tables<"leads">;

export type Finalidade = Imovel["finalidade"];
export type TipoImovel = Imovel["tipo"];
export type StatusImovel = Imovel["status"];

export type ImovelComFotos = Imovel & { fotos: FotoImovel[] };

/** Dados resumidos usados nos cards da listagem. */
export type ImovelCard = Pick<
  Imovel,
  | "id"
  | "codigo"
  | "slug"
  | "titulo"
  | "finalidade"
  | "tipo"
  | "preco"
  | "cidade"
  | "bairro"
  | "quartos"
  | "banheiros"
  | "vagas"
  | "area_total"
  | "area_construida"
  | "destaque"
  | "status"
> & { capa: Pick<FotoImovel, "url_thumb" | "url"> | null };

export const FINALIDADES = ["venda", "aluguel"] as const satisfies readonly Finalidade[];
export const TIPOS = [
  "casa",
  "apartamento",
  "terreno",
  "comercial",
  "rural",
  "chacara",
] as const satisfies readonly TipoImovel[];
export const STATUS = [
  "rascunho",
  "publicado",
  "vendido",
  "alugado",
] as const satisfies readonly StatusImovel[];

export const FINALIDADE_LABEL: Record<Finalidade, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
};

export const TIPO_LABEL: Record<TipoImovel, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
  rural: "Rural",
  chacara: "Chácara",
};

export const TIPO_LABEL_PLURAL: Record<TipoImovel, string> = {
  casa: "Casas",
  apartamento: "Apartamentos",
  terreno: "Terrenos",
  comercial: "Comerciais",
  rural: "Rurais",
  chacara: "Chácaras",
};

export const STATUS_LABEL: Record<StatusImovel, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  vendido: "Vendido",
  alugado: "Alugado",
};
