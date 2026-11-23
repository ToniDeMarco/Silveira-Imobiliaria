import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Preloader } from "@/components/site/preloader";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Preloader />
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
