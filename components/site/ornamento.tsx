import { LogoMark } from "./logo";

/**
 * Filete clássico: duas linhas douradas que se apagam nas pontas, com o
 * chaveiro da marca ao centro. Usado para abrir seções de destaque.
 */
export function Ornamento({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-secondary-500/70" />
      <LogoMark className="h-7 w-7 shrink-0" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-secondary-500/70" />
    </div>
  );
}
