"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirLead } from "@/app/admin/actions";
import { ConfirmDialog } from "./confirm-dialog";

export function ExcluirLeadBotao({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="grid h-8 w-8 place-items-center rounded-md text-ink/40 transition hover:bg-red-50 hover:text-red-600"
        aria-label={`Excluir lead de ${nome}`}
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {erro && <span className="text-xs text-red-600" role="alert">{erro}</span>}
      <ConfirmDialog
        aberto={aberto}
        titulo="Excluir este lead?"
        pendente={pendente}
        onCancelar={() => setAberto(false)}
        onConfirmar={() =>
          startTransition(async () => {
            const r = await excluirLead(id);
            setAberto(false);
            if (r.ok) router.refresh();
            else setErro(r.erro);
          })
        }
      >
        O contato de <strong>{nome}</strong> será removido permanentemente.
      </ConfirmDialog>
    </>
  );
}
