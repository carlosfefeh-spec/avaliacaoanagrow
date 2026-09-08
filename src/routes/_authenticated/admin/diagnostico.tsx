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
import {
  DEFAULT_FINAL_FIELDS,
  EMPTY_CUSTOMIZATION,
  FONTS,
  fetchCustomization,
  saveCustomization,
  type FinalField,
  type FontKey,
  type QuizCustomization,
} from "@/lib/quiz/customization";

export const Route = createFileRoute("/_authenticated/admin/diagnostico")({
  head: () => ({
    meta: [
      { title: "Editar diagnóstico capilar — Anagrow" },
      { name: "description", content: "Edite entrada, perguntas, fluxo, resultado, tela final e estilo do diagnóstico." },
      { property: "og:title", content: "Editar diagnóstico capilar — Anagrow" },
      {
        property: "og:description",
        content: "Edite entrada, perguntas, fluxo, resultado, tela final e estilo do diagnóstico.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiagnosticEditor,
});

const TABS = [
  { id: "entrada", label: "Tela de entrada" },
  { id: "perguntas", label: "Perguntas e fluxo" },
  { id: "resultado", label: "Resultado" },
  { id: "final", label: "Tela final" },
  { id: "estilo", label: "Estilo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PROTOCOLS: { id: string; label: string }[] = [
  { id: "completo", label: "Protocolo completo Glow Up" },
  { id: "ferrosa", label: "Protocolo Ferrosa (Ferritin12 + OSA)" },
  { id: "ferritin12", label: "Protocolo Ferritin12" },
  { id: "osa", label: "Protocolo OSA" },
  { id: "tonico", label: "Protocolo Tônico de Crescimento" },
  { id: "vitaD", label: "Protocolo Vitamina D" },
  { id: "anaPlus", label: "Protocolo Ana Plus" },
  { id: "glowOil", label: "Protocolo Glow Oil" },
];

function DiagnosticEditor() {
  const [tab, setTab] = useState<TabId>("entrada");
  const [rows, setRows] = useState<Record<string, OverrideRow>>({});
  const [custom, setCustom] = useState<QuizCustomization>(EMPTY_CUSTOMIZATION);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void fetchOverrides().then((list) => setRows(Object.fromEntries(list.map((row) => [row.step_id, row]))));
    void fetchCustomization().then(setCustom);
  }, []);

  const saveStep = async (stepId: string, patch: StepPatch, hidden: boolean) => {
    setRows((prev) => ({ ...prev, [stepId]: { step_id: stepId, patch, hidden } }));
    setStatus("Salvando...");
    const { error } = await supabase
      .from("diagnostic_step_overrides")
      .upsert({ step_id: stepId, patch: patch as never, hidden }, { onConflict: "step_id" });
    setStatus(error ? error.message : "Salvo");
  };

  const patchCustom = (next: Partial<QuizCustomization>) => {
    const merged = { ...custom, ...next };
    setCustom(merged);
    setStatus("Salvando...");
    void saveCustomization(merged).then((err) => setStatus(err ?? "Salvo"));
  };

  const questions = STEPS.filter((s) => s.kind === "question") as Extract<
    (typeof STEPS)[number],
    { kind: "question" }
  >[];
  const stepTargets = STEPS.filter((s) => s.kind !== "landing");

  return (
    <main className="mx-auto max-w-[900px] px-6 py-10">
      <div className="flex items-center justify-between">
        <Link to="/admin" className="text-muted-foreground hover:text-primary text-sm">
          ← Todos os quizzes
        </Link>
        {status && <span className="text-muted-foreground text-xs">{status}</span>}
      </div>

      <h1 className="font-display mt-6 text-2xl">Diagnóstico capilar</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Tudo aqui é opcional: campos vazios mantêm exatamente o conteúdo original do diagnóstico publicado.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "entrada" && (
        <section className="mt-8 space-y-4 rounded-xl border p-5">
          <Field
            label="Selo (texto pequeno no topo)"
            value={custom.landing.badge ?? ""}
            onSave={(v) => patchCustom({ landing: { ...custom.landing, badge: v } })}
          />
          <Field
            label="Título principal"
            multiline
            value={custom.landing.title ?? ""}
            onSave={(v) => patchCustom({ landing: { ...custom.landing, title: v } })}
          />
          <Field
            label="Subtítulo"
            multiline
            value={custom.landing.subtitle ?? ""}
            onSave={(v) => patchCustom({ landing: { ...custom.landing, subtitle: v } })}
          />
          <Field
            label="Texto de introdução"
            multiline
            value={custom.landing.body ?? ""}
            onSave={(v) => patchCustom({ landing: { ...custom.landing, body: v } })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Link da imagem ou do vídeo de capa"
              value={custom.landing.mediaUrl ?? ""}
              onSave={(v) => patchCustom({ landing: { ...custom.landing, mediaUrl: v } })}
            />
            <div className="space-y-1">
              <Label className="text-xs">Tipo da capa</Label>
              <select
                className="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm"
                value={custom.landing.mediaKind ?? "image"}
                onChange={(e) =>
                  patchCustom({
                    landing: { ...custom.landing, mediaKind: e.target.value as "image" | "video" },
                  })
                }
              >
                <option value="image">Imagem</option>
                <option value="video">Vídeo (link de incorporação)</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Texto do botão de início"
              value={custom.landing.cta ?? ""}
              onSave={(v) => patchCustom({ landing: { ...custom.landing, cta: v } })}
            />
            <ColorField
              label="Cor do botão de início"
              value={custom.landing.ctaColor ?? ""}
              onSave={(v) => patchCustom({ landing: { ...custom.landing, ctaColor: v } })}
            />
          </div>
        </section>
      )}

      {tab === "perguntas" && (
        <div className="mt-8 space-y-4">
          <p className="text-muted-foreground text-sm">
            Além dos textos, você define para qual etapa cada resposta leva. Deixe em “Seguir a ordem normal” para
            manter o comportamento atual.
          </p>
          {STEPS.filter((step) => "title" in step || "body" in step).map((step) => {
            const current = rows[step.id] ?? { step_id: step.id, hidden: false, patch: {} as StepPatch };
            const patch = current.patch ?? {};
            const original = step as unknown as Record<string, string | undefined>;
            const update = (next: StepPatch, hidden = current.hidden) =>
              void saveStep(step.id, { ...patch, ...next }, hidden);

            return (
              <div key={step.id} className="space-y-3 rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs tracking-widest uppercase">{step.id}</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`hide-${step.id}`} className="text-xs">
                      Ocultar etapa
                    </Label>
                    <Switch id={`hide-${step.id}`} checked={current.hidden} onCheckedChange={(v) => update({}, v)} />
                  </div>
                </div>

                {original["title"] !== undefined && (
                  <div className="space-y-1">
                    <Label className="text-xs">Título</Label>
                    <Textarea defaultValue={patch.title ?? original["title"]} onBlur={(e) => update({ title: e.target.value })} />
                  </div>
                )}
                {original["subtitle"] !== undefined && (
                  <div className="space-y-1">
                    <Label className="text-xs">Subtítulo</Label>
                    <Input defaultValue={patch.subtitle ?? original["subtitle"]} onBlur={(e) => update({ subtitle: e.target.value })} />
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
                    <Label className="text-xs">Alternativas e para onde cada uma leva</Label>
                    {step.options.map((option) => (
                      <div key={option.id} className="grid gap-2 sm:grid-cols-3">
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
                        <select
                          className="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm"
                          value={custom.branching[step.id]?.[option.id] ?? ""}
                          onChange={(e) => {
                            const map = { ...(custom.branching[step.id] ?? {}) };
                            if (e.target.value) map[option.id] = e.target.value;
                            else delete map[option.id];
                            patchCustom({ branching: { ...custom.branching, [step.id]: map } });
                          }}
                        >
                          <option value="">Seguir a ordem normal</option>
                          {stepTargets.map((target) => (
                            <option key={target.id} value={target.id}>
                              → {target.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="rounded-xl border p-5">
            <h2 className="text-sm font-semibold">Mapa do fluxo</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {questions.map((q) => (
                <li key={q.id}>
                  <span className="font-medium">{q.title}</span>
                  <ul className="text-muted-foreground mt-1 space-y-0.5">
                    {q.options.map((o) => (
                      <li key={o.id}>
                        {o.label} → {custom.branching[q.id]?.[o.id] ?? "próxima etapa"}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "resultado" && (
        <div className="mt-8 space-y-4">
          <p className="text-muted-foreground text-sm">
            Cada bloco corresponde a um resultado possível do diagnóstico. A lógica que escolhe o protocolo continua a
            mesma; aqui você ajusta o que a pessoa lê.
          </p>
          {PROTOCOLS.map((p) => {
            const value = custom.results[p.id] ?? {};
            const update = (next: Partial<typeof value>) =>
              patchCustom({ results: { ...custom.results, [p.id]: { ...value, ...next } } });
            return (
              <div key={p.id} className="space-y-3 rounded-xl border p-5">
                <h3 className="text-sm font-semibold">{p.label}</h3>
                <Field label="Título do resultado" value={value.title ?? ""} onSave={(v) => update({ title: v })} />
                <Field
                  label="Descrição"
                  multiline
                  value={value.description ?? ""}
                  onSave={(v) => update({ description: v })}
                />
                <Field label="Link da imagem" value={value.imageUrl ?? ""} onSave={(v) => update({ imageUrl: v })} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Texto do botão" value={value.ctaText ?? ""} onSave={(v) => update({ ctaText: v })} />
                  <Field label="Link do botão" value={value.ctaUrl ?? ""} onSave={(v) => update({ ctaUrl: v })} />
                  <ColorField label="Cor do botão" value={value.ctaColor ?? ""} onSave={(v) => update({ ctaColor: v })} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "final" && (
        <section className="mt-8 space-y-4 rounded-xl border p-5">
          <Field
            label="Título da etapa de dados"
            value={custom.final.title ?? ""}
            onSave={(v) => patchCustom({ final: { ...custom.final, title: v } })}
          />
          <Field
            label="Texto de apoio"
            multiline
            value={custom.final.body ?? ""}
            onSave={(v) => patchCustom({ final: { ...custom.final, body: v } })}
          />
          <Field
            label="Texto de agradecimento (última etapa antes do resultado)"
            multiline
            value={custom.final.thanks ?? ""}
            onSave={(v) => patchCustom({ final: { ...custom.final, thanks: v } })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Texto do botão final"
              value={custom.final.button ?? ""}
              onSave={(v) => patchCustom({ final: { ...custom.final, button: v } })}
            />
            <Field
              label="Link do botão final (opcional)"
              value={custom.final.buttonUrl ?? ""}
              onSave={(v) => patchCustom({ final: { ...custom.final, buttonUrl: v } })}
            />
          </div>

          <FieldsEditor
            fields={custom.final.fields ?? DEFAULT_FINAL_FIELDS}
            onChange={(fields) => patchCustom({ final: { ...custom.final, fields } })}
          />
        </section>
      )}

      {tab === "estilo" && (
        <section className="mt-8 space-y-4 rounded-xl border p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <ColorField
              label="Cor principal"
              value={custom.theme.primary ?? ""}
              onSave={(v) => patchCustom({ theme: { ...custom.theme, primary: v } })}
            />
            <ColorField
              label="Cor de fundo"
              value={custom.theme.background ?? ""}
              onSave={(v) => patchCustom({ theme: { ...custom.theme, background: v } })}
            />
            <ColorField
              label="Cor dos botões"
              value={custom.theme.buttonColor ?? ""}
              onSave={(v) => patchCustom({ theme: { ...custom.theme, buttonColor: v } })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fonte</Label>
            <select
              className="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm"
              value={custom.theme.font ?? "serif"}
              onChange={(e) => patchCustom({ theme: { ...custom.theme, font: e.target.value as FontKey } })}
            >
              {Object.entries(FONTS).map(([key, font]) => (
                <option key={key} value={key}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Link do logo"
            value={custom.theme.logoUrl ?? ""}
            onSave={(v) => patchCustom({ theme: { ...custom.theme, logoUrl: v } })}
          />
        </section>
      )}

      <Button className="mt-8" variant="outline" asChild>
        <Link to="/">Visualizar diagnóstico</Link>
      </Button>
    </main>
  );
}

function Field({
  label,
  value,
  onSave,
  multiline,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
}) {
  const Comp = multiline ? Textarea : Input;
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Comp key={value} defaultValue={value} onBlur={(e) => onSave(e.target.value)} />
    </div>
  );
}

function ColorField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#6d1030"}
          onChange={(e) => onSave(e.target.value)}
          className="h-10 w-12 rounded-md border"
          aria-label={label}
        />
        <Input key={value} defaultValue={value} placeholder="Padrão" onBlur={(e) => onSave(e.target.value)} />
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onSave("")}>
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldsEditor({ fields, onChange }: { fields: FinalField[]; onChange: (fields: FinalField[]) => void }) {
  const move = (index: number, delta: number) => {
    const next = [...fields];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    next[index] = next[target]!;
    next[target] = a;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">Campos solicitados</Label>
      {fields.map((field, i) => (
        <div key={field.key} className="grid items-center gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <Input
            key={`${field.key}-label`}
            defaultValue={field.label}
            onBlur={(e) => onChange(fields.map((f) => (f.key === field.key ? { ...f, label: e.target.value } : f)))}
          />
          <Input
            key={`${field.key}-ph`}
            placeholder="Texto de exemplo"
            defaultValue={field.placeholder ?? ""}
            onBlur={(e) =>
              onChange(fields.map((f) => (f.key === field.key ? { ...f, placeholder: e.target.value } : f)))
            }
          />
          <div className="flex items-center gap-2">
            <Label className="text-xs">Mostrar</Label>
            <Switch
              checked={field.enabled}
              onCheckedChange={(v) => onChange(fields.map((f) => (f.key === field.key ? { ...f, enabled: v } : f)))}
            />
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => move(i, -1)} aria-label="Subir campo">
              ↑
            </Button>
            <Button variant="outline" size="sm" onClick={() => move(i, 1)} aria-label="Descer campo">
              ↓
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
