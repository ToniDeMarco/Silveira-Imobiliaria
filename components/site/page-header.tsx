import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

type Crumb = { label: string; href?: string };

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb = [],
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumb?: Crumb[];
}) {
  return (
    <section className="container-site pt-10 pb-8 sm:pt-14">
      {breadcrumb.length > 0 && (
        <nav aria-label="Você está em" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink/50">
            <li>
              <Link href="/" className="hover:text-primary">
                Início
              </Link>
            </li>
            {breadcrumb.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink/70">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-primary sm:text-5xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-lg text-ink/65">{description}</p>}
    </section>
  );
}
