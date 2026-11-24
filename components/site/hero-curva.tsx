/**
 * Curva orgânica que separa o texto e a foto do hero.
 *
 * Técnica: SVG <clipPath clipPathUnits="objectBoundingBox">. As coordenadas
 * vão de 0 a 1 e se adaptam a qualquer largura/altura do elemento recortado,
 * sem distorcer a foto (que usa object-fit: cover).
 *
 * Cada curva é formada por segmentos Bézier cúbicos com tangentes alinhadas
 * nas emendas (contínua, sem quinas). Para ajustar o formato, altere apenas
 * os pontos de CURVA_DESKTOP / CURVA_MOBILE — a faixa translúcida acompanha.
 */

/**
 * Borda esquerda da foto no desktop (de cima para baixo), em forma de S:
 * começa a 36% da largura, desce por trás do título até ~16% na altura do
 * cartão de visita e depois abre para a direita (~50% na base), contornando
 * a mão que segura o cartão — assim a faixa fica visível de cima até embaixo.
 */
const CURVA_DESKTOP = (dx = 0) =>
  [
    `M${0.36 + dx} 0`,
    `C${0.28 + dx} 0.06 ${0.24 + dx} 0.16 ${0.21 + dx} 0.27`,
    `C${0.18 + dx} 0.36 ${0.16 + dx} 0.46 ${0.17 + dx} 0.56`,
    `C${0.18 + dx} 0.64 ${0.21 + dx} 0.69 ${0.27 + dx} 0.735`,
    `C${0.33 + dx} 0.78 ${0.45 + dx} 0.82 ${0.49 + dx} 0.9`,
    `C${0.51 + dx} 0.94 ${0.51 + dx} 0.97 ${0.51 + dx} 1`,
  ].join(" ");

/** Borda superior da foto no celular (da esquerda para a direita). */
const CURVA_MOBILE = (dy = 0) =>
  [
    `M0 ${0.2 + dy}`,
    `C0.18 ${0.05 + dy} 0.4 ${0.02 + dy} 0.58 ${0.12 + dy}`,
    `C0.76 ${0.22 + dy} 0.89 ${0.17 + dy} 1 ${0.06 + dy}`,
  ].join(" ");

/** Deslocamento da faixa translúcida em relação à curva (fração do elemento). */
const FAIXA_DESKTOP = 0.035;
const FAIXA_MOBILE = 0.07;

export const CLIP_FOTO_DESKTOP = "hero-curva-desktop";
export const CLIP_FAIXA_DESKTOP = "hero-faixa-desktop";
export const CLIP_FOTO_MOBILE = "hero-curva-mobile";
export const CLIP_FAIXA_MOBILE = "hero-faixa-mobile";

/** Renderize uma vez dentro do hero; os elementos usam clip-path: url(#id). */
export function HeroCurvaDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <defs>
        {/* Foto (desktop): tudo à direita da curva */}
        <clipPath id={CLIP_FOTO_DESKTOP} clipPathUnits="objectBoundingBox">
          <path d={`${CURVA_DESKTOP()} L1 1 L1 0 Z`} />
        </clipPath>
        {/* Faixa translúcida (desktop): área à esquerda da curva deslocada.
            Combinada ao recorte da foto, vira uma faixa que acompanha a borda. */}
        <clipPath id={CLIP_FAIXA_DESKTOP} clipPathUnits="objectBoundingBox">
          <path d={`${CURVA_DESKTOP(FAIXA_DESKTOP)} L0 1 L0 0 Z`} />
        </clipPath>

        {/* Foto (celular): tudo abaixo da curva */}
        <clipPath id={CLIP_FOTO_MOBILE} clipPathUnits="objectBoundingBox">
          <path d={`${CURVA_MOBILE()} L1 1 L0 1 Z`} />
        </clipPath>
        {/* Faixa translúcida (celular): área acima da curva deslocada */}
        <clipPath id={CLIP_FAIXA_MOBILE} clipPathUnits="objectBoundingBox">
          <path d={`${CURVA_MOBILE(FAIXA_MOBILE)} L1 0 L0 0 Z`} />
        </clipPath>
      </defs>
    </svg>
  );
}
