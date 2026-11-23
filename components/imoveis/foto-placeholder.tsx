import { LogoMark } from "@/components/site/logo";

/** Exibido quando o imóvel ainda não tem fotos. */
export function FotoPlaceholder({ texto = "Fotos em breve" }: { texto?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-secondary-100 via-secondary-50 to-primary-50">
      <svg
        className="absolute inset-0 h-full w-full text-primary/[0.05]"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="placeholder-linhas"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#placeholder-linhas)" />
      </svg>
      <LogoMark className="relative h-12 w-12 opacity-60" />
      <span className="relative text-xs font-semibold tracking-wide text-primary/55 uppercase">
        {texto}
      </span>
    </div>
  );
}
