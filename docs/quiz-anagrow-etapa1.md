# ETAPA 1 — Arquitetura do Quiz Anagrow

Fonte de verdade: catálogo oficial (anagrow.com.br/products.json + páginas de produto), consultado nesta data.
Nada aqui foi inventado: objetivos e sinais derivam da descrição oficial de cada produto.

---

## A. ANÁLISE DOS PRODUTOS (PRODUCT_MATRIX)

| Produto | Objetivo principal | Perfil | Sinais relacionados | Perguntas relevantes | Combinações | URL |
|---|---|---|---|---|---|---|
| **Ferritin12** (60 cáps — ferro quelado, B12, biotina, Vit C, L-Cisteína, L-Lisina) | Queda por causa **nutricional**; recuperar volume e força | Queda difusa, cabelo no ralo/escova, quebra, pós-parto, dieta restritiva, cansaço/fluxo menstrual intenso | Padrão de queda, quebra, rotina alimentar, contexto hormonal/pós-parto, exames | + OSA (Ferrosa), + Tônico, + Ana Plus | /products/ferritin12 |
| **OSA** (30 cáps — óleo de semente de abóbora + Vit E) | Queda por **afinamento/DHT**; fios mais grossos | Afinamento progressivo, topo/risco mais aparente, entradas, histórico familiar | Afinamento, largura do risco, entradas, histórico, tempo de evolução | + Ferritin12 (Ferrosa), + Tônico | /products/osa-oleo-de-semente-de-abobora |
| **Ferrosa (Kit Ferritin12 + OSA)** | Atacar queda nas duas frentes (nutricional + hormonal) | Queda difusa **e** afinamento | Ambos os conjuntos acima | Base do protocolo completo (+ Tônico) | /products/kit-ferritin12-osa |
| **Tônico de Crescimento Capilar 60ml** (peptídeos biomiméticos nanoencapsulados) | Estímulo **tópico**: novos fios, preenchimento de falhas, densidade | Crescimento lento, falhas, densidade baixa, quer novos fios | Crescimento, falhas, densidade, couro cabeludo, disposição para rotina tópica diária | + Ferritin12 e/ou OSA | /products/tonico-capilar-anagrow |
| **Vitamina D2, A e K2 em gotas** | Suporte de micronutrientes | Pouca exposição solar, cansaço, deficiência relatada | Rotina/estilo de vida, sinais nutricionais | Complemento de qualquer protocolo | /products/vitamina-d-em-gotas-30ml |
| **Ana Plus** (colágeno Peptan® + AH, biotina, B3/B5/B6, C) | Beleza integrada: pele, unhas, cabelo | Quer unhas/pele junto; fios sem brilho; 35+ | Objetivo secundário declarado, faixa etária | Complemento de Ferritin12/OSA | /products/colageno-hidrolisado-proteina-da-beleza-ana-plus-300g |
| **Glow Oil 30ml** (antifrizz) | Cosmético: frizz, aparência, pontas | Frizz, ressecamento, quebra por manipulação | Textura/rotina de calor e química | Complemento estético | /products/oleo-antifrizz-glow-oil-30ml |
| **New Lash 3,6ml** | Cílios e sobrancelhas | Sobrancelhas falhadas | Pergunta condicional única | Add-on | /products/serum-fortalecedor-de-cilios-e-sobrancelhas-new-lash-3-6ml |
| **Kit Protocolo Glow Up** (3 Ferritin12 + 3 OSA) | Protocolo 3 meses queda + afinamento | Perfil combinado com alta intensidade e disposição a tratamento contínuo | Múltiplos sinais fortes | Upgrade do Ferrosa | /products/kit-desafio-glow-up-combate-a-queda-e-fortalecedor-3-ferritin12-3-osa-presente |
| **Escova massageadora / Fronha de cetim** | Suporte de rotina (baixo custo) | Quebra por atrito, manipulação | Rotina de sono/escovação | Add-on opcional | /products/escova-massageadora-anagrow, /products/fronha-de-cetim |

Regras de responsabilidade: gestação/amamentação e uso de medicação → não recomendar suplementação sem indicação; direcionar a avaliação profissional e priorizar rotina/tópico com ressalva.

