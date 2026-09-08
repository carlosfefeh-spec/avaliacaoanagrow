import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { listLeads, type LeadListRow } from "@/lib/quiz-admin/dashboard.functions";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({
    meta: [
      { title: "Leads da avaliação — Anagrow" },
      { name: "description", content: "Nome, e-mail, data da resposta e protocolo de cada pessoa que respondeu." },
      { property: "og:title", content: "Leads da avaliação — Anagrow" },
      { property: "og:description", content: "Acompanhe cada cliente que respondeu a avaliação capilar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function toCsv(rows: LeadListRow[]) {
  const head = ["Nome", "E-mail", "WhatsApp", "Data", "Causa", "Protocolo", "Chance", "Envio"];
  const body = rows.map((l) => [
    l.name,
    l.email ?? "",
    l.phone,
    formatDate(l.createdAt),
    l.cause ?? "",
    l.protocol ?? "",
    l.recoveryChance != null ? `${l.recoveryChance}%` : "",
    l.webhookOk ? "Enviado" : "Falhou",
  ]);
  return [head, ...body].map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
}

function LeadsPage() {
  const load = useServerFn(listLeads);
  const [rows, setRows] = useState<LeadListRow[]>([]);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    (value: string) => {
      setLoading(true);
      setError(null);
      load({ data: { search: value } })
        .then(setRows)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [load],
  );

  useEffect(() => {
    refresh(term);
  }, [term, refresh]);

  const download = () => {
    const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-anagrow-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Cada pessoa que concluiu a avaliação, com o protocolo indicado para ela.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin">Quizzes</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin/funil">Funil</Link>
          </Button>
          <Button size="sm" onClick={download} disabled={!rows.length}>
            Baixar planilha
          </Button>
        </div>
      </header>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(search);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone"
          className="focus:border-primary w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>

      {error && <p className="text-destructive mt-6 text-sm">{error}</p>}
      {loading && <p className="text-muted-foreground mt-6 text-sm">Carregando...</p>}

      {!loading && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Data da resposta</th>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">Envio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.name || "Sem nome"}</p>
                    <p className="text-muted-foreground text-xs">{lead.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {lead.email ? (
                      <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${lead.email}`}>
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p>{lead.protocol ?? "—"}</p>
                    <p className="text-muted-foreground text-xs">
                      {lead.cause ?? "—"}
                      {lead.recoveryChance != null ? ` · ${lead.recoveryChance}% de chance` : ""}
                    </p>
                  </td>
                  <td className={`px-4 py-3 ${lead.webhookOk ? "" : "text-destructive"}`}>
                    {lead.webhookOk ? "Enviado" : `Falhou (${lead.webhookStatus ?? 0})`}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="text-muted-foreground px-4 py-8 text-sm" colSpan={5}>
                    Nenhum lead encontrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
