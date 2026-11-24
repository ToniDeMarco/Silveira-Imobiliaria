import Form from "next/form";
import { Building2, MapPin, Search } from "lucide-react";
import { getOpcoesFiltro } from "@/lib/data/imoveis";
import { siteConfig } from "@/config/site";
import { TIPOS, TIPO_LABEL } from "@/types/imovel";

const selectClasses =
  "w-full appearance-none bg-transparent text-sm font-semibold text-primary outline-none cursor-pointer";

/** Busca rápida do hero: finalidade, tipo e cidade → /imoveis?... */
export async function BuscaRapida() {
  const { cidades } = await getOpcoesFiltro();
  const listaCidades = cidades.length ? cidades : [siteConfig.city];

  return (
    <Form
      action="/imoveis"
      className="bg-white p-3 shadow-[0_24px_60px_-24px_rgba(12,18,32,0.35)] ring-1 ring-primary/5 sm:p-4"
    >
      <fieldset className="mb-3 flex gap-1 rounded-md bg-surface p-1 sm:w-fit">
        <legend className="sr-only">Finalidade</legend>
        {[
          { value: "venda", label: "Comprar" },
          { value: "aluguel", label: "Alugar" },
        ].map((op, i) => (
          <label key={op.value} className="flex-1 cursor-pointer sm:flex-none">
            <input
              type="radio"
              name="finalidade"
              value={op.value}
              defaultChecked={i === 0}
              className="peer sr-only"
            />
            <span className="block rounded-md px-6 py-2 text-center text-sm font-semibold text-ink/60 transition peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-500">
              {op.label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-0">
        <label className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface sm:border-r sm:border-primary/10">
          <Building2 className="h-5 w-5 shrink-0 text-secondary-600" aria-hidden="true" />
          <span className="flex flex-1 flex-col">
            <span className="text-xs text-ink/50">Tipo de imóvel</span>
            <select name="tipo" defaultValue="" className={selectClasses}>
              <option value="">Todos os tipos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABEL[t]}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface">
          <MapPin className="h-5 w-5 shrink-0 text-secondary-600" aria-hidden="true" />
          <span className="flex flex-1 flex-col">
            <span className="text-xs text-ink/50">Cidade</span>
            <select name="cidade" defaultValue="" className={selectClasses}>
              <option value="">Todas as cidades</option>
              {listaCidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="submit"
          className="flex h-14 items-center justify-center gap-2 rounded-md bg-primary px-8 font-semibold text-white transition hover:bg-primary-800"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Buscar
        </button>
      </div>
    </Form>
  );
}
