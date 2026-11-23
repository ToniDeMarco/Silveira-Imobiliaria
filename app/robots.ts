import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * /robots.txt dinâmico.
 * Em deploys de preview da Vercel (VERCEL_ENV=preview), bloqueia a indexação
 * para o Google não indexar URLs temporárias. Em produção, libera o site e
 * bloqueia apenas o painel e endpoints internos.
 */
export default function robots(): MetadataRoute.Robots {
  const ambiente = process.env.VERCEL_ENV;
  if (ambiente && ambiente !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
