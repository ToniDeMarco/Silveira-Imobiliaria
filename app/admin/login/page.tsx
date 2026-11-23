import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Logo, LogoMark } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <LogoMark
          tone="light"
          className="pointer-events-none absolute -bottom-24 -left-24 h-[36rem] w-[36rem] opacity-[0.07]"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" variante="vertical" className="h-40 w-auto self-start" />
          <div>
            <p className="font-serif text-4xl leading-tight text-white">
              Painel de gestão
              <br />
              <span className="text-secondary-300">de imóveis</span>
            </p>
            <p className="mt-4 max-w-sm text-white/60">
              Cadastre imóveis, envie fotos e acompanhe os contatos recebidos pelo site.
            </p>
          </div>
          <p className="text-xs text-white/40">{siteConfig.creci}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl text-primary">Entrar no painel</h1>
          <p className="mt-2 mb-8 text-sm text-ink/60">Acesso restrito à equipe da imobiliária.</p>

          {!isSupabaseConfigured && (
            <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              Supabase ainda não configurado. Preencha o <code>.env.local</code> (veja o README).
            </p>
          )}

          <Suspense fallback={<LoginForm next="/admin" />}>
            {searchParams.then((sp) => (
              <LoginForm next={typeof sp.next === "string" ? sp.next : "/admin"} />
            ))}
          </Suspense>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm text-ink/50 transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}
