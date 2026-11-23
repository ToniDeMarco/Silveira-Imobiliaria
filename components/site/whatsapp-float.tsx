import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/brand-icons";

/** Botão flutuante de WhatsApp presente em todas as páginas públicas. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site e gostaria de atendimento.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-3 sm:right-6 sm:bottom-6"
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Fale conosco
      </span>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-transform duration-300 group-hover:scale-105">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.5s]"
          aria-hidden="true"
        />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
    </a>
  );
}