---

## B. MAPA DE DECISÃO (resposta → interpretação → score → próximo passo)

Scores: `ferritin12, osa, tonico, vitaD, anaPlus, glowOil, newLash`.

| Resposta | Interpretação | Score | Próxima decisão |
|---|---|---|---|
| Objetivo "menos queda" | eixo queda | ferritin12 +2, osa +1 | ramo QUEDA |
| Objetivo "mais volume/densidade" | eixo densidade | osa +2, tonico +2 | ramo AFINAMENTO |
| Objetivo "crescimento/falhas" | eixo crescimento | tonico +3 | ramo CRESCIMENTO |
| Objetivo "fios mais encorpados" | eixo força | ferritin12 +2, anaPlus +1 | ramo QUEDA |
| Queda "espalhada por todo o couro" | padrão difuso | ferritin12 +3 | desbloqueia bloco nutricional |
| Queda "topo/risco alargando" | padrão de afinamento | osa +3 | desbloqueia bloco DHT |
| Queda "entradas" | padrão de afinamento | osa +2, tonico +1 | idem |
| Risco mais largo que há 1 ano | perda de densidade | osa +2, tonico +1 | aprofundar tempo de evolução |
| Falhas visíveis / crescimento lento | necessidade tópica | tonico +3 | pergunta de rotina tópica |
| Histórico familiar de afinamento | padrão progressivo | osa +2 | — |
| Pós-parto (últimos 12m) | queda telógena | ferritin12 +3 | microfeedback específico + ressalva amamentação |
| Dieta restritiva / pouca carne / fluxo intenso | sinal nutricional | ferritin12 +2 | — |
| Pouca exposição solar / cansaço frequente | sinal de micronutriente | vitaD +2 | — |
| Unhas fracas + pele | beleza integrada | anaPlus +2, ferritin12 +1 | — |
| Frizz/ressecamento/calor frequente | eixo cosmético | glowOil +2 | — |
| Sobrancelhas falhadas | add-on | newLash +2 | — |
| "Topo a topo" (2 eixos ≥ 6) | múltiplas necessidades | — | protocolo combinado |

Protocolos (regras de ativação):
- **Nutricional** — ferritin12 líder e osa < 5 → Ferritin12 (+ VitaD/AnaPlus se score ≥ 4).
- **Antiafinamento** — osa líder e ferritin12 < 5 → OSA (+ Tônico se tonico ≥ 5).
- **Ferrosa** — ferritin12 ≥ 5 **e** osa ≥ 5 → Kit Ferritin12 + OSA.
- **Crescimento tópico** — tonico líder → Tônico (+ interno de maior score).
- **Completo (Glow Up)** — três eixos ≥ 5 e usuária declarou disposição a tratamento contínuo → 3 Ferritin12 + 3 OSA + Tônico.
- Complementos entram apenas com score próprio ≥ 4 e sempre com justificativa ligada a uma resposta.

---

## C. JORNADA (telas em ordem)

01 Landing (vende o resultado) · 02 Objetivo principal · 03 Percepção geral (escala) · 04 Microfeedback · 05 Padrão de queda · 06 Intensidade da queda (slider) · 07 Onde percebe (multiselect) · 08 Transição "2 pontos identificados" · 09 Largura do risco / densidade (cards com imagem) · 10 Crescimento e falhas · 11 Couro cabeludo · 12 Microdescoberta parcial · 13 Contexto hormonal/pós-parto (condicional) · 14 Sinais nutricionais (condicional) · 15 Rotina e estilo de vida · 16 Química/calor (condicional cosmético) · 17 Histórico de produtos · 18 Desempate (condicional, só quando 2 protocolos empatam) · 19 Microcompromisso · 20 Nome · 21 Faixa etária · 22 Expectativa ("montando seu perfil") · 23 WhatsApp + consentimento · 24 Processamento (2–4s, checklist) · 25 Resultado + protocolo + CTA.

Progresso: pesos por pergunta (`progressWeight`), rótulos textuais por fase, nunca retrocede.

---

