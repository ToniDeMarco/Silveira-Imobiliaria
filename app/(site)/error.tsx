"use client";

import { RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-site flex flex-col items-center py-24 text-center">
      <h1 className="text-3xl text-primary">Algo não saiu como esperado</h1>
      <p className="mt-3 max-w-md text-ink/60">
        Não foi possível carregar esta página agora. Tente novamente em instantes.
      </p>
      <button type="button" onClick={reset} className={buttonClasses({ className: "mt-8" })}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Tentar novamente
      </button>
    </section>
  );
}
