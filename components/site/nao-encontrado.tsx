import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { LogoMark } from "./logo";

export function NaoEncontrado() {
  return (
    <section className="container-site flex flex-col items-center py-24 text-center sm:py-32">
      <LogoMark className="h-16 w-16" />
      <p className="mt-6 font-serif text-7xl text-secondary-500">404</p>
      <h1 className="mt-2 text-3xl text-primary sm:text-4xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-ink/60">
        O endereço pode ter mudado ou o imóvel não está mais disponível. Que tal ver as opções
        atuais?
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/imoveis" className={buttonClasses()}>
          Ver imóveis disponíveis
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/" className={buttonClasses({ variant: "outline" })}>
          Ir para o início
        </Link>
      </div>
    </section>
  );
}
