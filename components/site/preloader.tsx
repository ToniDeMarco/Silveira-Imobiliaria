import { siteConfig } from "@/config/site";
import { InlineScript } from "@/components/ui/inline-script";
import { LogoMark } from "./logo";

const SKIP_SCRIPT = `try{if(sessionStorage.getItem("rc-preloader"))document.documentElement.classList.add("rc-skip-preloader");else sessionStorage.setItem("rc-preloader","1")}catch(e){}`;

/**
 * Tela de carregamento exibida na primeira visita da sessão.
 * Toda a animação é CSS (ver `.preloader` em globals.css): não bloqueia a
 * renderização, não depende de JavaScript e some sozinha em ~2,5s.
 */
export function Preloader() {
  return (
    <>
      <InlineScript html={SKIP_SCRIPT} />
      <div className="preloader" aria-hidden="true">
        <div className="flex flex-col items-center">
          <LogoMark className="h-20 w-32" />
          <div className="preloader-text mt-5 text-center">
            <p className="text-3xl font-extrabold tracking-tight text-primary">{siteConfig.shortName}</p>
            <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-secondary-700">
              {siteConfig.tagline} · {siteConfig.city}
            </p>
          </div>
          <div className="mt-7 h-px w-40 overflow-hidden rounded-full bg-primary/10">
            <div className="preloader-bar h-full w-full bg-secondary-500" />
          </div>
        </div>
      </div>
    </>
  );
}
