import { useId } from "react";
import { siteConfig } from "@/config/site";

/**
 * Logo da Silveira Corretora — vetorizada a partir de `logo-silveira.png`
 * (432 × 345 px). Os prédios foram medidos pixel a pixel e os dois arcos
 * foram traçados do contorno do arquivo, então o desenho segue o original.
 * Todas as coordenadas abaixo estão em pixels da imagem original.
 */

type Tone = "dark" | "light";

/** Prédios, da esquerda para a direita (cada um anima separado no preloader). */
const PREDIOS = [
  "M159 151V110L173.5 90.5L187 110V151Z",
  "M196 151V78H233V151Z",
  "M249 151V53H286V110H308V132H326V151Z",
];

/** Faixa de base sob os prédios; a parte de baixo é recortada pelo arco. */
const BASE = { x: 138, y: 151, width: 207, height: 24 };

/** Arco de cima (passa sob a base e desce pela direita). */
const ARCO_TOPO =
  "M240.6 162.9C249 162.9 264.8 162.9 273.7 163.3C282.7 163.6 287.4 164.2 294.2 165C301 165.9 309.8 167.4 314.7 168.3C319.7 169.2 320.1 169.3 323.9 170.3C327.8 171.3 333.1 172.7 337.9 174.4C342.7 176.1 348.9 178.7 352.7 180.5C356.6 182.4 358.7 184 360.8 185.5C362.9 187 364 187.8 365.5 189.5C367.1 191.1 368.9 193.4 370 195.3C371 197.1 371.5 199 371.9 200.6C372.2 202.2 372.1 203.6 372 205C371.8 206.3 371.5 207.7 371 209C370.5 210.3 369.8 211.4 369 212.7C368.1 214.1 367.7 215.2 365.8 217.1C364 218.9 360.3 222 357.9 223.9C355.5 225.7 354 226.6 351.3 228.1C348.7 229.6 344.9 231.5 342.1 232.9C339.4 234.2 337.3 235 334.8 236C332.2 237 328.2 238.3 326.6 238.6C326.6 238.3 332.2 235.2 334.6 233.9C337 232.6 339.2 231.4 341.4 229.9C343.6 228.4 346.1 226.5 347.9 224.9C349.8 223.4 351.1 222.1 352.4 220.7C353.7 219.3 354.7 218 355.6 216.6C356.5 215.3 357.2 213.9 357.8 212.5C358.3 211.2 358.8 209.8 359 208.5C359.1 207.1 359.2 206 358.9 204.4C358.5 202.8 357.6 200.4 356.9 198.9C356.1 197.4 355.4 196.6 354.4 195.4C353.4 194.2 352.1 192.8 350.8 191.7C349.5 190.5 348.3 189.5 346.8 188.5C345.2 187.4 344.1 186.6 341.4 185.3C338.8 184 335.6 182.2 330.8 180.4C326 178.7 319.6 176.4 312.8 174.8C305.9 173.1 298.2 171.6 289.7 170.3C281.2 169.1 270 167.8 261.7 167.3C253.4 166.7 248.9 166.8 240 167C231.1 167.2 216.6 167.7 208.3 168.3C199.9 168.8 197.2 169.3 190 170.3C182.9 171.3 172.3 173.1 165.4 174.4C158.5 175.7 153.7 177 148.6 178.3C143.4 179.6 138.8 181 134.6 182.3C130.4 183.6 125.4 185.4 121.8 186C122.7 185 122.8 184.7 126.3 183.3C129.8 182 137.6 178.9 142.8 177.3C147.9 175.6 151.7 174.6 157.1 173.3C162.4 172 170 170.4 174.9 169.4C179.7 168.4 180.4 168.1 186.3 167.3C192.2 166.5 204.4 165 210.5 164.3C216.7 163.6 218.3 163.5 223.3 163.3C228.3 163 232.2 162.9 240.6 162.9Z";

/** Arco de baixo (começa à esquerda e afina para a direita). */
const ARCO_BAIXO =
  "M131 197.4C129.2 199 122.5 202.5 119.6 204.4C116.7 206.3 115.3 207.8 113.8 209.3C112.4 210.9 111.5 212.3 110.8 213.5C110.1 214.7 109.8 215.2 109.5 216.5C109.3 217.9 109.3 220.2 109.5 221.5C109.6 222.8 110 223.3 110.5 224.2C111 225.1 111.7 226.1 112.4 227.1C113.2 228 114 228.8 115.2 229.8C116.4 230.7 118.2 231.9 119.5 232.8C120.8 233.6 121.4 234 123.2 234.8C124.9 235.7 126.7 236.6 130.2 237.8C133.7 239 139 240.7 144.1 241.9C149.2 243.1 155.5 244.2 160.8 244.9C166.2 245.7 173.1 246 179.3 247C184 247.1 197.9 247.3 204.8 247.3C211.6 247.2 214.4 247.1 220.5 246.7C226.6 246.4 234.3 245.8 241.2 245C248.1 244.1 256.3 242.9 262.2 241.9C268 240.9 271.2 240.2 276.4 238.9C281.5 237.6 290 234.9 294.2 234.3C293.5 235 289.8 236.9 281.7 239.9C277 241.4 270.9 243.3 263.8 245C256.6 246.7 245.5 249 238.9 250.1C232.3 251.3 224.2 252 224.2 252C210.5 252.3 171.2 252.7 156.5 252.2C141.8 251.8 141.9 250.3 135.9 249.1C129.9 247.9 125.2 246.5 120.7 245C116.3 243.5 112 241.4 109.3 240C106.5 238.6 105.6 237.8 104.2 236.8C102.8 235.7 102 234.8 101 233.8C100 232.7 99 231.5 98.4 230.4C97.7 229.2 97.3 228.4 97 227C96.8 225.5 96.9 223 97.1 221.6C97.3 220.2 97.6 219.6 98.2 218.4C98.8 217.3 99.7 216 100.6 214.9C101.6 213.7 102.5 212.7 103.9 211.4C105.4 210.2 107.2 208.6 109.2 207.2C111.2 205.9 112.6 205 116 203.3C119.5 201.6 127.4 198.2 131 197.4Z";

