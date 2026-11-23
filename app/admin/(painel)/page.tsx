import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Building2, FileText, Globe, Plus, Users } from "lucide-react";
import { getResumoPainel, listarLeads } from "@/lib/data/admin";
import { formatData, formatTelefone, mensagemRetornoLead, telefoneParaWhatsApp, whatsappLink } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { AdminTitulo, Cartao, SkeletonTabela } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/ui/brand-icons";

export const metadata: Metadata = { title: "Visão geral" };

export default function PainelPage() {
  return (
    <>
      <AdminTitulo
        titulo="Visão geral"
        descricao="Resumo dos imóveis e dos contatos recebidos pelo site."
        acoes={
          <Link href="/admin/imoveis/novo" className={buttonClasses()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo imóvel
          </Link>
        }
      />
      <Suspense fallback={<SkeletonTabela />}>
        <Resumo />
      </Suspense>
    </>
  );
}

async function Resumo() {
  const [resumo, { itens: leads }] = await Promise.all([getResumoPainel(), listarLeads(1, 5)]);

  const cards = [
    { label: "Imóveis cadastrados", valor: resumo.imoveis, Icon: Building2, href: "/admin/imoveis" },
    { label: "Publicados no site", valor: resumo.publicados, Icon: Globe, href: "/admin/imoveis?status=publicado" },
    { label: "Rascunhos", valor: resumo.rascunhos, Icon: FileText, href: "/admin/imoveis?status=rascunho" },
    { label: "Leads nos últimos 7 dias", valor: resumo.leadsSemana, Icon: Users, href: "/admin/leads" },
  ];

  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, valor, Icon, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="group flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-primary/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-100 text-primary transition group-hover:bg-primary group-hover:text-secondary-200">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-2xl font-bold text-primary">{valor}</span>
                <span className="block text-xs text-ink/55">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Cartao>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-primary">Últimos leads</h2>
          <Link href="/admin/leads" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Ver todos ({resumo.leadsTotal})
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">Nenhum lead recebido ainda.</p>
        ) : (
          <ul className="divide-y divide-primary/5">
            {leads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{lead.nome}</p>
                  <p className="text-xs text-ink/50">
                    {formatData(lead.created_at)}
                    {lead.imovel && ` · ${lead.imovel.codigo} - ${lead.imovel.titulo}`}
                  </p>
                </div>
                <a
                  href={whatsappLink(
                    mensagemRetornoLead(lead.nome, lead.imovel?.codigo),
                    telefoneParaWhatsApp(lead.telefone),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md bg-[#25D366]/10 px-3 py-1.5 text-sm font-semibold text-[#128C4B] transition hover:bg-[#25D366]/20"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {formatTelefone(lead.telefone)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
