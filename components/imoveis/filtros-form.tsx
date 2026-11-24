import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import { filtrosParaQuery, type FiltrosImoveis } from "@/lib/filtros";
import type { OpcoesFiltro } from "@/lib/data/imoveis";
import { TIPOS, TIPO_LABEL } from "@/types/imovel";
import { buttonClasses } from "@/components/ui/button";

const campo =
  "h-11 w-full border border-primary/10 bg-white px-3.5 text-sm text-ink outline-none transition focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20";

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink/55 uppercase">
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

function Pilulas({
  name,
  opcoes,
  valor,
}: {
  name: string;
  opcoes: { value: string; label: string }[];
  valor: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map((op) => (
        <label key={op.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={op.value}
            defaultChecked={valor === op.value}
            className="peer sr-only"
          />
          <span className="inline-block rounded-md border border-primary/10 bg-white px-3 py-1.5 text-sm font-medium text-ink/70 transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-500 hover:border-primary/30">
            {op.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * Formulário GET: os filtros vão para a query string (?tipo=casa&quartos=2...),
 * então qualquer busca pode ser compartilhada por link. Funciona sem JavaScript.
 */
export function FiltrosForm({
  filtros,
  opcoes,
}: {
  filtros: FiltrosImoveis;
  opcoes: OpcoesFiltro;
}) {
  return (
    <Form
      action="/imoveis"
      // A key faz os valores padrão acompanharem a URL após cada busca.
      key={filtrosParaQuery(filtros)}
      className="space-y-7"
    >
      {filtros.ordem !== "recentes" && <input type="hidden" name="ordem" value={filtros.ordem} />}

      <Grupo titulo="Finalidade">
        <Pilulas
          name="finalidade"
          valor={filtros.finalidade ?? ""}
          opcoes={[
            { value: "", label: "Todas" },
            { value: "venda", label: "Comprar" },
            { value: "aluguel", label: "Alugar" },
          ]}
        />
      </Grupo>

      <Grupo titulo="Tipo de imóvel">
        <select name="tipo" defaultValue={filtros.tipo ?? ""} className={campo} aria-label="Tipo de imóvel">
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TIPO_LABEL[t]}
            </option>
          ))}
        </select>
      </Grupo>

      <Grupo titulo="Localização">
        <select name="cidade" defaultValue={filtros.cidade ?? ""} className={campo} aria-label="Cidade">
          <option value="">Todas as cidades</option>
          {opcoes.cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select name="bairro" defaultValue={filtros.bairro ?? ""} className={campo} aria-label="Bairro">
          <option value="">Todos os bairros</option>
          {opcoes.cidades.map((c) =>
            opcoes.bairrosPorCidade[c]?.length ? (
              <optgroup key={c} label={c}>
                {opcoes.bairrosPorCidade[c].map((b) => (
                  <option key={`${c}-${b}`} value={b}>
                    {b}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
      </Grupo>

      <Grupo titulo="Faixa de preço (R$)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="preco_min"
            inputMode="numeric"
            min={0}
            step={1000}
            placeholder="Mínimo"
            defaultValue={filtros.precoMin}
            aria-label="Preço mínimo"
            className={`${campo} no-spinner`}
          />
          <input
            type="number"
            name="preco_max"
            inputMode="numeric"
            min={0}
            step={1000}
            placeholder="Máximo"
            defaultValue={filtros.precoMax}
            aria-label="Preço máximo"
            className={`${campo} no-spinner`}
          />
        </div>
      </Grupo>

      <Grupo titulo="Quartos">
        <Pilulas
          name="quartos"
          valor={String(filtros.quartos ?? "")}
          opcoes={[
            { value: "", label: "Todos" },
            { value: "1", label: "1+" },
            { value: "2", label: "2+" },
            { value: "3", label: "3+" },
            { value: "4", label: "4+" },
          ]}
        />
      </Grupo>

      <Grupo titulo="Vagas de garagem">
        <Pilulas
          name="vagas"
          valor={String(filtros.vagas ?? "")}
          opcoes={[
            { value: "", label: "Todas" },
            { value: "1", label: "1+" },
            { value: "2", label: "2+" },
            { value: "3", label: "3+" },
          ]}
        />
      </Grupo>

      <div className="flex gap-2 border-t border-primary/10 pt-6">
        <button type="submit" className={buttonClasses({ className: "flex-1" })}>
          Aplicar filtros
        </button>
        <Link href="/imoveis" className={buttonClasses({ variant: "ghost" })}>
          Limpar
        </Link>
      </div>
    </Form>
  );
}
