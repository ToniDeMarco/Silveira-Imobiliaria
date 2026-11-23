"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";
import type { FotoImovel } from "@/types/imovel";
import { FotoPlaceholder } from "./foto-placeholder";

type Foto = Pick<FotoImovel, "id" | "url" | "url_thumb">;

export function Galeria({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [aberta, setAberta] = useState<number | null>(null);

  if (fotos.length === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] sm:aspect-[21/9]">
        <FotoPlaceholder />
      </div>
    );
  }

  const laterais = fotos.slice(1, 5);
  const restantes = fotos.length - 5;

  return (
    <>
      <div className="grid gap-2 sm:gap-3 md:h-[30rem] md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => setAberta(0)}
          className={`group relative aspect-[4/3] overflow-hidden rounded-[1.75rem] md:aspect-auto ${
            laterais.length ? "md:col-span-2 md:row-span-2" : "md:col-span-4 md:row-span-2"
          }`}
          aria-label="Abrir galeria de fotos"
        >
          <Image
            src={fotos[0].url}
            alt={`${titulo} — foto 1`}
            fill
            preload
            sizes="(min-width: 768px) 640px, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <span className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-primary shadow md:hidden">
            <Images className="h-4 w-4" aria-hidden="true" />
            {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
          </span>
        </button>

        {laterais.map((foto, i) => {
          const indice = i + 1;
          const ultima = i === laterais.length - 1;
          return (
            <button
              key={foto.id}
              type="button"
              onClick={() => setAberta(indice)}
              className={`group relative hidden overflow-hidden md:block ${
                i === 1 ? "rounded-tr-[1.75rem]" : ""
              } ${i === 3 ? "rounded-br-[1.75rem]" : ""} rounded-xl`}
              aria-label={`Abrir foto ${indice + 1}`}
            >
              <Image
                src={foto.url_thumb}
                alt={`${titulo} — foto ${indice + 1}`}
                fill
                sizes="320px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              {ultima && restantes > 0 && (
                <span className="absolute inset-0 grid place-items-center bg-primary-950/55 text-lg font-semibold text-white">
                  +{restantes} fotos
                </span>
              )}
            </button>
          );
        })}
      </div>

      {fotos.length > 1 && (
        <button
          type="button"
          onClick={() => setAberta(0)}
          className="mt-3 hidden items-center gap-2 text-sm font-semibold text-primary hover:underline md:inline-flex"
        >
          <Expand className="h-4 w-4" aria-hidden="true" />
          Ver todas as {fotos.length} fotos
        </button>
      )}

      {aberta !== null && (
        <Lightbox fotos={fotos} titulo={titulo} inicial={aberta} onClose={() => setAberta(null)} />
      )}
    </>
  );
}

function Lightbox({
  fotos,
  titulo,
  inicial,
  onClose,
}: {
  fotos: Foto[];
  titulo: string;
  inicial: number;
  onClose: () => void;
}) {
  const [indice, setIndice] = useState(inicial);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const toqueX = useRef<number | null>(null);
  const total = fotos.length;

  const ir = useCallback((delta: number) => setIndice((i) => (i + delta + total) % total), [total]);

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    fecharRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      anterior?.focus();
    };
  }, [ir, onClose]);

  const foto = fotos[indice];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      className="fixed inset-0 z-[70] flex flex-col bg-primary-950/97 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <p className="text-sm font-medium text-white/80" aria-live="polite">
          {indice + 1} / {total}
        </p>
        <button
          ref={fecharRef}
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-md transition hover:bg-white/10"
          aria-label="Fechar galeria"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="relative flex-1 select-none"
        onTouchStart={(e) => (toqueX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toqueX.current === null) return;
          const dx = e.changedTouches[0].clientX - toqueX.current;
          if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
          toqueX.current = null;
        }}
      >
        <Image
          key={foto.id}
          src={foto.url}
          alt={`${titulo} — foto ${indice + 1}`}
          fill
          sizes="100vw"
          className="animate-fade-up object-contain px-2 [animation-duration:0.35s] sm:px-20"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(-1)}
              className="absolute top-1/2 left-2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-md bg-white/10 text-white transition hover:bg-white/20 sm:left-5"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => ir(1)}
              className="absolute top-1/2 right-2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-md bg-white/10 text-white transition hover:bg-white/20 sm:right-5"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === indice}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                i === indice ? "ring-2 ring-secondary-300" : "opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={f.url_thumb} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
