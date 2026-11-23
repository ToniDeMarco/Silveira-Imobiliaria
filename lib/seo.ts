import { siteConfig } from "@/config/site";
import { FINALIDADE_LABEL, TIPO_LABEL, type ImovelComFotos } from "@/types/imovel";
import { formatPreco } from "@/lib/format";

export function urlAbsoluta(caminho: string) {
  return `${siteConfig.url}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

export function capaDoImovel(imovel: ImovelComFotos) {
  return imovel.fotos.find((f) => f.capa) ?? imovel.fotos[0] ?? null;
}

/** Descrição curta (até ~160 caracteres) para meta description / Open Graph. */
export function descricaoCurta(imovel: ImovelComFotos): string {
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
  const resumo = `${TIPO_LABEL[imovel.tipo]} para ${FINALIDADE_LABEL[imovel.finalidade].toLowerCase()}${
    local ? ` em ${local}` : ""
  } por ${formatPreco(imovel.preco)}.`;
  const texto = imovel.descricao ? `${resumo} ${imovel.descricao.replace(/\s+/g, " ")}` : resumo;
  return texto.length > 160 ? `${texto.slice(0, 157).trimEnd()}...` : texto;
}

const SCHEMA_TIPO: Record<ImovelComFotos["tipo"], string> = {
  casa: "SingleFamilyResidence",
  apartamento: "Apartment",
  terreno: "Place",
  comercial: "Place",
  rural: "Place",
  chacara: "House",
};

/** JSON-LD schema.org/RealEstateListing para a página do imóvel. */
export function jsonLdImovel(imovel: ImovelComFotos) {
  const url = urlAbsoluta(`/imoveis/${imovel.slug}`);
  const area = imovel.area_construida ?? imovel.area_total;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: imovel.titulo,
    description: descricaoCurta(imovel),
    datePosted: imovel.created_at,
    dateModified: imovel.updated_at,
    identifier: imovel.codigo,
    image: imovel.fotos.map((f) => f.url),
    offers: {
      "@type": "Offer",
      price: imovel.preco ?? undefined,
      priceCurrency: "BRL",
      businessFunction:
        imovel.finalidade === "aluguel"
          ? "https://purl.org/goodrelations/v1#LeaseOut"
          : "https://purl.org/goodrelations/v1#Sell",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "RealEstateAgent",
        name: siteConfig.name,
        url: siteConfig.url,
        telephone: `+${siteConfig.whatsapp}`,
      },
    },
    itemOffered: {
      "@type": SCHEMA_TIPO[imovel.tipo],
      name: imovel.titulo,
      ...(imovel.quartos ? { numberOfRooms: imovel.quartos } : {}),
      ...(imovel.banheiros ? { numberOfBathroomsTotal: imovel.banheiros } : {}),
      ...(area ? { floorSize: { "@type": "QuantitativeValue", value: area, unitCode: "MTK" } } : {}),
      address: {
        "@type": "PostalAddress",
        addressLocality: imovel.cidade ?? siteConfig.city,
        addressRegion: siteConfig.state,
        addressCountry: "BR",
      },
      ...(imovel.latitude !== null && imovel.longitude !== null
        ? { geo: { "@type": "GeoCoordinates", latitude: imovel.latitude, longitude: imovel.longitude } }
        : {}),
      ...(imovel.caracteristicas.length
        ? {
            amenityFeature: imovel.caracteristicas.map((c) => ({
              "@type": "LocationFeatureSpecification",
              name: c,
              value: true,
            })),
          }
        : {}),
    },
  };
}

/** JSON-LD schema.org/RealEstateAgent (dados da imobiliária) para a página inicial. */
export function jsonLdImobiliaria() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteConfig.url}/#imobiliaria`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    image: `${siteConfig.url}/opengraph-image.jpg`,
    telephone: `+${siteConfig.whatsapp}`,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.state,
      addressCountry: "BR",
    },
    areaServed: { "@type": "City", name: siteConfig.city },
    identifier: siteConfig.creci,
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

/** Serializa JSON-LD de forma segura para <script> (evita fechar a tag com "</script>"). */
export function serializarJsonLd(dados: unknown) {
  return JSON.stringify(dados).replace(/</g, "\\u003c");
}
