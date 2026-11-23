"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, ExternalLink, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { alterarStatus, duplicarImovel, excluirImovel } from "@/app/admin/actions";
import { STATUS, STATUS_LABEL, type StatusImovel } from "@/types/imovel";
import { STATUS_CORES } from "./ui";
import { ConfirmDialog } from "./confirm-dialog";

/** Troca rápida de status direto na listagem. */
export function StatusSelect({ id, status }: { id: string; status: StatusImovel }) {
  const router = useRouter();
  const [valor, setValor] = useState(status);
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <select
        value={valor}
        disabled={pendente}
        aria-label="Alterar status"
        onChange={(e) => {
          const novo = e.target.value as StatusImovel;
          const anterior = valor;
          setValor(novo);
          setErro(null);
          startTransition(async () => {
            const r = await alterarStatus(id, novo);
            if (!r.ok) {
              setValor(anterior);
              setErro(r.erro);
            }
            router.refresh();
          });
        }}
        className={`cursor-pointer rounded-full py-1 pr-7 pl-3 text-xs font-semibold ring-1 outline-none ${STATUS_CORES[valor]}`}
      >
        {STATUS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {pendente && <LoaderCircle className="h-4 w-4 animate-spin text-ink/40" aria-label="Salvando" />}
      {erro && <span className="text-xs text-red-600" role="alert">{erro}</span>}
    </div>
  );
}

const botaoIcone =
  "grid h-9 w-9 place-items-center rounded-md text-ink/55 transition hover:bg-primary/5 hover:text-primary disabled:opacity-50";

export function ImovelAcoes({
  id,
  codigo,
  titulo,
  slug,
  publicado,
  naPaginaDeEdicao = false,
}: {
  id: string;
  codigo: string;
  titulo: string;
  slug: string;
  publicado: boolean;
  /** Na tela de edição: esconde "Editar" e volta para a lista após excluir. */
  naPaginaDeEdicao?: boolean;
}) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-end gap-0.5">
      {!naPaginaDeEdicao && (
        <Link href={`/admin/imoveis/${id}`} className={botaoIcone} title="Editar" aria-label={`Editar ${codigo}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      )}
      {publicado && (
        <a
          href={`/imoveis/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={botaoIcone}
          title="Ver no site"
          aria-label={`Ver ${codigo} no site`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <button
        type="button"
        className={botaoIcone}
        title="Duplicar"
        aria-label={`Duplicar ${codigo}`}
        disabled={pendente}
        onClick={() =>
          startTransition(async () => {
            const r = await duplicarImovel(id);
            if (r.ok) router.push(`/admin/imoveis/${r.id}`);
            else setErro(r.erro);
          })
        }
      >
        {pendente && !confirmar ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      </button>
      <button
        type="button"
        className={`${botaoIcone} hover:bg-red-50 hover:text-red-600`}
        title="Excluir"
        aria-label={`Excluir ${codigo}`}
        onClick={() => setConfirmar(true)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {erro && <span className="ml-2 text-xs text-red-600" role="alert">{erro}</span>}

      <ConfirmDialog
        aberto={confirmar}
        titulo={`Excluir o imóvel ${codigo}?`}
        pendente={pendente}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={() =>
          startTransition(async () => {
            const r = await excluirImovel(id);
            if (r.ok) {
              setConfirmar(false);
              if (naPaginaDeEdicao) router.push("/admin/imoveis");
              else router.refresh();
            } else {
              setErro(r.erro);
              setConfirmar(false);
            }
          })
        }
      >
        <p>
          <strong>{titulo}</strong> e todas as suas fotos serão apagados permanentemente. Esta ação
          não pode ser desfeita.
        </p>
      </ConfirmDialog>
    </div>
  );
}
