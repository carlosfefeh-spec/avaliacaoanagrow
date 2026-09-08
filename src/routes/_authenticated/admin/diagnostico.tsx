import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { STEPS } from "@/lib/quiz/config";
import { fetchOverrides, type OverrideRow, type StepPatch } from "@/lib/quiz/overrides";

export const Route = createFileRoute("/_authenticated/admin/diagnostico")({
  head: () => ({
    meta: [
      { title: "Editar diagnóstico capilar — Anagrow" },
      { name: "description", content: "Ajuste textos e opções das etapas do diagnóstico capilar." },
      { property: "og:title", content: "Editar diagnóstico capilar — Anagrow" },
      { property: "og:description", content: "Ajuste textos e opções das etapas do diagnóstico capilar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiagnosticEditor,
});

function DiagnosticEditor() {
  const [rows, setRows] = useState<Record<string, OverrideRow>>({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void fetchOverrides().then((list) => {
      setRows(Object.fromEntries(list.map((row) => [row.step_id, row])));
    });
  }, []);

  const save = async (stepId: string, patch: StepPatch, hidden: boolean) => {
    setRows((prev) => ({ ...prev, [stepId]: { step_id: stepId, patch, hidden } }));
    setStatus("Salvando...");
    const { error } = await supabase
      .from("diagnostic_step_overrides")
      .upsert({ step_id: stepId, patch: patch as never, hidden }, { onConflict: "step_id" });
    setStatus(error ? error.message : "Salvo");
  };

  const editable = STEPS.filter((step) => "title" in step || "body" in step);

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <div className="flex items-center justify-between">
        <Link to="/admin" className="text-muted-foreground hover:text-primary text-sm">
          ← Todos os quizzes
        </Link>
        {status && <span className="text-muted-foreground text-xs">{status}</span>}
      </div>

      <h1 className="font-display mt-6 text-2xl">Diagnóstico capilar</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Ajuste os textos das etapas do diagnóstico já publicado. Campos vazios mantêm o texto original.
      </p>

      <div className="mt-8 space-y-4">
        {editable.map((step) => {
          const current = rows[step.id] ?? { step_id: step.id, hidden: false, patch: {} as StepPatch };
          const patch = current.patch ?? {};
          const original = step as unknown as Record<string, string | undefined>;

          const update = (next: StepPatch, hidden = current.hidden) => void save(step.id, { ...patch, ...next }, hidden);

          return (
            <div key={step.id} className="space-y-3 rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs tracking-widest uppercase">{step.id}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`hide-${step.id}`} className="text-xs">
                    Ocultar etapa
                  </Label>
                  <Switch
                    id={`hide-${step.id}`}
                    checked={current.hidden}
                    onCheckedChange={(v) => update({}, v)}
                  />
                </div>
              </div>

              {original["title"] !== undefined && (
                <div className="space-y-1">
                  <Label className="text-xs">Título</Label>
                  <Textarea
                    defaultValue={patch.title ?? original["title"]}
                    onBlur={(e) => update({ title: e.target.value })}
                  />
                </div>
              )}
              {original["subtitle"] !== undefined && (
                <div className="space-y-1">
                  <Label className="text-xs">Subtítulo</Label>
                  <Input
                    defaultValue={patch.subtitle ?? original["subtitle"]}
                    onBlur={(e) => update({ subtitle: e.target.value })}
                  />
                </div>
              )}
              {original["body"] !== undefined && (
                <div className="space-y-1">
                  <Label className="text-xs">Texto</Label>
                  <Textarea defaultValue={patch.body ?? original["body"]} onBlur={(e) => update({ body: e.target.value })} />
                </div>
              )}
              {original["cta"] !== undefined && (
                <div className="space-y-1">
                  <Label className="text-xs">Botão</Label>
                  <Input defaultValue={patch.cta ?? original["cta"]} onBlur={(e) => update({ cta: e.target.value })} />
                </div>
              )}

              {"options" in step && Array.isArray(step.options) && (
                <div className="space-y-2">
                  <Label className="text-xs">Alternativas</Label>
                  {step.options.map((option) => (
                    <div key={option.id} className="grid gap-2 sm:grid-cols-2">
                      <Input
                        defaultValue={patch.options?.[option.id]?.label ?? option.label}
                        onBlur={(e) =>
                          update({
                            options: {
                              ...(patch.options ?? {}),
                              [option.id]: { ...(patch.options?.[option.id] ?? {}), label: e.target.value },
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="Descrição curta"
                        defaultValue={patch.options?.[option.id]?.hint ?? option.hint ?? ""}
                        onBlur={(e) =>
                          update({
                            options: {
                              ...(patch.options ?? {}),
                              [option.id]: { ...(patch.options?.[option.id] ?? {}), hint: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button className="mt-8" variant="outline" asChild>
        <Link to="/">Ver diagnóstico</Link>
      </Button>
    </main>
  );
}
