import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Handshake, MapPin, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/format";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/ui/eyebrow";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { LogoMark } from "@/components/site/logo";
import sobreImg from "@/public/images/sobre-pagina.jpg";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: `Conheça a ${siteConfig.name}: atendimento próximo, transparente e seguro para comprar, vender ou alugar imóveis em ${siteConfig.region}.`,
  alternates: { canonical: "/sobre" },
};

// TODO: textos institucionais genéricos — revisar com o cliente (história, anos de atuação etc.).
const VALORES = [
  { Icon: Eye, titulo: "Transparência", texto: "Informações claras sobre cada imóvel, valores e etapas da negociação." },
  { Icon: ShieldCheck, titulo: "Segurança", texto: "Documentação analisada com cuidado para você negociar com tranquilidade." },
  { Icon: Handshake, titulo: "Proximidade", texto: "Atendimento direto e pessoal, do primeiro contato à entrega das chaves." },
  { Icon: MapPin, titulo: "Conhecimento local", texto: `Experiência real no mercado de ${siteConfig.city} e cidades vizinhas.` },
];

const ETAPAS = [
  { titulo: "Entendemos você", texto: "Conversamos sobre o que você procura: região, orçamento e estilo de vida." },
  { titulo: "Selecionamos opções", texto: "Filtramos os imóveis que realmente fazem sentido para o seu momento." },
  { titulo: "Acompanhamos as visitas", texto: "Estamos ao seu lado em cada visita, tirando todas as dúvidas." },
  { titulo: "Cuidamos da negociação", texto: "Proposta, documentação e contrato conduzidos com segurança." },
];

export default function SobrePage() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre nós"
        title={<>Imóveis em {siteConfig.city}, com atendimento de quem conhece a cidade</>}
        description={`A ${siteConfig.name} une conhecimento do mercado local e atendimento próximo para tornar a sua negociação simples e segura.`}
        breadcrumb={[{ label: "Sobre" }]}
      />

      <section className="container-site mt-6 grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden shadow-xl shadow-primary/10">
          <Image
            src={sobreImg}
            alt="Casa moderna com piscina"
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-5 text-ink/75">
          <h2 className="text-3xl leading-tight text-primary sm:text-4xl">Nossa história</h2>
          <p>
            {siteConfig.responsavel
              ? `Comandada pelo corretor ${siteConfig.responsavel} (${siteConfig.creci}), a ${siteConfig.name}`
              : `Registrada no ${siteConfig.creci}, a ${siteConfig.name}`}{" "}
            atua na compra, venda e locação de casas, apartamentos, terrenos, pontos comerciais,
            chácaras e propriedades rurais em {siteConfig.region}.
          </p>
          <p>
            Acreditamos que encontrar um imóvel é muito mais do que fechar um negócio: é começar um
            novo capítulo. Por isso, cada atendimento é feito com escuta atenta, transparência e
            cuidado com cada detalhe da documentação.
          </p>
          <p>
            Para quem quer vender ou alugar, oferecemos avaliação, divulgação profissional e
            acompanhamento completo até a assinatura do contrato.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <LogoMark className="h-12 w-16" />
            <div>
              <p className="font-semibold text-primary">{siteConfig.responsavel || siteConfig.name}</p>
              <p className="text-sm text-ink/55">
                {siteConfig.responsavel ? "Corretor de imóveis" : siteConfig.tagline} · {siteConfig.creci}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site mt-28">
        <SectionHeading align="center" eyebrow="Nossos valores" title="O que guia o nosso trabalho" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALORES.map(({ Icon, titulo, texto }) => (
            <li key={titulo} className="bg-white p-7 ring-1 ring-primary/5 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center bg-secondary-100 text-primary">
                <Icon className="h-5.5 w-5.5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl text-primary">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site mt-28">
        <div className="bg-secondary-100 px-6 py-14 sm:px-12">
          <SectionHeading align="center" eyebrow="Como trabalhamos" title="Do primeiro contato às chaves na mão" />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPAS.map((etapa, i) => (
              <li key={etapa.titulo} className="relative">
                <span className="font-serif text-5xl text-secondary-500">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg text-primary">{etapa.titulo}</h3>
                <p className="mt-1.5 text-sm text-ink/65">{etapa.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-site mt-24 text-center">
        <h2 className="text-3xl text-primary sm:text-4xl">Vamos conversar?</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink/65">
          Seja para comprar, vender ou alugar, será um prazer ajudar você.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink("Olá! Vim pela página Sobre e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ size: "lg" })}
          >
            <WhatsAppIcon className="h-5 w-5" />
            Falar no WhatsApp
          </a>
          <Link href="/imoveis" className={buttonClasses({ variant: "outline", size: "lg" })}>
            Ver imóveis
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
