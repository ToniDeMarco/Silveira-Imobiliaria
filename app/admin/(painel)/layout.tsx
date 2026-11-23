import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogOut, ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { sair } from "@/app/admin/actions";
import { Logo } from "@/components/site/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { buttonClasses } from "@/components/ui/button";

export default function PainelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Painel>{children}</Painel>
    </Suspense>
  );
}

/**
 * Lê a sessão (cookies) e confere se o usuário está na tabela `admins`.
 * Mesmo que alguém burle esta tela, o RLS do banco bloqueia os dados.
 */
async function Painel({ children }: { children: React.ReactNode }) {
  const sessao = await getAdminSession();
  if (!sessao) redirect("/admin/login");

  if (!sessao.isAdmin) {
    return (
      <main className="grid flex-1 place-items-center px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-primary/5">
          <ShieldAlert className="mx-auto h-10 w-10 text-secondary-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl text-primary">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-ink/60">
            O usuário <strong>{sessao.email}</strong> não está na lista de administradores. Peça
            ao responsável para liberar o acesso (tabela <code>admins</code> no Supabase).
          </p>
          <form action={sair} className="mt-6">
            <button type="submit" className={buttonClasses({ variant: "outline" })}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="bg-primary lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Logo tone="light" className="h-10 w-auto" />
        </div>
        <div className="px-3 pb-3 lg:flex-1">
          <AdminNav />
        </div>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate text-xs text-white/50" title={sessao.email ?? ""}>
            {sessao.email}
          </p>
          <form action={sair} className="mt-2">
            <button
              type="submit"
              className="flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {children}
        <form action={sair} className="mt-12 text-center lg:hidden">
          <button type="submit" className="text-sm text-ink/50 underline underline-offset-4">
            Sair ({sessao.email})
          </button>
        </form>
      </main>
    </div>
  );
}

function Carregando() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row" aria-busy="true">
      <div className="h-28 bg-primary lg:h-screen lg:w-64" />
      <div className="flex-1 space-y-4 p-8">
        <div className="h-8 w-56 animate-pulse rounded bg-secondary-100" />
        <div className="h-64 animate-pulse rounded-3xl bg-white" />
      </div>
    </div>
  );
}
