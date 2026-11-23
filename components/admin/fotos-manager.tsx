"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CircleAlert, GripVertical, ImagePlus, LoaderCircle, Star, Trash2, X } from "lucide-react";
import { definirCapa, excluirFoto, registrarFoto, reordenarFotos } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { MAX_FOTOS_POR_ENVIO, TIPOS_ACEITOS } from "@/lib/fotos";
import { processarEEnviarFoto, type EtapaUpload } from "@/lib/fotos-upload";
import type { FotoImovel } from "@/types/imovel";
import { ConfirmDialog } from "./confirm-dialog";

type Upload = {
  id: string;
  nome: string;
  preview: string;
  progresso: number;
  etapa: EtapaUpload | "aguardando";
  erro?: string;
};

const SIMULTANEOS = 3;

export function FotosManager({ imovelId, fotosIniciais }: { imovelId: string; fotosIniciais: FotoImovel[] }) {
  const [fotos, setFotos] = useState<FotoImovel[]>(fotosIniciais);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluir, setExcluir] = useState<FotoImovel | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const atualizarUpload = (id: string, dados: Partial<Upload>) =>
    setUploads((lista) => lista.map((u) => (u.id === id ? { ...u, ...dados } : u)));

  const removerUpload = (id: string) =>
    setUploads((lista) => {
      const item = lista.find((u) => u.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return lista.filter((u) => u.id !== id);
    });

  const enviarArquivos = useCallback(
    async (arquivos: File[]) => {
      setErro(null);
      const imagens = arquivos.filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
      if (imagens.length === 0) return setErro("Selecione arquivos de imagem (JPG, PNG, WebP ou HEIC).");
      if (imagens.length > MAX_FOTOS_POR_ENVIO) {
        setErro(`Envie no máximo ${MAX_FOTOS_POR_ENVIO} fotos por vez.`);
        imagens.length = MAX_FOTOS_POR_ENVIO;
      }

      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return setErro("Sua sessão expirou. Entre novamente no painel.");

      const fila = imagens.map((arquivo) => ({
        arquivo,
        item: {
          id: crypto.randomUUID(),
          nome: arquivo.name,
          preview: URL.createObjectURL(arquivo),
          progresso: 0,
          etapa: "aguardando" as const,
        },
      }));
      setUploads((lista) => [...lista, ...fila.map((f) => f.item)]);

      let proximo = 0;
      const trabalhador = async () => {
        while (proximo < fila.length) {
          const { arquivo, item } = fila[proximo++];
          try {
            const { caminho, caminhoThumb } = await processarEEnviarFoto(arquivo, imovelId, token, (p, etapa) =>
              atualizarUpload(item.id, { progresso: Math.round(p), etapa }),
            );
            const r = await registrarFoto({ imovelId, caminho, caminhoThumb });
            if (!r.ok) throw new Error(r.erro);
            setFotos((lista) => [...lista, r.foto]);
            removerUpload(item.id);
          } catch (e) {
            atualizarUpload(item.id, { erro: e instanceof Error ? e.message : "Falha no envio." });
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(SIMULTANEOS, fila.length) }, trabalhador));
    },
    [imovelId],
  );

  async function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    const anterior = fotos;
    const de = fotos.findIndex((f) => f.id === active.id);
    const para = fotos.findIndex((f) => f.id === over.id);
    const nova = arrayMove(fotos, de, para).map((f, ordem) => ({ ...f, ordem }));
    setFotos(nova);
    const r = await reordenarFotos(imovelId, nova.map((f) => f.id));
    if (!r.ok) {
      setFotos(anterior);
      setErro(`Não foi possível salvar a nova ordem: ${r.erro}`);
    }
  }

  async function marcarCapa(foto: FotoImovel) {
    const anterior = fotos;
    setFotos((lista) => lista.map((f) => ({ ...f, capa: f.id === foto.id })));
    const r = await definirCapa(imovelId, foto.id);
    if (!r.ok) {
      setFotos(anterior);
      setErro(`Não foi possível definir a capa: ${r.erro}`);
    }
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    setExcluindo(true);
    const r = await excluirFoto(excluir.id);
    setExcluindo(false);
    if (!r.ok) {
      setErro(r.erro);
    } else {
      setFotos((lista) =>
        lista
          .filter((f) => f.id !== excluir.id)
          .map((f) => (r.novaCapaId ? { ...f, capa: f.id === r.novaCapaId } : f)),
      );
    }
    setExcluir(null);
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-primary/5 sm:p-7" aria-labelledby="fotos-titulo">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="fotos-titulo" className="text-xl text-primary">
            Fotos <span className="text-base text-ink/40">({fotos.length})</span>
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            Arraste para reordenar. A foto marcada como <strong>capa</strong> aparece primeiro no site.
          </p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void enviarArquivos(Array.from(e.dataTransfer.files));
        }}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          arrastando ? "border-secondary-500 bg-secondary-50" : "border-primary/15 hover:border-primary/30 hover:bg-surface"
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary-100 text-primary">
          <ImagePlus className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-4 font-semibold text-primary">Arraste as fotos aqui ou clique para selecionar</p>
        <p className="mt-1 text-xs text-ink/50">
          JPG, PNG, WebP ou HEIC · as fotos são otimizadas automaticamente antes do envio
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEITOS}
          multiple
          className="sr-only"
          onChange={(e) => {
            const arquivos = Array.from(e.target.files ?? []);
            e.target.value = "";
            void enviarArquivos(arquivos);
          }}
        />
      </div>

      {erro && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{erro}</span>
          <button type="button" onClick={() => setErro(null)} aria-label="Fechar aviso">
            <X className="h-4 w-4" />
          </button>
        </p>
      )}

      {uploads.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Envios em andamento">
          {uploads.map((u) => (
            <li key={u.id} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-primary/5">
              <div className="relative aspect-[4/3]">
                {/* Preview local (blob:) — não passa pelo otimizador do Next. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.preview} alt="" className="h-full w-full object-cover opacity-70" />
                {u.erro && (
                  <button
                    type="button"
                    onClick={() => removerUpload(u.id)}
                    className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-md bg-white text-ink shadow"
                    aria-label="Remover da lista"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-ink/70" title={u.nome}>{u.nome}</p>
                {u.erro ? (
                  <p className="mt-1 text-xs text-red-600">{u.erro}</p>
                ) : (
                  <>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10"
                      role="progressbar"
                      aria-valuenow={u.progresso}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Envio de ${u.nome}`}
                    >
                      <div className="h-full rounded-full bg-secondary-500 transition-all duration-300" style={{ width: `${u.progresso}%` }} />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] text-ink/50">
                      <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
                      {u.etapa === "aguardando" ? "Na fila" : u.etapa === "comprimindo" ? "Otimizando" : "Enviando"} · {u.progresso}%
                    </p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {fotos.length > 0 && (
        <DndContext id="fotos-dnd" sensors={sensores} collisionDetection={closestCenter} onDragEnd={(e) => void aoSoltar(e)}>
          <SortableContext items={fotos.map((f) => f.id)} strategy={rectSortingStrategy}>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {fotos.map((foto, i) => (
                <FotoItem
                  key={foto.id}
                  foto={foto}
                  posicao={i + 1}
                  onCapa={() => void marcarCapa(foto)}
                  onExcluir={() => setExcluir(foto)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        aberto={excluir !== null}
        titulo="Excluir esta foto?"
        pendente={excluindo}
        onCancelar={() => setExcluir(null)}
        onConfirmar={() => void confirmarExclusao()}
      >
        A foto e a miniatura serão removidas do site e do armazenamento.
      </ConfirmDialog>
    </section>
  );
}

function FotoItem({
  foto,
  posicao,
  onCapa,
  onExcluir,
}: {
  foto: FotoImovel;
  posicao: number;
  onCapa: () => void;
  onExcluir: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: foto.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative overflow-hidden rounded-2xl bg-surface ring-1 ${
        foto.capa ? "ring-2 ring-secondary-500" : "ring-primary/5"
      } ${isDragging ? "z-10 scale-105 shadow-2xl" : ""}`}
    >
      <div className="relative aspect-[4/3]">
        <Image src={foto.url_thumb} alt={`Foto ${posicao}`} fill sizes="240px" className="object-cover" />
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 grid h-8 w-8 cursor-grab touch-none place-items-center rounded-md bg-white/95 text-ink/70 shadow active:cursor-grabbing"
          aria-label={`Arrastar foto ${posicao} para reordenar`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {foto.capa && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary-950 shadow">
            <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Capa
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 p-2">
        <span className="pl-1 text-xs text-ink/45">#{posicao}</span>
        <div className="flex gap-1">
          {!foto.capa && (
            <button
              type="button"
              onClick={onCapa}
              className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-ink/60 transition hover:bg-secondary-100 hover:text-primary"
            >
              <Star className="h-3.5 w-3.5" aria-hidden="true" /> Capa
            </button>
          )}
          <button
            type="button"
            onClick={onExcluir}
            className="grid h-7 w-7 place-items-center rounded-md text-ink/50 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Excluir foto ${posicao}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
