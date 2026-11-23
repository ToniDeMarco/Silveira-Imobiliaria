"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, Save } from "lucide-react";
import { salvarImovel } from "@/app/admin/actions";
import { imovelFormSchema, type ImovelFormValues } from "@/lib/validations/imovel";
import { siteConfig } from "@/config/site";
import { FINALIDADES, FINALIDADE_LABEL, STATUS, STATUS_LABEL, TIPOS, TIPO_LABEL } from "@/types/imovel";
import { buttonClasses } from "@/components/ui/button";
import { CaracteristicasInput } from "./caracteristicas-input";

const campo =
  "h-11 w-full rounded-xl border border-primary/10 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 aria-[invalid=true]:border-red-400";

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-primary/5 sm:p-7">
      <h2 className="text-xl text-primary">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-ink/55">{descricao}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Campo({
  rotulo,
  erro,
  dica,
  children,
  className = "",
}: {
  rotulo: string;
  erro?: string;
  dica?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{rotulo}</span>
      {children}
      {erro ? (
        <span className="mt-1 block text-xs text-red-600">{erro}</span>
      ) : dica ? (
        <span className="mt-1 block text-xs text-ink/45">{dica}</span>
      ) : null}
    </label>
  );
}

export function ImovelForm({ id, valoresIniciais }: { id: string | null; valoresIniciais: ImovelFormValues }) {
  const router = useRouter();
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvoEm, setSalvoEm] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ImovelFormValues>({
    resolver: zodResolver(imovelFormSchema),
    defaultValues: valoresIniciais,
  });

  async function onSubmit(valores: ImovelFormValues) {
    setErroGeral(null);
    setSalvoEm(null);
    const r = await salvarImovel(id, valores);
    if (!r.ok) {
      setErroGeral(r.erro);
      return;
    }
    if (!id) {
      router.push(`/admin/imoveis/${r.id}?novo=1`);
      return;
    }
    reset(valores);
    setSalvoEm(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    router.refresh();
  }

  const reg = (nome: keyof ImovelFormValues) => ({
    ...register(nome),
    "aria-invalid": errors[nome] ? true : undefined,
  });

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="space-y-6 pb-28">
      <Secao titulo="Informações básicas">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            rotulo="Título do anúncio *"
            erro={errors.titulo?.message}
            dica="O endereço da página (slug) é gerado a partir do título e do código."
            className="sm:col-span-2"
          >
            <input {...reg("titulo")} placeholder="Ex.: Casa ampla com piscina no Cidade Jardim" className={campo} />
          </Campo>
          <Campo rotulo="Finalidade *">
            <select {...reg("finalidade")} className={campo}>
              {FINALIDADES.map((f) => (
                <option key={f} value={f}>{FINALIDADE_LABEL[f]}</option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Tipo *">
            <select {...reg("tipo")} className={campo}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{TIPO_LABEL[t]}</option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Status" dica="Só imóveis “Publicado” aparecem no site.">
            <select {...reg("status")} className={campo}>
              {STATUS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </Campo>
          <div className="flex items-end">
            <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl px-1">
              <input type="checkbox" {...register("destaque")} className="peer sr-only" />
              <span className="relative h-6 w-11 rounded-full bg-stone-200 transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-500 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
              <span className="text-sm font-medium text-ink/75">Destacar na página inicial</span>
            </label>
          </div>
        </div>
      </Secao>

      <Secao titulo="Valores" descricao="Use o formato brasileiro: 780.000 ou 1.800,50. Deixe em branco para “Consulte”.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Campo rotulo="Preço (R$)" erro={errors.preco?.message}>
            <input {...reg("preco")} inputMode="decimal" placeholder="0,00" className={campo} />
          </Campo>
          <Campo rotulo="Condomínio (R$/mês)" erro={errors.condominio?.message}>
            <input {...reg("condominio")} inputMode="decimal" placeholder="0,00" className={campo} />
          </Campo>
          <Campo rotulo="IPTU (R$/ano)" erro={errors.iptu?.message}>
            <input {...reg("iptu")} inputMode="decimal" placeholder="0,00" className={campo} />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Medidas e cômodos">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["quartos", "Quartos"],
              ["suites", "Suítes"],
              ["banheiros", "Banheiros"],
              ["vagas", "Vagas"],
              ["area_construida", "Área constr. (m²)"],
              ["area_total", "Área total (m²)"],
            ] as const
          ).map(([nome, rotulo]) => (
            <Campo key={nome} rotulo={rotulo} erro={errors[nome]?.message}>
              <input {...reg(nome)} inputMode="decimal" className={campo} />
            </Campo>
          ))}
        </div>
      </Secao>

      <Secao titulo="Localização">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo rotulo="Cidade" erro={errors.cidade?.message}>
            <input {...reg("cidade")} placeholder={siteConfig.city} list="cidades-sugeridas" className={campo} />
            <datalist id="cidades-sugeridas">
              <option value={siteConfig.city} />
            </datalist>
          </Campo>
          <Campo rotulo="Bairro" erro={errors.bairro?.message}>
            <input {...reg("bairro")} className={campo} />
          </Campo>
          <Campo
            rotulo="Endereço completo (privado)"
            erro={errors.endereco?.message}
            dica="Não é exibido no site. Serve apenas para controle interno."
            className="sm:col-span-2"
          >
            <input {...reg("endereco")} className={campo} />
          </Campo>
          <Campo
            rotulo="Latitude"
            erro={errors.latitude?.message}
            dica="Dica: cole aqui as coordenadas copiadas do Google Maps (ex.: -15.7970, -43.3021)."
          >
            <input
              {...reg("latitude")}
              inputMode="decimal"
              placeholder="-15.7970"
              className={campo}
              onPaste={(e) => {
                const texto = e.clipboardData.getData("text");
                const partes = texto.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
                if (partes) {
                  e.preventDefault();
                  setValue("latitude", partes[1], { shouldDirty: true, shouldValidate: true });
                  setValue("longitude", partes[2], { shouldDirty: true, shouldValidate: true });
                }
              }}
            />
          </Campo>
          <Campo rotulo="Longitude" erro={errors.longitude?.message} dica="Com coordenadas, o mapa aparece na página do imóvel.">
            <input {...reg("longitude")} inputMode="decimal" placeholder="-43.3021" className={campo} />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Características" descricao="Diferenciais exibidos com ícone de check na página do imóvel.">
        <Controller
          control={control}
          name="caracteristicas"
          render={({ field }) => <CaracteristicasInput valor={field.value} onChange={field.onChange} />}
        />
      </Secao>

      <Secao titulo="Descrição">
        <Campo rotulo="Texto do anúncio" erro={errors.descricao?.message} dica="Use linhas em branco para separar parágrafos.">
          <textarea {...reg("descricao")} rows={8} className={`${campo} h-auto py-3 leading-relaxed`} />
        </Campo>
      </Secao>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/10 bg-white/90 backdrop-blur lg:left-64">
        <div className="flex items-center justify-end gap-4 px-4 py-3 sm:px-8">
          <div className="mr-auto text-sm" aria-live="polite">
            {erroGeral ? (
              <span className="text-red-600">{erroGeral}</span>
            ) : Object.keys(errors).length > 0 ? (
              <span className="text-red-600">Corrija os campos destacados.</span>
            ) : salvoEm && !isDirty ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CircleCheck className="h-4 w-4" aria-hidden="true" /> Alterações salvas às {salvoEm}
              </span>
            ) : isDirty ? (
              <span className="text-ink/50">Alterações não salvas</span>
            ) : null}
          </div>
          <button type="submit" disabled={isSubmitting} className={buttonClasses()}>
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {id ? "Salvar alterações" : "Criar imóvel e adicionar fotos"}
          </button>
        </div>
      </div>
    </form>
  );
}