/** Dourado metálico como no original; o tom escuro é para fundos claros. */
const DOURADO: Record<Tone, [string, string][]> = {
  light: [
    ["0", "#fbe7a1"],
    [".3", "#e6b444"],
    [".55", "#b7821d"],
    [".8", "#e9c25c"],
    ["1", "#b07a18"],
  ],
  dark: [
    ["0", "#c99a35"],
    [".35", "#a8761a"],
    [".6", "#7d560f"],
    [".85", "#b3852a"],
    ["1", "#8a5f14"],
  ],
};

/** IDs únicos por instância (gradiente e máscara não podem colidir na página). */
function useIds() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return { grad: `logo-g-${id}`, mask: `logo-m-${id}` };
}

function Defs({ tone, ids }: { tone: Tone; ids: ReturnType<typeof useIds> }) {
  return (
    <defs>
      <linearGradient id={ids.grad} x1="0" y1="0" x2="0.35" y2="1">
        {DOURADO[tone].map(([offset, cor]) => (
          <stop key={offset} offset={offset} stopColor={cor} />
        ))}
      </linearGradient>
      {/* Recorte da base: o arco de cima passa por baixo dela com uma folga */}
      <mask id={ids.mask} maskUnits="userSpaceOnUse" x="90" y="40" width="300" height="250">
        <rect x="90" y="40" width="300" height="250" fill="#fff" />
        <path d={ARCO_TOPO} fill="#000" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
        <ellipse cx="234" cy="208" rx="128" ry="42" fill="#000" />
      </mask>
    </defs>
  );
}

/** Prédios + base. `data-predio`/`data-base` são usados pela animação do preloader. */
function Predios({ ids }: { ids: ReturnType<typeof useIds> }) {
  return (
    <g fill={`url(#${ids.grad})`}>
      {PREDIOS.map((d, i) => (
        <path key={i} d={d} data-predio={i} />
      ))}
      <rect {...BASE} mask={`url(#${ids.mask})`} data-base="" />
    </g>
  );
}

/** Somente o símbolo (prédios), para favicon, preloader, selos e espaços pequenos. */
export function LogoMark({
  tone = "dark",
  className = "h-10 w-10",
}: {
  tone?: Tone;
  className?: string;
}) {
  const ids = useIds();
  return (
    <svg viewBox="134 49 215 130" className={className} aria-hidden="true">
      <Defs tone={tone} ids={ids} />
      <Predios ids={ids} />
    </svg>
  );
}

/**
 * Logo completa.
 * - `horizontal` (padrão): prédios + nome ao lado. Legível em alturas pequenas
 *   (cabeçalho, painel).
 * - `vertical`: a composição original, com os arcos em volta do nome. Use em
 *   tamanhos grandes (rodapé, login).
 */
export function Logo({
  tone = "dark",
  variante = "horizontal",
  className = "h-14 w-auto",
}: {
  tone?: Tone;
  variante?: "horizontal" | "vertical";
  className?: string;
}) {
  const ids = useIds();
  const fill = `url(#${ids.grad})`;
  const nome = siteConfig.shortName;
  const sub = siteConfig.tagline;

  if (variante === "vertical") {
    return (
      <svg viewBox="92 46 284 242" className={className} role="img" aria-label={siteConfig.name}>
        <Defs tone={tone} ids={ids} />
        <Predios ids={ids} />
        <path d={ARCO_TOPO} fill={fill} />
        <path d={ARCO_BAIXO} fill={fill} />
        <text
          x="154"
          y="221"
          textLength="162"
          lengthAdjust="spacing"
          className="font-sans"
          fontSize="40"
          fontWeight="800"
          fill={fill}
        >
          {nome}
        </text>
        <text
          x="97"
          y="281"
          textLength="274"
          lengthAdjust="spacing"
          className="font-sans"
          fontSize="25.5"
          fontWeight="700"
          fill={fill}
        >
          {sub}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="134 49 526 130" className={className} role="img" aria-label={siteConfig.name}>
      <Defs tone={tone} ids={ids} />
      <Predios ids={ids} />
      <text
        x="372"
        y="124"
        textLength="284"
        lengthAdjust="spacing"
        className="font-sans"
        fontSize="80"
        fontWeight="800"
        letterSpacing="-1.5"
        fill={fill}
      >
        {nome}
      </text>
      <text
        x="373"
        y="168"
        textLength="283"
        lengthAdjust="spacing"
        className="font-sans"
        fontSize="28"
        fontWeight="700"
        fill={fill}
      >
        {sub}
      </text>
    </svg>
  );
}
