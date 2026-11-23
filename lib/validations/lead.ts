import { z } from "zod";

/** Validação compartilhada entre o formulário (cliente) e a Server Action (servidor). */
export const leadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(120, "Nome muito longo."),
  telefone: z
    .string()
    .trim()
    .refine((v) => {
      const digitos = v.replace(/\D/g, "").length;
      return digitos >= 10 && digitos <= 13;
    }, "Informe um telefone com DDD."),
  email: z
    .union([z.literal(""), z.email("E-mail inválido.").max(160, "E-mail muito longo.")])
    .optional(),
  mensagem: z.string().trim().max(2000, "Mensagem muito longa (máx. 2000 caracteres).").optional(),
  imovelId: z.uuid().nullable().optional(),
  /** Honeypot: campo invisível. Pessoas deixam vazio; robôs costumam preencher. */
  website: z.string().max(200).optional(),
  /** Milissegundos entre abrir e enviar o formulário (robôs enviam instantaneamente). */
  tempoMs: z.number().int().nonnegative().optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadOutput = z.output<typeof leadSchema>;

/** Máscara simples: (38) 99999-8888 */
export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
