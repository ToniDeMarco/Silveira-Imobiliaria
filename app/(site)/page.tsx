import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Handshake,
  House,
  LandPlot,
  MapPin,
  ShieldCheck,
  Store,
  Tractor,
  Trees,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/format";
import { getImoveisDestaque } from "@/lib/data/imoveis";
import { TIPO_LABEL_PLURAL, type TipoImovel } from "@/types/imovel";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow, SectionHeading } from "@/components/ui/eyebrow";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { BuscaRapida } from "@/components/imoveis/busca-rapida";
import { ImovelGrid } from "@/components/imoveis/imovel-card";
import { LogoMark } from "@/components/site/logo";
import { jsonLdImobiliaria, serializarJsonLd } from "@/lib/seo";
import {
  CLIP_FAIXA_DESKTOP,
  CLIP_FAIXA_MOBILE,
  CLIP_FOTO_DESKTOP,
  CLIP_FOTO_MOBILE,
  HeroCurvaDefs,
} from "@/components/site/hero-curva";
import heroImg from "@/public/images/hero.jpg";
import sobreImg from "@/public/images/sobre.jpg";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLdImobiliaria()) }}
      />
      <Hero />
      <Categorias />
      <Sobre />
      <Destaques />
      <ChamadaWhatsApp />
    </>
  );
}

/**
 * Hero dividido: texto à esquerda sobre fundo escuro e foto à direita,
 * separados por uma curva orgânica (components/site/hero-curva.tsx).
 * No celular/tablet a curva vira horizontal, no topo da foto.
 * A busca rápida atravessa a divisa entre o hero e o bege da página.
 */
function Hero() {
  return (
    <>
      <section
        className="relative overflow-hidden bg-primary-950"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 8% 12%, rgb(201 168 118 / 0.10), transparent 60%), linear-gradient(160deg, #13261e 0%, #0b1712 70%)",
        }}
      >
        <HeroCurvaDefs />

        {/* Foto (desktop): metade direita, recortada pela curva */}
        <div
          className="absolute inset-y-0 right-0 hidden w-[58%] lg:block xl:w-[57%]"
          style={{ clipPath: `url(#${CLIP_FOTO_DESKTOP})` }}
        >
          <Image
            src={heroImg}
            alt="Casa moderna com piscina e jardim"
            fill
            preload
            placeholder="blur"
            sizes="(min-width: 1024px) 58vw, 1px"
            className="object-cover object-[62%_center]"
          />
          {/* Leve escurecimento para a foto conversar com o fundo escuro */}
          <div aria-hidden="true" className="absolute inset-0 bg-primary-950/15" />
          {/* Faixa escura translúcida acompanhando a curva (integra foto e fundo) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-primary-950/55"
            style={{ clipPath: `url(#${CLIP_FAIXA_DESKTOP})` }}
          />
        </div>

        <div className="container-site relative pt-6 sm:pt-16 lg:flex lg:min-h-[40rem] lg:items-center lg:pt-0 lg:pb-24 xl:min-h-[44rem]">
          <div className="max-w-xl lg:max-w-[28rem] xl:max-w-xl">
            {/* No celular o hero vai direto ao ponto: só selo, foto e busca */}
            <div className="animate-fade-up max-sm:hidden">
              <Eyebrow tone="dark">Venda e locação de imóveis</Eyebrow>
            </div>
            {/* Título só visual a partir do tablet; no celular segue para Google e leitores de tela */}
            <h1 className="animate-fade-up mt-6 text-[2.75rem] max-sm:sr-only leading-[1.02] font-semibold text-white [animation-delay:120ms] sm:text-6xl lg:text-[3.4rem] xl:text-[4.25rem]">
              Encontre o imóvel
              <br />
              <span className="text-secondary-300">ideal</span> em {siteConfig.city}
            </h1>
            <p className="animate-fade-up mt-6 max-w-md text-base max-sm:hidden text-white/70 [animation-delay:240ms] sm:text-lg lg:max-w-[22rem] xl:max-w-md">
              Casas, apartamentos, terrenos e imóveis rurais à venda e para alugar, com atendimento
              próximo e toda a segurança que a sua negociação merece.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-3 [animation-delay:360ms] max-sm:hidden">
              <Link href="/imoveis" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                Ver imóveis
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </Link>
              <a
                href={whatsappLink("Olá! Vim pelo site e gostaria de atendimento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-13 items-center gap-3 rounded-md pr-5 pl-1.5 font-semibold text-white transition hover:bg-white/5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md border border-white/30 transition group-hover:border-white/60">
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                </span>
                Falar com corretor
              </a>
            </div>

            {/* Selo de credencial (no lugar de números inventados) */}
            <div className="animate-fade-up mt-10 flex items-center gap-3 [animation-delay:480ms] max-sm:mt-0 max-sm:[animation-delay:0ms]">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 ring-1 ring-white/15">
                <LogoMark tone="light" className="h-6 w-6" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">{siteConfig.creci}</p>
                <p className="text-xs text-white/55">Corretora credenciada · {siteConfig.region}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Foto (celular/tablet): ponta a ponta, com a curva no topo */}
        <div
          className="relative mt-4 h-[22rem] sm:mt-6 sm:h-[30rem] md:h-[34rem] lg:hidden"
          style={{ clipPath: `url(#${CLIP_FOTO_MOBILE})` }}
        >
          <Image
            src={heroImg}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 1023px) 100vw, 1px"
            className="object-cover object-[65%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-primary-950/55"
            style={{ clipPath: `url(#${CLIP_FAIXA_MOBILE})` }}
          />
        </div>
      </section>

      {/* Busca rápida atravessando a divisa entre o hero e a página */}
      <div className="relative z-10 container-site -mt-20">
        <div className="animate-fade-up mx-auto max-w-5xl [animation-delay:600ms]">
          <BuscaRapida />
        </div>
      </div>
    </>
  );
}

