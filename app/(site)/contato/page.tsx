import type { Metadata } from "next";
import { BadgeCheck, Clock, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatTelefone, perfilInstagram, whatsappLink } from "@/lib/format";
import { PageHeader } from "@/components/site/page-header";
import { LeadForm } from "@/components/imoveis/lead-form";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com a ${siteConfig.name} pelo WhatsApp ${formatTelefone(siteConfig.whatsapp)} ou envie uma mensagem. Atendimento em ${siteConfig.region}.`,
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  const canais = [
    {
      Icon: WhatsAppIcon,
      titulo: "WhatsApp",
      valor: formatTelefone(siteConfig.whatsapp),
      href: whatsappLink("Olá! Vim pela página de contato e gostaria de atendimento."),
      externo: true,
    },
    ...(siteConfig.social.instagram
      ? [
          {
            Icon: InstagramIcon,
            titulo: "Instagram",
            valor: perfilInstagram(siteConfig.social.instagram),
            href: siteConfig.social.instagram,
            externo: true,
          },
        ]
      : []),
    { Icon: Mail, titulo: "E-mail", valor: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { Icon: MapPin, titulo: "Região de atuação", valor: `${siteConfig.region} - ${siteConfig.state}` },
    { Icon: Clock, titulo: "Horário de atendimento", valor: siteConfig.horario },
    { Icon: BadgeCheck, titulo: "Registro profissional", valor: siteConfig.creci },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contato"
        title="Vamos encontrar o imóvel certo para você"
        description="Chame no WhatsApp para um atendimento rápido ou envie uma mensagem pelo formulário. Respondemos o quanto antes."
        breadcrumb={[{ label: "Contato" }]}
      />

      <section className="container-site mt-4 grid items-start gap-8 lg:grid-cols-[1fr_1.15fr]">
        <ul className="grid gap-3">
          {canais.map(({ Icon, titulo, valor, href, externo }) => {
            const conteudo = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center bg-secondary-100 text-primary transition group-hover:bg-primary group-hover:text-secondary-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-ink/50">{titulo}</span>
                  <span className="block font-semibold break-words text-primary">{valor}</span>
                </span>
              </>
            );
            const classes =
              "group flex items-center gap-4 bg-white p-5 ring-1 ring-primary/5";
            return (
              <li key={titulo}>
                {href ? (
                  <a
                    href={href}
                    {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`${classes} transition hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    {conteudo}
                  </a>
                ) : (
                  <div className={classes}>{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="bg-white p-6 shadow-[0_20px_50px_-24px_rgba(12,18,32,0.25)] ring-1 ring-primary/5 sm:p-8">
          <h2 className="text-2xl text-primary">Envie uma mensagem</h2>
          <p className="mt-1.5 mb-6 text-sm text-ink/60">
            Conte o que você procura ou qual imóvel deseja anunciar.
          </p>
          <LeadForm
            textoWhatsApp="Olá! Acabei de enviar uma mensagem pelo site."
            botao="Enviar mensagem"
          />
        </div>
      </section>
    </>
  );
}
