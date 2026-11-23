"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/** Diálogo de confirmação acessível (usa o <dialog> nativo do navegador). */
export function ConfirmDialog({
  aberto,
  titulo,
  children,
  textoConfirmar = "Excluir",
  pendente = false,
  onConfirmar,
  onCancelar,
}: {
  aberto: boolean;
  titulo: string;
  children?: ReactNode;
  textoConfirmar?: string;
  pendente?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!pendente) onCancelar();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-primary-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-7">
        <div className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-xl text-primary">{titulo}</h2>
            {children && <div className="mt-2 text-sm text-ink/65">{children}</div>}
          </div>
        </div>
        <div className="mt-7 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={pendente}
            className={buttonClasses({ variant: "ghost" })}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={pendente}
            className={buttonClasses({ className: "bg-red-600 hover:bg-red-700" })}
          >
            {pendente && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