const CATEGORIAS: { tipo: TipoImovel; Icon: typeof House }[] = [
  { tipo: "casa", Icon: House },
  { tipo: "apartamento", Icon: Building2 },
  { tipo: "terreno", Icon: LandPlot },
  { tipo: "comercial", Icon: Store },
  { tipo: "chacara", Icon: Trees },
  { tipo: "rural", Icon: Tractor },
];

function Categorias() {
  return (
    <section className="container-site mt-16 sm:mt-20" aria-labelledby="categorias-titulo">
      <h2 id="categorias-titulo" className="sr-only">
        Explore por tipo de imóvel
      </h2>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {CATEGORIAS.map(({ tipo, Icon }) => (
          <li key={tipo}>
            <Link
              href={`/imoveis?tipo=${tipo}`}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white/60 px-2 py-5 text-center ring-1 ring-primary/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary-100 text-primary transition group-hover:bg-primary group-hover:text-secondary-200">
                <Icon className="h-5.5 w-5.5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-primary">{TIPO_LABEL_PLURAL[tipo]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const DIFERENCIAIS = [
  {
    Icon: Handshake,
    titulo: "Atendimento próximo",
    texto: "Você fala direto com quem conhece cada imóvel.",
  },
  {
    Icon: ShieldCheck,
    titulo: "Negociação segura",
    texto: "Documentação conferida do início ao fim.",
  },
  {
    Icon: MapPin,
    titulo: "Conhecimento local",
    texto: `Quem vive ${siteConfig.city} sabe onde estão as oportunidades.`,
  },
];

function Sobre() {
  return (
    <section className="container-site mt-24 sm:mt-32">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr_0.8fr] lg:gap-10">
        <div className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] rounded-tr-[6rem] shadow-xl shadow-primary/10">
            <Image
              src={sobreImg}
              alt="Sala de estar ampla e iluminada"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-3 -bottom-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-primary/5 sm:-right-6">
            <LogoMark className="h-10 w-10" />
            <div className="leading-tight">
              <p className="text-xs text-ink/50">Corretora credenciada</p>
              <p className="text-sm font-bold text-primary">{siteConfig.creci}</p>
            </div>
          </div>
        </div>

        <div>
          <Eyebrow>Sobre nós</Eyebrow>
          <h2 className="mt-4 text-3xl leading-tight text-primary sm:text-4xl">
            Mais que imóveis, <br className="hidden sm:block" />
            realizamos histórias
          </h2>
          <p className="mt-5 text-ink/70">
            A {siteConfig.name} nasceu para tornar a compra, a venda e a locação de imóveis em{" "}
            {siteConfig.city} um processo simples, transparente e seguro. Cuidamos de cada detalhe
            para que você foque no que importa: o seu novo lar.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start">
            <Link href="/sobre" className={buttonClasses()}>
              Conheça a imobiliária
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <ul className="grid gap-6 border-primary/10 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:pl-10">
          {DIFERENCIAIS.map(({ Icon, titulo, texto }) => (
            <li key={titulo} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm ring-1 ring-primary/5">
                <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-primary">{titulo}</p>
                <p className="mt-0.5 text-sm text-ink/60">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function Destaques() {
  const imoveis = await getImoveisDestaque(6);

  return (
    <section className="container-site mt-28 sm:mt-36">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Nossos imóveis"
          title="Imóveis em destaque"
          description="Uma seleção especial das melhores oportunidades do momento."
        />
        <Link href="/imoveis" className={buttonClasses({ variant: "outline", className: "shrink-0" })}>
          Ver todos os imóveis
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-10">
        {imoveis.length > 0 ? (
          <ImovelGrid imoveis={imoveis} />
        ) : (
          <div className="rounded-3xl border border-dashed border-primary/15 bg-white/50 px-6 py-16 text-center">
            <LogoMark className="mx-auto h-12 w-12 opacity-60" />
            <p className="mt-4 font-serif text-xl text-primary">Novos imóveis chegando em breve</p>
            <p className="mt-2 text-sm text-ink/60">
              Enquanto isso, conte para a gente o que você procura.
            </p>
            <a
              href={whatsappLink("Olá! Estou procurando um imóvel e gostaria de ajuda.")}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ className: "mt-6" })}
            >
              <WhatsAppIcon className="h-4.5 w-4.5" />
              Falar no WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ChamadaWhatsApp() {
  return (
    <section className="container-site mt-28 sm:mt-36">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-primary px-6 py-14 sm:rounded-[2.5rem] sm:px-14 sm:py-16">
        <LogoMark
          tone="light"
          className="pointer-events-none absolute -top-12 -right-12 -z-10 h-80 w-80 opacity-[0.08]"
        />
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow tone="dark">Fale com a gente</Eyebrow>
            <h2 className="mt-5 text-3xl leading-tight text-white sm:text-4xl">
              Quer vender, alugar ou não encontrou o imóvel que procura?
            </h2>
            <p className="mt-4 max-w-xl text-white/70">
              Conte o que você precisa. Avaliamos seu imóvel e buscamos as melhores opções para você
              em {siteConfig.region}.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <a
              href={whatsappLink("Olá! Gostaria de falar sobre um imóvel.")}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "secondary", size: "lg" })}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chamar no WhatsApp
            </a>
            <Link
              href="/contato"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-white/25 px-7 font-semibold text-white transition hover:bg-white/10"
            >
              Enviar mensagem
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
