import type { Metadata, Viewport } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Títulos: EB Garamond — a Garamond clássica de livros e documentos.
// Sóbria e tradicional, transmite seriedade, confiança e respeito.
const display = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Imóveis em ${siteConfig.city} - ${siteConfig.state}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    `imóveis em ${siteConfig.city}`,
    `casas à venda em ${siteConfig.city}`,
    `aluguel em ${siteConfig.city}`,
    "imobiliária",
    "corretor de imóveis",
    siteConfig.state,
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Imóveis em ${siteConfig.city} - ${siteConfig.state}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1b2b4b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
