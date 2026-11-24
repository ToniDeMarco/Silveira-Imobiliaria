import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/format";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { LogoMark } from "@/components/site/logo";
import maoCelular from "@/public/images/hero-mao-celular.webp";
import maoCartao from "@/public/images/hero-mao-cartao.webp";

/**
 * Composição do hero no desktop: uma mão segura o celular (com o mapa de
 * imóveis na tela) e a outra segura o cartão de visita com os atalhos.
 *
 * As fotos das mãos têm a tela e o cartão recortados (transparentes): o mapa
 * e o cartão em HTML ficam ATRÁS da foto, então a moldura do celular e o
 * polegar sobre o cartão aparecem por cima, como na foto original.
 * As porcentagens abaixo vêm das medidas das imagens (860×1017 e 914×737).
 */
export function HeroMaos() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="relative container-site h-full">
        {/* Mão com o celular: o braço entra pela esquerda e some no escuro */}
        <div
          aria-hidden="true"
          className="animate-fade-up absolute bottom-0 left-[-8rem] w-[25rem] [animation-delay:300ms] [mask-image:linear-gradient(to_right,transparent,#000_16%)] xl:left-[-9rem] xl:w-[27.5rem]"
        >
          <div className="relative aspect-[860/1017]">
            <MapaCelular className="absolute top-[11.31%] left-[40.23%] h-[61.85%] w-[42.09%]" />
            <Image src={maoCelular} alt="" fill sizes="440px" className="object-contain" />
          </div>
        </div>

        {/* Mão com o cartão de visita (o cartão é clicável) */}
        <div className="animate-fade-up absolute top-[calc(46%-1.3rem)] left-[14.5rem] w-[41.25rem] [animation-delay:450ms] xl:left-[16.25rem]">
          <div className="relative aspect-[914/737]">
            <CartaoVisita />
            <Image src={maoCartao} alt="" fill sizes="660px" className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cartão de visita: CRECI e os três atalhos principais. */
function CartaoVisita() {
  const botao =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md text-[0.8rem] font-semibold transition-colors duration-200";

  return (
    <div className="pointer-events-auto absolute top-[3.9%] left-[5%] flex h-[40.6%] w-[51.4%] flex-col rounded-[0.45rem] bg-white px-[5.5%] pt-[4.4%] text-left shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55),0_8px_18px_-10px_rgb(0_0_0/0.4)]">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-9 w-9" />
        <div className="text-right leading-tight">
          <p className="text-[0.82rem] font-bold text-primary lining-nums">{siteConfig.creci}</p>
          <p className="mt-0.5 text-[0.68rem] text-ink/55">Imobiliária credenciada</p>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="my-3 h-px bg-linear-to-r from-secondary-500/80 via-secondary-400/40 to-transparent"
      />

      <Link href="/imoveis" className={`${botao} bg-primary text-white hover:bg-primary-800`}>
        Ver imóveis
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <div className="mt-2 flex gap-2">
        <a
          href={whatsappLink("Olá! Vim pelo site e gostaria de atendimento.")}
          target="_blank"
          rel="noopener noreferrer"
          className={`${botao} flex-[1.45] border border-primary/15 text-primary hover:border-secondary hover:bg-secondary hover:text-primary-950`}
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          Falar com corretor
        </a>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={`${botao} flex-1 border border-primary/15 text-primary hover:border-secondary hover:bg-secondary hover:text-primary-950`}
        >
          <InstagramIcon className="h-4 w-4 shrink-0" />
          Instagram
        </a>
      </div>
    </div>
  );
}

/* Pinos do mapa: posição no viewBox (300×520) e se é dourado (destaque). */
const PINOS: { x: number; y: number; destaque?: boolean }[] = [
  { x: 72, y: 150 },
  { x: 206, y: 214, destaque: true },
  { x: 118, y: 262 },
  { x: 244, y: 330 },
  { x: 58, y: 392 },
  { x: 182, y: 420, destaque: true },
  { x: 236, y: 470 },
  { x: 104, y: 482 },
];

