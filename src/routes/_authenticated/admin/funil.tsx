import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getFunnelDashboard, type FunnelDashboard } from "@/lib/quiz-admin/dashboard.functions";

export const Route = createFileRoute("/_authenticated/admin/funil")({
  head: () => ({
    meta: [
      { title: "Funil do quiz — Anagrow" },
      { name: "description", content: "Etapas abandonadas, tempo por etapa, conversão até o CTA e leads do quiz." },
      { property: "og:title", content: "Funil do quiz — Anagrow" },
      { property: "og:description", content: "Painel de desempenho da avaliação capilar Anagrow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FunnelDashboardPage,
});

const RANGES = [7, 30, 90];

function FunnelDashboardPage() {
  const load = useServerFn(getFunnelDashboard);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<FunnelDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    (range: number) => {
      setLoading(true);
      setError(null);
      load({ data: { days: range } })
        .then((result) => setData(result))
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [load],
  );

  useEffect(() => {
    refresh(days);
  }, [days, refresh]);

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Funil do quiz</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Onde as pessoas param, quanto tempo levam e quantas viram o protocolo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((range) => (
            <Button key={range} size="sm" variant={range === days ? "default" : "outline"} onClick={() => setDays(range)}>
              {range} dias
            </Button>
          ))}
          <Button size="sm" variant="ghost" asChild>
            <Link to="/admin">Quizzes</Link>
          </Button>
        </div>
      </header>

      {error && <p className="text-destructive mt-6 text-sm">{error}</p>}
      {loading && !data && <p className="text-muted-foreground mt-8 text-sm">Carregando dados...</p>}

      {data && (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Metric label="Pessoas que começaram" value={data.sessions} />
            <Metric label="Chegaram ao resultado" value={data.results} hint={`${data.completionRate}%`} />
            <Metric label="Clicaram em ver protocolo" value={data.ctaClicks} hint={`${data.ctaRate}%`} />
            <Metric label="Contatos recebidos" value={data.leads} hint={`${data.leadRate}%`} />
            <Metric label="Envios com falha" value={data.leadsFailed} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg">Etapas</h2>
            <div className="mt-3 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Etapa</th>
                    <th className="px-4 py-3">Visualizações</th>
                    <th className="px-4 py-3">Tempo médio</th>
                    <th className="px-4 py-3">Abandonos</th>
                    <th className="px-4 py-3">% abandono</th>
                  </tr>
                </thead>
                <tbody>
                  {data.steps.map((step) => (
                    <tr key={step.stepId} className="border-t">
                      <td className="px-4 py-3">
                        <span className="font-medium">{step.stepId}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{step.stepKind}</span>
                      </td>
                      <td className="px-4 py-3">{step.views}</td>
                      <td className="px-4 py-3">{step.avgTime}s</td>
                      <td className="px-4 py-3">{step.dropOffs}</td>
                      <td className={`px-4 py-3 ${step.dropRate >= 25 ? "text-destructive font-medium" : ""}`}>
                        {step.dropRate}%
                      </td>
                    </tr>
                  ))}
                  {data.steps.length === 0 && (
                    <tr>
                      <td className="text-muted-foreground px-4 py-6 text-sm" colSpan={5}>
                        Ainda não há dados nesse período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg">Respostas mais escolhidas</h2>
            <div className="mt-3 space-y-2">
              {data.options.map((option) => (
                <div
                  key={`${option.questionTitle}-${option.optionLabel}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{option.optionLabel}</p>
                    <p className="text-muted-foreground text-xs">{option.questionTitle}</p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {option.count} escolhas · {option.share}%
                  </p>
                </div>
              ))}
              {data.options.length === 0 && <p className="text-muted-foreground text-sm">Sem respostas registradas.</p>}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg">Contatos recebidos</h2>
            <div className="mt-3 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Quando</th>
                    <th className="px-4 py-3">Pessoa</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Diagnóstico</th>
                    <th className="px-4 py-3">Envio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-t">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">{lead.name || "—"}</td>
                      <td className="px-4 py-3">
                        <p>{lead.phone}</p>
                        <p className="text-muted-foreground text-xs">{lead.email ?? "sem e-mail"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{lead.cause ?? "—"}</p>
                        <p className="text-muted-foreground text-xs">{lead.protocol ?? "—"}</p>
                      </td>
                      <td className={`px-4 py-3 ${lead.webhookOk ? "" : "text-destructive"}`}>
                        {lead.webhookOk ? "Enviado" : `Falhou (${lead.webhookStatus ?? 0})`}
                      </td>
                    </tr>
                  ))}
                  {data.recentLeads.length === 0 && (
                    <tr>
                      <td className="text-muted-foreground px-4 py-6 text-sm" colSpan={5}>
                        Nenhum contato nesse período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-display mt-1 text-2xl">{value}</p>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
