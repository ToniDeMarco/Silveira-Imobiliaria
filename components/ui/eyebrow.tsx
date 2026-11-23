import type { ReactNode } from "react";

/** Selo pequeno acima dos títulos (inspirado na referência). */
export function Eyebrow({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  const cores =
    tone === "light"
      ? "bg-secondary-100 text-primary-800 ring-secondary-200"
      : "bg-white/10 text-secondary-200 ring-white/15 backdrop-blur";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${cores}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-secondary-500" aria-hidden="true" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-3xl leading-tight text-primary sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-ink/65 sm:text-lg">{description}</p>}
    </div>
  );
}
