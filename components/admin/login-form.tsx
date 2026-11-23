"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { entrar, type LoginState } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";

const campo =
  "h-12 w-full rounded-xl border border-primary/10 bg-white px-4 text-sm outline-none transition focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20";

export function LoginForm({ next }: { next: string }) {
  const [estado, acao, pendente] = useActionState<LoginState, FormData>(entrar, {});

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink/70">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={estado.email}
          className={campo}
        />
      </div>
      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-ink/70">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className={campo}
        />
      </div>
      {estado.erro && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className={buttonClasses({ size: "lg", className: "w-full" })}>
        {pendente ? (
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="h-5 w-5" aria-hidden="true" />
        )}
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
