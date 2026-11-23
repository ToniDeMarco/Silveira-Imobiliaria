import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Download, Inbox, Mail } from "lucide-react";
import { listarLeads } from "@/lib/data/admin";
import { formatData, formatTelefone, mensagemRetornoLead, telefoneParaWhatsApp, whatsappLink } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { AdminTitulo, SkeletonTabela } from "@/components/admin/ui";
import { ExcluirLeadBotao } from "@/components/admin/lead-acoes";

export const metadata: Metadata = { title: "Leads" };

export default function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  return (
    <>
      <AdminTitulo
        titulo="Leads"
        descricao="Contatos enviados pelos formulários do site."
        acoes={
          <a href="/admin/leads/exportar" className={buttonClasses({ variant: "outline" })} download>
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </a>
        }
      />
      <Suspense fallback={<SkeletonTabela />}>
        {searchParams.then((sp) => (
          <Tabela pagina={Math.max(1, Number(sp.pagina) || 1)} />
        ))}
      </Suspense>
    </>
  );
}

async function Tabela({ pagina }: { pagina: number }) {
  const { itens, total, totalPaginas } = await listarLeads(pagina);

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/15 bg-white/60 px-6 py-16 text-center">
        <Inbox className="mx-auto h-10 w-10 text-secondary-600" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-4 font-serif text-xl text-primary">Nenhum lead ainda</p>
        <p className="mt-1 text-sm text-ink/55">Os contatos enviados pelo site aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-ink/55">{total} {total === 1 ? "lead" : "leads"}</p>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-primary/5">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-primary/5 text-xs text-ink/50 uppercase">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Data</th>
              <th scope="col" className="px-5 py-4 font-semibold">Imóvel</th>
              <th scope="col" className="px-5 py-4 font-semibold">Nome</th>
              <th scope="col" className="px-5 py-4 font-semibold">Telefone</th>
              <th scope="col" className="px-5 py-4 font-semibold">Mensagem</th>
              <th scope="col" className="px-5 py-4"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {itens.map((lead) => (
              <tr key={lead.id} className="align-top transition hover:bg-surface/60">
                <td className="px-5 py-4 whitespace-nowrap text-ink/60">{formatData(lead.created_at)}</td>
                <td className="px-5 py-4">
                  {lead.imovel ? (
                    <Link href={`/admin/imoveis/${lead.imovel.id}`} className="group block max-w-[14rem]">
                      <span className="font-semibold text-secondary-700">{lead.imovel.codigo}</span>
                      <span className="block truncate text-xs text-ink/55 group-hover:text-primary">{lead.imovel.titulo}</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-ink/40">Contato geral</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{lead.nome}</p>
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="mt-0.5 flex items-center gap-1 text-xs text-ink/55 hover:text-primary">
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      {lead.email}
                    </a>
                  )}
                </td>
                <td className="px-5 py-4">
                  <a
                    href={whatsappLink(mensagemRetornoLead(lead.nome, lead.imovel?.codigo), telefoneParaWhatsApp(lead.telefone))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366]/10 px-3 py-1.5 font-semibold whitespace-nowrap text-[#128C4B] transition hover:bg-[#25D366]/20"
                    title="Responder no WhatsApp"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {formatTelefone(lead.telefone.replace(/\D/g, ""))}
                  </a>
                </td>
                <td className="max-w-xs px-5 py-4 text-ink/70">
                  {lead.mensagem ? (
                    lead.mensagem.length > 120 ? (
                      <details>
                        <summary className="cursor-pointer list-none">
                          {lead.mensagem.slice(0, 120)}… <span className="text-xs font-semibold text-primary">ver mais</span>
                        </summary>
                        <p className="mt-2 whitespace-pre-line">{lead.mensagem}</p>
                      </details>
                    ) : (
                      <p className="whitespace-pre-line">{lead.mensagem}</p>
                    )
                  ) : (
                    <span className="text-ink/30">—</span>
                  )}
                </td>
                <td className="px-3 py-4">
                  <ExcluirLeadBotao id={lead.id} nome={lead.nome} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-3 text-sm">
          {pagina > 1 && (
            <Link href={`/admin/leads?pagina=${pagina - 1}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Anterior
            </Link>
          )}
          <span className="text-ink/55">Página {pagina} de {totalPaginas}</span>
          {pagina < totalPaginas && (
            <Link href={`/admin/leads?pagina=${pagina + 1}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
              Próxima <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