## D. PERGUNTAS (base — pendente do anexo do cliente)

Cada item: título · tipo · opções · objetivo · score · condição · microfeedback. Exemplos-âncora:

1. **Qual mudança você mais gostaria de perceber?** — cards. [Mais volume | Crescimento mais evidente | Fios mais encorpados | Menos queda percebida] · define eixo inicial · feedback: "Ótimo ponto de partida. Já sei por onde começar a olhar."
2. **Como você descreveria seu cabelo hoje comparado a 1 ano atrás?** — escala 1–5 · calibra intensidade.
3. **Quando percebe mais fios soltos?** — cards [Banho | Escova | Travesseiro | Ao longo do dia] · ferritin12 +1..2.
4. **Onde a mudança é mais fácil de notar?** — multiselect [Risco/topo | Entradas | Laterais | De forma geral] · roteia difuso × afinamento.
5. **Quanto o couro cabeludo aparece na luz?** — escala visual · osa/tonico.
6. **Seus fios crescem no ritmo que você gostaria?** — cards · tonico.
7. **Existem falhas ou áreas menos preenchidas?** — cards com imagem · tonico.
8. **Alguns contextos podem influenciar. Algum se aplica?** — multiselect [Pós-parto até 12 meses | Mudança hormonal recente | Estresse alto | Nenhum agora] · ferritin12/ressalvas.
9. **Como está sua rotina alimentar?** — cards positivos · ferritin12/vitaD.
10. **Com que frequência usa calor ou química?** — slider · glowOil.
11. **Você já tentou algo antes?** — cards ["Ainda estou buscando algo que combine comigo" ...] · tom positivo.
12. **Prefere rotina só interna, só tópica ou as duas?** — cards · desempate protocolo.
13. **Microcompromisso** — "Se existisse uma rotina feita para o seu momento, quer descobrir?" [Sim, quero descobrir | Quero entender melhor].
14. **Nome** · 15. **Faixa etária** · 16. **WhatsApp + consentimento explícito (opt-in não pré-marcado)**.

> Pendência: o anexo "PERGUNTAS FORNECIDAS" veio vazio. As perguntas acima são a base provisória; ao receber o anexo, elas serão substituídas/mescladas mantendo a lógica de scoring.

---

## E. RESULTADOS POSSÍVEIS (perfis)

1. Queda difusa com sinal nutricional
2. Afinamento progressivo (padrão DHT)
3. Queda combinada (nutricional + afinamento)
4. Densidade e crescimento (falhas / fios novos)
5. Fios enfraquecidos e quebradiços
6. Queda pós-parto / transição hormonal
7. Cabelo saudável em manutenção / estética
8. Perfil que requer avaliação profissional antes de suplementar

Cada perfil traz: "o que chamou nossa atenção" (3–4 bullets citando respostas reais), linguagem não diagnóstica, protocolo e rotina conforme informação oficial.

## F. PROTOCOLOS

| Protocolo | Regra | Composição |
|---|---|---|
| Nutricional | ferritin12 líder, osa<5 | Ferritin12 (+VitaD / Ana Plus se aplicável) |
| Antiafinamento | osa líder, ferritin12<5 | OSA (+Tônico se tonico≥5) |
| Ferrosa | ferritin12≥5 e osa≥5 | Kit Ferritin12 + OSA |
| Crescimento tópico | tonico líder | Tônico + interno de maior score |
| Completo Glow Up | 3 eixos ≥5 + disposição declarada | 3 Ferritin12 + 3 OSA + Tônico |
| Estético/manutenção | glowOil líder e eixos capilares baixos | Glow Oil (+ fronha/escova) |

Add-ons (New Lash, escova, fronha) só entram com sinal explícito.

---

## Arquitetura técnica da Etapa 2
`quizConfig` centralizado (questions/products/scoringRules/transitions/results/protocols) separado da UI; estado `userProfile` + `scores` persistido em localStorage (retomada de abandono); UTMs capturadas e preservadas; camada `analytics.track()` com todos os eventos listados; variantes A/B por chave de config; mobile-first, uma decisão por tela; bordô + off-white; reduced-motion e navegação por teclado.
