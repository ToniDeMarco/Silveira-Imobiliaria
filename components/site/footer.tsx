import Link from "next/link";
import { cacheLife } from "next/cache";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatTelefone, perfilInstagram, whatsappLink } from "@/lib/format";
import { TIPOS, TIPO_LABEL_PLURAL } from "@/types/imovel";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/ui/brand-icons";
import { Logo } from "./logo";

async function AnoAtual() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const redes = [
  { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.social.youtube, label: "YouTube", Icon: YoutubeIcon },
].filter((r) => r.href);

export function Footer() {
  return (
    <footer className="relative mt-24 bg-primary text-white/75">
      <div className="container-site relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="text-center sm:text-left">
          <Logo tone="light" variante="vertical" className="mx-auto h-36 w-auto sm:mx-0" />
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed max-sm:text-balance sm:mx-0">{siteConfig.slogan}</p>
          <p className="mt-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-secondary-200">
            {siteConfig.creci}
          </p>
          {redes.length > 0 && (
            <div className="mt-6 flex justify-center gap-3 sm:justify-start">
              {redes.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-secondary-300 hover:text-secondary-200"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wide text-white">Navegação</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-secondary-200">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wide text-white">
            Tipos de imóvel
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {TIPOS.map((tipo) => (
              <li key={tipo}>
                <Link href={`/imoveis?tipo=${tipo}`} className="transition hover:text-secondary-200">
                  {TIPO_LABEL_PLURAL[tipo]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wide text-white">Contato</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a
                href={whatsappLink("Olá! Vim pelo site e gostaria de atendimento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition hover:text-secondary-200"
              >
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-300" />
                {formatTelefone(siteConfig.whatsapp)}
              </a>
            </li>
            {siteConfig.social.instagram && (
              <li>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition hover:text-secondary-200"
                >
                  <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-300" />
                  {perfilInstagram(siteConfig.social.instagram)}
                </a>
              </li>
            )}
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-start gap-3 break-all transition hover:text-secondary-200"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
              {siteConfig.region} — {siteConfig.state}
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
              {siteConfig.horario}
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            © <AnoAtual /> {siteConfig.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:+${siteConfig.whatsapp}`}
              className="flex items-center gap-1.5 transition hover:text-secondary-200"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              Ligar agora
            </a>
            <Link href="/admin" className="text-white/40 transition hover:text-white/70" prefetch={false}>
              Área do corretor
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
