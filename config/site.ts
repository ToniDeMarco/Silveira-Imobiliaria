/**
 * Dados do cliente centralizados.
 *
 * Para reaproveitar este projeto com outra imobiliária, altere este arquivo,
 * as cores em `app/globals.css` (bloco "CORES DA MARCA") e o componente
 * `components/site/logo.tsx`.
 */

const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP || "5538991485383";

export const siteConfig = {
  name: "Silveira Corretora",
  shortName: "Silveira",
  /** Linha exibida abaixo do nome na logo. */
  tagline: "Corretora de Imóveis",
  description:
    "Casas, apartamentos, terrenos e imóveis rurais à venda e para alugar em Janaúba e região. Atendimento próximo, transparente e com segurança jurídica.",
  slogan: "O seu próximo endereço em Janaúba começa aqui.",

  city: "Janaúba",
  state: "MG",
  region: "Janaúba e região",

  creci: "CRECI F. 23626",
  /** Nome do corretor responsável. Vazio = os textos citam só a empresa. */
  // TODO: preencher com o nome do corretor responsável.
  responsavel: "",

  /** Somente dígitos, com DDI (55) + DDD. Pode ser sobrescrito por NEXT_PUBLIC_WHATSAPP. */
  whatsapp: whatsappRaw.replace(/\D/g, ""),
  // TODO: e-mail fictício — substituir pelo e-mail real do cliente.
  email: "contato@silveiracorretora.com.br",
  // TODO: horário fictício — confirmar com o cliente.
  horario: "Segunda a sexta, 8h às 18h · Sábado, 8h às 12h",

  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),

  /** Deixe vazio para ocultar o ícone no rodapé. */
  social: {
    instagram: "https://www.instagram.com/silveira_corretora/",
    facebook: "",
    youtube: "",
  },

  nav: [
    { label: "Início", href: "/" },
    { label: "Imóveis", href: "/imoveis" },
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
