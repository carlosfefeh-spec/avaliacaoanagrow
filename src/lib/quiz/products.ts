/**
 * Catálogo oficial Anagrow (fonte: anagrow.com.br).
 * Nenhum benefício, ingrediente ou indicação aqui é inventado:
 * todos derivam das páginas oficiais dos produtos.
 */

export type ScoreKey =
  | "ferritin12"
  | "osa"
  | "tonico"
  | "vitaD"
  | "anaPlus"
  | "glowOil";

export type Product = {
  id: ScoreKey | string;
  name: string;
  short: string;
  role: string;
  actives: string;
  usage: string;
  url: string;
  price: string;
};

const BASE = "https://www.anagrow.com.br/products/";

export const PRODUCTS: Record<string, Product> = {
  ferritin12: {
    id: "ferritin12",
    name: "Ferritin12",
    short: "Frente nutricional da queda",
    role: "Repõe a matéria-prima do fio: ferro quelado, B12, biotina, vitamina C, L-Cisteína e L-Lisina.",
    actives: "Ferro quelado · B12 · Biotina · Vitamina C · L-Cisteína · L-Lisina",
    usage: "Uso interno diário, contínuo. Resultados relatados a partir do 3º mês, com resultado mais consistente a partir de 6 meses.",
    url: `${BASE}ferritin12`,
    price: "R$ 135,90",
  },
  osa: {
    id: "osa",
    name: "OSA",
    short: "Frente hormonal do afinamento",
    role: "Óleo de semente de abóbora + vitamina E: auxilia no bloqueio da conversão de testosterona em DHT e protege o folículo do estresse oxidativo.",
    actives: "Óleo de semente de abóbora · Vitamina E",
    usage: "Uso interno diário, contínuo. Resultados relatados a partir do 3º mês, com resultado mais consistente a partir de 6 meses.",
    url: `${BASE}osa-oleo-de-semente-de-abobora`,
    price: "R$ 135,90",
  },
  tonico: {
    id: "tonico",
    name: "Tônico de Crescimento Capilar",
    short: "Estímulo tópico no folículo",
    role: "Peptídeos biomiméticos nanoencapsulados aplicados direto no couro cabeludo: crescimento, preenchimento de falhas e microcirculação.",
    actives: "Peptídeos biomiméticos · Sistema de nanoencapsulação",
    usage: "Aplicação tópica diária no couro cabeludo. Resultados relatados a partir do 3º mês, com resultado mais consistente a partir de 6 meses.",
    url: `${BASE}tonico-capilar-anagrow`,
    price: "R$ 199,90",
  },
  vitaD: {
    id: "vitaD",
    name: "Vitamina D2, A e K2 em gotas",
    short: "Suporte de micronutrientes",
    role: "Complemento para quem tem pouca exposição solar ou já identificou vitamina D baixa.",
    actives: "Vitamina D2 · Vitamina A · Vitamina K2",
    usage: "Gotas de uso diário.",
    url: `${BASE}vitamina-d-em-gotas-30ml`,
    price: "R$ 74,92",
  },
  anaPlus: {
    id: "anaPlus",
    name: "Ana Plus",
    short: "Colágeno Peptan® 6 em 1",
    role: "Colágeno hidrolisado com ácido hialurônico, biotina e vitaminas B3, B5, B6 e C — cabelo, unhas e pele.",
    actives: "Colágeno Peptan® · Ácido hialurônico · Biotina · B3, B5, B6, C",
    usage: "1 dose diária dissolvida em água.",
    url: `${BASE}colageno-hidrolisado-proteina-da-beleza-ana-plus-300g`,
    price: "R$ 139,90",
  },
  glowOil: {
    id: "glowOil",
    name: "Glow Oil",
    short: "Acabamento antifrizz",
    role: "Óleo cosmético para frizz e aparência dos fios no dia a dia.",
    actives: "Óleo antifrizz 30ml",
    usage: "Uso tópico nos comprimentos, conforme necessidade.",
    url: `${BASE}oleo-antifrizz-glow-oil-30ml`,
    price: "R$ 139,90",
  },
};

export const KITS = {
  ferrosa: {
    name: "Kit Ferrosa — Ferritin12 + OSA",
    url: `${BASE}kit-ferritin12-osa`,
    price: "R$ 219,90",
  },
  glowUp: {
    name: "Protocolo Glow Up — 3 Ferritin12 + 3 OSA",
    url: `${BASE}kit-desafio-glow-up-combate-a-queda-e-fortalecedor-3-ferritin12-3-osa-presente`,
    price: "R$ 587,58",
  },
};
