import { Bath, BedDouble, Car, Ruler } from "lucide-react";
import { formatArea } from "@/lib/format";
import type { Imovel } from "@/types/imovel";

type Specs = Pick<Imovel, "quartos" | "banheiros" | "vagas" | "area_total" | "area_construida">;

/** Linha compacta de ícones usada nos cards. */
export function ImovelSpecsInline({ imovel }: { imovel: Specs }) {
  const area = formatArea(imovel.area_construida ?? imovel.area_total);
  const itens = [
    imovel.quartos ? { Icon: BedDouble, texto: `${imovel.quartos} ${imovel.quartos === 1 ? "quarto" : "quartos"}` } : null,
    imovel.banheiros ? { Icon: Bath, texto: `${imovel.banheiros} ${imovel.banheiros === 1 ? "banh." : "banhs."}` } : null,
    imovel.vagas ? { Icon: Car, texto: `${imovel.vagas} ${imovel.vagas === 1 ? "vaga" : "vagas"}` } : null,
    area ? { Icon: Ruler, texto: area } : null,
  ].filter((i) => i !== null);

  if (itens.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8rem] text-ink/65">
      {itens.map(({ Icon, texto }) => (
        <li key={texto} className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-secondary-600" aria-hidden="true" strokeWidth={1.75} />
          {texto}
        </li>
      ))}
    </ul>
  );
}
