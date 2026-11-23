import { siteConfig } from "@/config/site";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlSemCentavos = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** Formata um valor em reais. Valores inteiros são exibidos sem centavos. */
export function formatPreco(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "Consulte";
  }
  const n = Number(valor);
  return Number.isInteger(n) ? brlSemCentavos.format(n) : brl.format(n);
}

export function formatArea(valor: number | null | undefined): string | null {
  if (valor === null || valor === undefined || Number(valor) <= 0) return null;
  return `${numero.format(Number(valor))} m²`;
}

/** "5538991485383" -> "(38) 99148-5383" */
export function formatTelefone(digitos: string): string {
  const d = digitos.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}

/** Normaliza um telefone brasileiro para o formato do wa.me (com DDI 55). */
export function telefoneParaWhatsApp(telefone: string): string {
  const d = telefone.replace(/\D/g, "").replace(/^0+/, "");
  return d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
}

export function whatsappLink(mensagem?: string, numero: string = siteConfig.whatsapp): string {
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

/** Mensagem pronta para o corretor responder um lead pelo WhatsApp. */
export function mensagemRetornoLead(nome: string, codigoImovel?: string | null): string {
  const primeiro = nome.trim().split(/\s+/)[0] ?? "";
  const sobre = codigoImovel ? ` sobre o imóvel ${codigoImovel}` : "";
  return `Olá, ${primeiro}! Aqui é da ${siteConfig.name}. Recebemos seu contato pelo site${sobre}. Como posso ajudar?`;
}

/** "https://www.instagram.com/silveira_corretora/" -> "@silveira_corretora" */
export function perfilInstagram(url: string) {
  const usuario = new URL(url).pathname.split("/").filter(Boolean)[0];
  return usuario ? `@${usuario}` : url;
}
