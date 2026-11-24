import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/eyebrow";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Ornamento } from "@/components/site/ornamento";

type Trilha = {
  id: "comprar" | "vender";
  rotulo: string;
  etapas: { titulo: string; texto: string }[];
  acao: { texto: string; href: string; externo?: boolean };
};

const TRILHAS: Trilha[] = [
  {
    id: "comprar",
    rotulo: "Comprar ou alugar",
    etapas: [
      {
        titulo: "Conversa inicial",
        texto: "Entendemos o que você procura: região, tamanho, orçamento e prazo.",
      },
      {
        titulo: "Seleção e visitas",
        texto: "Separamos as opções que fazem sentido e acompanhamos cada visita.",
      },
      {
        titulo: "Negociação e documentos",
        texto: "Conduzimos a proposta e conferimos toda a documentação do imóvel.",
      },
      {
        titulo: "Entrega das chaves",
        texto: "Contrato assinado com segurança e as chaves na sua mão.",
      },
    ],
    acao: { texto: "Ver imóveis disponíveis", href: "/imoveis" },
  },
  {
    id: "vender",
    rotulo: "Vender ou anunciar",
    etapas: [
      {
        titulo: "Avaliação do imóvel",
        texto: "Visitamos o imóvel e indicamos um valor coerente com o mercado local.",
      },
      {
        titulo: "Fotos e anúncio",
        texto: "Preparamos o anúncio e publicamos o imóvel no site e nas redes.",
      },
      {
        titulo: "Visitas qualificadas",
        texto: "Apresentamos o imóvel a interessados com perfil compatível.",
      },
      {
        titulo: "Fechamento seguro",
        texto: "Negociação, contrato e documentação acompanhados até o fim.",
      },
    ],
    acao: {
      texto: "Anunciar meu imóvel",
      href: whatsappLink("Olá! Gostaria de anunciar meu imóvel com vocês."),
      externo: true,
    },
  },
];

/**
 * "Como trabalhamos": etapas ligadas por um filete dourado, em duas trilhas
 * (quem compra/aluga e quem vende/anuncia). A troca de trilha é feita só com
 * CSS (rádios + group-has), sem JavaScript no navegador.
 */
export function Jornada() {
  return (
    <section className="mt-28 border-y border-primary/10 bg-secondary-50 py-20 sm:mt-36 sm:py-24">
      <div className="group/jornada container-site">
        <Ornamento className="mx-auto mb-8 max-w-56" />
        <SectionHeading
          align="center"
          eyebrow="Como trabalhamos"
          title="Do primeiro contato à entrega das chaves"
          description="Um caminho claro, com acompanhamento em cada etapa, para quem compra e para quem vende."
        />

        <fieldset className="mx-auto mt-10 flex w-full max-w-md gap-1 rounded-md bg-surface p-1">
          <legend className="sr-only">Escolha o seu objetivo</legend>
          {TRILHAS.map((trilha, i) => (
            <label key={trilha.id} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="jornada"
                id={`jornada-${trilha.id}`}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span className="block rounded-md px-3 py-2.5 text-center text-sm font-semibold text-ink/60 transition peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-500">
                {trilha.rotulo}
              </span>
            </label>
          ))}
        </fieldset>

        {TRILHAS.map((trilha) => (
          <div
            key={trilha.id}
            className={
              trilha.id === "comprar"
                ? "group-has-[#jornada-vender:checked]/jornada:hidden"
                : "hidden group-has-[#jornada-vender:checked]/jornada:block"
            }
          >
            <ol className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-0">
              {/* Filete que conecta as etapas (vertical no celular, horizontal no desktop) */}
              <span
                aria-hidden="true"
                className="absolute top-7 bottom-7 left-7 w-px bg-linear-to-b from-secondary-500 via-secondary-400/70 to-secondary-500/20 lg:right-[12.5%] lg:bottom-auto lg:left-[12.5%] lg:h-px lg:w-auto lg:bg-linear-to-r"
              />
              {trilha.etapas.map((etapa, n) => (
                <li
                  key={etapa.titulo}
                  className="group/etapa relative flex gap-5 lg:flex-col lg:items-center lg:px-6 lg:text-center"
                >
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center border border-secondary-500/70 bg-secondary-50 font-serif text-xl lining-nums text-primary transition duration-300 group-hover/etapa:border-primary group-hover/etapa:bg-primary group-hover/etapa:text-secondary-200">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-2 lg:pt-0">
                    <h3 className="text-xl text-primary lg:mt-1 lg:text-center">{etapa.titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{etapa.texto}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-14 flex justify-center">
              {trilha.acao.externo ? (
                <a
                  href={trilha.acao.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses()}
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  {trilha.acao.texto}
                </a>
              ) : (
                <Link href={trilha.acao.href} className={buttonClasses()}>
                  {trilha.acao.texto}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
