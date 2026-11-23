type Variant = "primary" | "secondary" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-800 hover:shadow-md",
  secondary: "bg-secondary text-primary-950 hover:bg-secondary-400",
  outline:
    "border border-primary/20 bg-white/60 text-primary hover:border-primary/40 hover:bg-white",
  ghost: "text-primary hover:bg-primary/5",
  light: "bg-white text-primary shadow-sm hover:bg-secondary-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

/** Classes de botão reutilizáveis em <button>, <Link> e <a>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}
