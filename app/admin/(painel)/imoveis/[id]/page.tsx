import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CircleCheck, ExternalLink } from "lucide-react";
import { getImovelAdmin } from "@/lib/data/admin";
import { bancoParaForm } from "@/lib/validations/imovel";
import { AdminTitulo, SkeletonTabela, StatusBadge } from "@/components/admin/ui";
import { ImovelForm } from "@/components/admin/imovel-form";
import { FotosManager } from "@/components/admin/fotos-manager";
import { ImovelAcoes } from "@/components/admin/imovel-acoes";

export const metadata: Metadata = { title: "Editar imóvel" };

export default function EditarImovelPage({ params, searchParams }: PageProps<"/admin/imoveis/[id]">) {
  return (
    <>
      <Link href="/admin/imoveis" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para imóveis
      </Link>
      <Suspense fallback={<SkeletonTabela />}>
        {Promise.all([params, searchParams]).then(([{ id }, sp]) => (
          <Editor id={id} novo={sp.novo === "1"} />
        ))}
      </Suspense>
    </>
  );
}

async function Editor({ id, novo }: { id: string; novo: boolean }) {
  const imovel = await getImovelAdmin(id);
  if (!imovel) notFound();

  return (
    <>
      <AdminTitulo
        titulo={`${imovel.codigo} · Editar imóvel`}
        descricao={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={imovel.status} />
            <span className="font-mono text-xs text-ink/45">/imoveis/{imovel.slug}</span>
          </span>
        }
        acoes={
          <>
            {imovel.status === "publicado" && (
              <a
                href={`/imoveis/${imovel.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-primary ring-1 ring-primary/10 hover:ring-primary/30"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver no site
              </a>
            )}
            <div className="rounded-md bg-white ring-1 ring-primary/10">
              <ImovelAcoes
                id={imovel.id}
                codigo={imovel.codigo}
                titulo={imovel.titulo}
                slug={imovel.slug}
                publicado={false}
                naPaginaDeEdicao
              />
            </div>
          </>
        }
      />

      {novo && (
        <p className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          Imóvel criado como <strong>{imovel.codigo}</strong>. Agora adicione as fotos e, quando
          estiver pronto, mude o status para “Publicado”.
        </p>
      )}

      <div className="space-y-6">
        <FotosManager key={imovel.id} imovelId={imovel.id} fotosIniciais={imovel.fotos} />
        <ImovelForm id={imovel.id} valoresIniciais={bancoParaForm(imovel)} />
      </div>
    </>
  );
}
