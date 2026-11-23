import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatData } from "@/lib/format";

/**
 * GET /admin/leads/exportar → CSV com todos os leads.
 * Separador ";" + BOM UTF-8 para abrir corretamente no Excel em português.
 */
export async function GET() {
  const sessao = await getAdminSession();
  if (!sessao?.isAdmin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("created_at, nome, telefone, email, mensagem, origem, imovel: imoveis(codigo, titulo)")
    .order("created_at", { ascending: false })
    .limit(10000)
    .overrideTypes<
      {
        created_at: string;
        nome: string;
        telefone: string;
        email: string | null;
        mensagem: string | null;
        origem: string;
        imovel: { codigo: string; titulo: string } | null;
      }[],
      { merge: false }
    >();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const celula = (valor: string | null | undefined) => {
    let v = (valor ?? "").replace(/\r?\n/g, " ").trim();
    // Evita "injeção de fórmula" ao abrir no Excel/Planilhas.
    if (/^[=+\-@]/.test(v)) v = `'${v}`;
    return `"${v.replace(/"/g, '""')}"`;
  };

  const cabecalho = ["Data", "Código do imóvel", "Imóvel", "Nome", "Telefone", "E-mail", "Mensagem", "Origem"];
  const linhas = data.map((l) =>
    [
      formatData(l.created_at),
      l.imovel?.codigo,
      l.imovel?.titulo,
      l.nome,
      l.telefone,
      l.email,
      l.mensagem,
      l.origem,
    ]
      .map(celula)
      .join(";"),
  );

  const csv = "﻿" + [cabecalho.map(celula).join(";"), ...linhas].join("\r\n");
  const hoje = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${hoje}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
