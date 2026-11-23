import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { siteConfig } from "@/config/site";
import { bancoParaForm } from "@/lib/validations/imovel";
import { AdminTitulo } from "@/components/admin/ui";
import { ImovelForm } from "@/components/admin/imovel-form";

export const metadata: Metadata = { title: "Novo imóvel" };

export default function NovoImovelPage() {
  return (
    <>
      <Link href="/admin/imoveis" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para imóveis
      </Link>
      <AdminTitulo
        titulo="Novo imóvel"
        descricao="O código (IM0001...) e o endereço da página são gerados automaticamente."
      />
      <p className="mb-6 flex items-center gap-2 rounded-2xl bg-secondary-100 px-4 py-3 text-sm text-primary-800 ring-1 ring-secondary-200">
        <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
        Depois de criar o imóvel você será levado para a tela de edição, onde poderá enviar as fotos.
      </p>
      <ImovelForm id={null} valoresIniciais={bancoParaForm({ cidade: siteConfig.city })} />
    </>
  );
}
