"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { enviarLead } from "@/app/actions/leads";
import { leadSchema, mascaraTelefone, type LeadInput, type LeadOutput } from "@/lib/validations/lead";
import { whatsappLink } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";

const campo =
  "w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-400/15";

export function LeadForm({
  imovelId = null,
  mensagemPadrao = "",
  textoWhatsApp,
  botao = "Enviar mensagem",
}: {
  imovelId?: string | null;
  mensagemPadrao?: string;
  /** Mensagem pronta do botão "Continuar no WhatsApp" exibido após o envio. */
  textoWhatsApp?: string;
  botao?: string;
}) {
  const [enviado, setEnviado] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const abertoEm = useRef<number>(0);

  useEffect(() => {
    abertoEm.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput, unknown, LeadOutput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { nome: "", telefone: "", email: "", mensagem: mensagemPadrao, website: "", imovelId },
  });

  const telefone = register("telefone");

  async function onSubmit(dados: LeadOutput) {
    setErroGeral(null);
    const resultado = await enviarLead({
      ...dados,
      imovelId,
      tempoMs: abertoEm.current ? Date.now() - abertoEm.current : undefined,
    });
    if (resultado.ok) {
      setEnviado(dados.nome.split(" ")[0]);
      reset();
      return;
    }
    setErroGeral(resultado.mensagem);
    for (const [nome, mensagem] of Object.entries(resultado.campos ?? {})) {
      if (mensagem) setError(nome as keyof LeadInput, { message: mensagem });
    }
  }

  if (enviado !== null) {
    return (
      <div className="rounded-2xl bg-primary-50 p-6 text-center ring-1 ring-primary-100" role="status">
        <CircleCheck className="mx-auto h-10 w-10 text-primary-500" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-3 font-serif text-xl text-primary">Mensagem enviada{enviado ? `, ${enviado}` : ""}!</p>
        <p className="mt-1.5 text-sm text-ink/65">Retornaremos o contato o quanto antes.</p>
        {textoWhatsApp && (
          <a
            href={whatsappLink(textoWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "outline", size: "sm", className: "mt-5" })}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Prefere agilizar? Chame no WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => setEnviado(null)}
          className="mt-4 block w-full text-xs text-ink/50 underline-offset-4 hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="space-y-3">
      {/* Honeypot: invisível para pessoas, tentador para robôs. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Não preencha este campo
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <Campo erro={errors.nome?.message}>
        <input
          {...register("nome")}
          placeholder="Seu nome *"
          autoComplete="name"
          aria-label="Nome"
          aria-invalid={!!errors.nome}
          className={campo}
        />
      </Campo>

      <Campo erro={errors.telefone?.message}>
        <input
          {...telefone}
          onChange={(e) => {
            e.target.value = mascaraTelefone(e.target.value);
            void telefone.onChange(e);
          }}
          type="tel"
          inputMode="tel"
          placeholder="Telefone / WhatsApp *"
          autoComplete="tel-national"
          aria-label="Telefone"
          aria-invalid={!!errors.telefone}
          className={campo}
        />
      </Campo>

      <Campo erro={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="E-mail (opcional)"
          autoComplete="email"
          aria-label="E-mail"
          aria-invalid={!!errors.email}
          className={campo}
        />
      </Campo>

      <Campo erro={errors.mensagem?.message}>
        <textarea
          {...register("mensagem")}
          rows={4}
          placeholder="Mensagem"
          aria-label="Mensagem"
          aria-invalid={!!errors.mensagem}
          className={`${campo} resize-none`}
        />
      </Campo>

      {erroGeral && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {erroGeral}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className={buttonClasses({ className: "w-full" })}>
        {isSubmitting ? (
          <LoaderCircle className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
        {isSubmitting ? "Enviando..." : botao}
      </button>
      <p className="text-center text-[0.7rem] text-ink/45">
        Seus dados são usados apenas para retornarmos o contato.
      </p>
    </form>
  );
}

function Campo({ erro, children }: { erro?: string; children: React.ReactNode }) {
  return (
    <div>
      {children}
      {erro && <p className="mt-1 pl-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
