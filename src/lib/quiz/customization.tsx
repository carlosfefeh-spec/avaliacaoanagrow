import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Personalização do diagnóstico capilar já publicado.
 * Nada aqui recria o quiz: são apenas sobreposições opcionais.
 * Quando um campo está vazio, a experiência original continua exatamente igual.
 */

export type MediaKind = "image" | "video";

export type LandingCustom = {
  title?: string;
  subtitle?: string;
  body?: string;
  badge?: string;
  cta?: string;
  ctaColor?: string;
  mediaUrl?: string;
  mediaKind?: MediaKind;
};

export type ResultCustom = {
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string;
};

export type FinalField = {
  key: "name" | "phone" | "email" | "optIn";
  label: string;
  placeholder?: string;
  enabled: boolean;
  required?: boolean;
};

export type FinalCustom = {
  title?: string;
  body?: string;
  thanks?: string;
  button?: string;
  buttonUrl?: string;
  fields?: FinalField[];
};

export type ThemeCustom = {
  primary?: string;
  background?: string;
  buttonColor?: string;
  font?: FontKey;
  logoUrl?: string;
};

/** Mapa de fluxo condicional: pergunta -> opção -> id da próxima etapa. */
export type BranchingCustom = Record<string, Record<string, string>>;

export type QuizCustomization = {
  landing: LandingCustom;
  results: Record<string, ResultCustom>;
  final: FinalCustom;
  theme: ThemeCustom;
  branching: BranchingCustom;
};

export const CUSTOMIZATION_KEY = "diagnostico";

export type FontKey = "serif" | "sans" | "modern" | "editorial";

export const FONTS: Record<FontKey, { label: string; display: string; body: string }> = {
  serif: { label: "Clássica (atual)", display: '"Newsreader", Georgia, serif', body: '"Inter", system-ui, sans-serif' },
  sans: { label: "Neutra", display: '"Inter", system-ui, sans-serif', body: '"Inter", system-ui, sans-serif' },
  modern: {
    label: "Moderna",
    display: '"Space Grotesk", "Inter", system-ui, sans-serif',
    body: '"DM Sans", "Inter", system-ui, sans-serif',
  },
  editorial: {
    label: "Editorial",
    display: '"Instrument Serif", Georgia, serif',
    body: '"Work Sans", system-ui, sans-serif',
  },
};

export const DEFAULT_FINAL_FIELDS: FinalField[] = [
  { key: "name", label: "Seu primeiro nome", placeholder: "Seu primeiro nome", enabled: true, required: true },
  { key: "phone", label: "Seu WhatsApp com DDD", placeholder: "(11) 99999-9999", enabled: true, required: true },
  {
    key: "email",
    label: "E-mail para receber o diagnóstico completo (opcional)",
    placeholder: "seu@email.com",
    enabled: true,
    required: false,
  },
  {
    key: "optIn",
    label: "Quero receber também conteúdos e novidades da Anagrow (opcional).",
    enabled: true,
    required: false,
  },
];

export const EMPTY_CUSTOMIZATION: QuizCustomization = {
  landing: {},
  results: {},
  final: {},
  theme: {},
  branching: {},
};

export function normalizeCustomization(raw: unknown): QuizCustomization {
  const value = (raw ?? {}) as Partial<QuizCustomization>;
  return {
    landing: value.landing ?? {},
    results: value.results ?? {},
    final: value.final ?? {},
    theme: value.theme ?? {},
    branching: value.branching ?? {},
  };
}

export async function fetchCustomization(): Promise<QuizCustomization> {
  try {
    const { data, error } = await supabase
      .from("quiz_customization")
      .select("data")
      .eq("key", CUSTOMIZATION_KEY)
      .maybeSingle();
    if (error || !data) return EMPTY_CUSTOMIZATION;
    return normalizeCustomization(data.data);
  } catch {
    return EMPTY_CUSTOMIZATION;
  }
}

export async function saveCustomization(value: QuizCustomization): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("quiz_customization").upsert(
    {
      key: CUSTOMIZATION_KEY,
      data: value as never,
      updated_by: userData.user?.id ?? null,
    },
    { onConflict: "key" },
  );
  return error ? error.message : null;
}

/* ------------------------------------------------------------- contexto */

const CustomizationContext = createContext<QuizCustomization>(EMPTY_CUSTOMIZATION);

export function useCustomization(): QuizCustomization {
  return useContext(CustomizationContext);
}

export function useFinalFields(): FinalField[] {
  const custom = useCustomization();
  const saved = custom.final.fields;
  if (!saved?.length) return DEFAULT_FINAL_FIELDS;
  return saved;
}

export function CustomizationProvider({
  value,
  children,
}: {
  value: QuizCustomization;
  children: React.ReactNode;
}) {
  return <CustomizationContext.Provider value={value}>{children}</CustomizationContext.Provider>;
}

export function useLoadedCustomization(): QuizCustomization {
  const [value, setValue] = useState<QuizCustomization>(EMPTY_CUSTOMIZATION);
  useEffect(() => {
    void fetchCustomization().then(setValue);
  }, []);
  return value;
}

/** Converte a cor escolhida no painel em variáveis CSS aplicáveis ao quiz. */
export function themeStyle(theme: ThemeCustom): React.CSSProperties {
  const style: Record<string, string> = {};
  if (theme.primary) style["--primary"] = hslFromHex(theme.primary);
  if (theme.background) style["--background"] = hslFromHex(theme.background);
  if (theme.font) {
    style["--font-display"] = FONTS[theme.font].display;
    style["--font-sans"] = FONTS[theme.font].body;
  }
  return style as React.CSSProperties;
}

/** O tema do projeto usa canais HSL sem função, então convertemos o hex do painel. */
export function hslFromHex(hex: string): string {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