/** Tela do celular: mapa ilustrado com os imóveis (decorativo). */
function MapaCelular({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 520"
      preserveAspectRatio="xMidYMid slice"
      className={`${className} font-sans`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="mapa-sombra" x="-20%" y="-40%" width="140%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0d1526" floodOpacity="0.16" />
        </filter>
      </defs>

      {/* Terreno, parque e rio */}
      <rect width="300" height="520" fill="#ecebe6" />
      <path d="M182 92 L292 70 L300 176 L238 196 L196 168 Z" fill="#d5e3cb" />
      <path d="M-10 404 L44 430 L30 520 L-10 520 Z" fill="#d5e3cb" />
      <path
        d="M-20 318 C 40 286 92 344 152 330 S 252 268 320 296"
        fill="none"
        stroke="#bcd5ea"
        strokeWidth="17"
        strokeLinecap="round"
      />

      {/* Ruas: malha levemente inclinada */}
      <g transform="rotate(-14 150 260)" stroke="#ffffff" strokeLinecap="round">
        <g strokeWidth="4.5">
          {[-40, 6, 52, 98, 144, 190, 236, 282, 328, 374, 420, 466, 512, 558].map((y) => (
            <line key={`h${y}`} x1="-120" y1={y} x2="420" y2={y} />
          ))}
          {[-60, -6, 48, 102, 156, 210, 264, 318, 372].map((x) => (
            <line key={`v${x}`} x1={x} y1="-120" x2={x} y2="640" />
          ))}
        </g>
        {/* Avenidas */}
        <line x1="-120" y1="236" x2="420" y2="236" strokeWidth="11" />
        <line x1="156" y1="-120" x2="156" y2="640" strokeWidth="9" stroke="#efdfbf" />
      </g>

      {/* Você está aqui */}
      <g transform="translate(142 372)">
        <circle className="mapa-pulso" r="16" fill="#456293" opacity="0.22" />
        <circle r="6.5" fill="#456293" stroke="#ffffff" strokeWidth="2.5" />
      </g>

      {/* Imóveis */}
      {PINOS.map(({ x, y, destaque }, i) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${destaque ? 1.22 : 1})`}>
          <g className="mapa-pino" style={{ animationDelay: `${700 + i * 90}ms` }}>
            <path
              d="M0 0 C-3 -6 -11 -10 -11 -18 A11 11 0 1 1 11 -18 C11 -10 3 -6 0 0 Z"
              fill={destaque ? "#c9a876" : "#1b2b4b"}
              stroke="#ffffff"
              strokeWidth="1.6"
              filter="url(#mapa-sombra)"
            />
            <path
              d="M-5.2 -17.2 L0 -22 L5.2 -17.2 V-12.6 H-5.2 Z"
              fill={destaque ? "#1b2b4b" : "#ffffff"}
            />
          </g>
        </g>
      ))}

      {/* Barra de busca e filtros, como no site */}
      <g filter="url(#mapa-sombra)">
        <rect x="14" y="18" width="272" height="36" rx="18" fill="#ffffff" />
      </g>
      <circle cx="35" cy="35" r="5.5" fill="none" stroke="#1b2b4b" strokeWidth="2" />
      <line x1="39" y1="39.5" x2="43" y2="43.5" stroke="#1b2b4b" strokeWidth="2" strokeLinecap="round" />
      <text x="52" y="40" fontSize="12.5" fill="#6b7280">
        Buscar imóveis
      </text>
      {[
        { x: 14, w: 52, t: "Casas", ativo: true },
        { x: 72, w: 92, t: "Apartamentos" },
        { x: 170, w: 66, t: "Terrenos" },
      ].map(({ x, w, t, ativo }) => (
        <g key={t} filter="url(#mapa-sombra)">
          <rect x={x} y="64" width={w} height="23" rx="11.5" fill={ativo ? "#1b2b4b" : "#ffffff"} />
          <text
            x={x + w / 2}
            y="79.5"
            fontSize="10.5"
            fontWeight="600"
            textAnchor="middle"
            fill={ativo ? "#ffffff" : "#1b2b4b"}
          >
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}
