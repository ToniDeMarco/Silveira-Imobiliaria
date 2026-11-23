import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getSlugsPublicados } from "@/lib/data/imoveis";

/**
 * /sitemap.xml dinâmico: páginas fixas + todos os imóveis publicados.
 * Usa a mesma consulta em cache (tag "imoveis"), então é atualizado
 * automaticamente quando um imóvel é publicado, editado ou excluído no painel.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const imoveis = await getSlugsPublicados();

  const paginas: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/imoveis`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sobre`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contato`, changeFrequency: "yearly", priority: 0.5 },
  ];

  return [
    ...paginas,
    ...imoveis.map(({ slug, updated_at }) => ({
      url: `${base}/imoveis/${slug}`,
      lastModified: new Date(updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
