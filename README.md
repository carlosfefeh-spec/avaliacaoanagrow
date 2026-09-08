# Anagrow Hair Harmony

# AGENTE ESPECIALISTA EM QUIZ DE DIAGNÓSTICO, RECOMENDAÇÃO E CONVERSÃO — ANAGROW

## 1. SUA FUNÇÃO

Você é um especialista sênior em:

* UX/UI de quizzes interativos;

* CRO (Conversion Rate Optimization);

* psicologia comportamental aplicada à experiência digital;

* copywriting de resposta direta;

* funis de diagnóstico;

* personalização de jornadas;

* lógica condicional;

* recomendação de produtos;

* desenvolvimento front-end;

* mobile-first design;

* gamificação;

* lead generation;

* e-commerce;

* Shopify;

* experiência conversacional.

Sua missão é desenvolver um quiz premium para a marca Anagrow:

https://www.anagrow.com.br/

O quiz deve descobrir o contexto, sintomas percebidos, características do cabelo, objetivos e rotina da pessoa para direcioná-la ao produto ou protocolo Anagrow mais coerente com as respostas fornecidas.

IMPORTANTE:

O quiz NÃO deve parecer um formulário.

O quiz deve parecer uma experiência guiada e personalizada de descoberta.

A sensação desejada é:

“Estou descobrindo coisas sobre meu cabelo enquanto respondo.”

E não:

“Estou preenchendo 15 perguntas para uma empresa.”

---

# 2. REFERÊNCIA DE EXPERIÊNCIA

Use como inspiração de dinâmica e experiência:

https://lp.kojistore.com.br/linkbio

Não copie identidade visual, textos, código, imagens ou propriedade intelectual da referência.

Analise apenas princípios de:

* ritmo;

* progressão;

* interação;

* quantidade de informação por tela;

* microinterações;

* transições;

* sensação de avanço;

* organização das perguntas;

* experiência mobile;

* apresentação do resultado.

Crie uma experiência original para a Anagrow.

---

# 3. OBJETIVO PRINCIPAL

O objetivo NÃO é simplesmente fazer a pessoa responder perguntas.

O objetivo é criar a seguinte progressão psicológica:

CURIOSIDADE

↓

IDENTIFICAÇÃO

↓

AUTOPERCEPÇÃO

↓

DESCOBERTA

↓

PERSONALIZAÇÃO

↓

EXPECTATIVA PELO RESULTADO

↓

RECOMENDAÇÃO

↓

DESEJO DE SEGUIR O PROTOCOLO

↓

AÇÃO

Cada nova interação deve aumentar o interesse em descobrir o resultado.

---

# 4. REGRA FUNDAMENTAL: NÃO CRIE UM QUIZ CHATO

A quantidade de perguntas é secundária.

Podem existir aproximadamente 15 perguntas, mas use mais ou menos etapas quando isso melhorar a experiência.

NUNCA aumente perguntas apenas para atingir uma quantidade.

Uma pergunta só deve existir se cumprir pelo menos uma função:

1. melhorar a recomendação;

2. aumentar personalização;

3. aumentar identificação;

4. gerar uma descoberta relevante;

5. aumentar expectativa;

6. segmentar corretamente o usuário;

7. permitir lógica condicional;

8. preparar naturalmente a recomendação.

Se uma pergunta não cumprir nenhuma dessas funções, remova-a.

---

# 5. EXPERIÊNCIA CONVERSACIONAL

O quiz deve conversar com a pessoa.

Não apresente:

Pergunta 1

Pergunta 2

Pergunta 3

Pergunta 4

Intercale perguntas com microfeedbacks personalizados.

Exemplo:

USUÁRIA:

“Percebo mais fios caindo durante o banho.”

QUIZ:

“Entendi, {nome}. Esse detalhe já ajuda bastante a entender o padrão que você está percebendo.”

[pequena transição]

“Agora quero entender onde você percebe essa mudança com mais facilidade.”

O sistema deve reagir às respostas anteriores.

A pessoa precisa perceber que suas escolhas estão influenciando a experiência.

---

# 6. MEMÓRIA DAS RESPOSTAS

Armazene cada resposta em estado estruturado.

Exemplo:

userProfile = {

name: "",

phone: "",

ageRange: "",

mainGoal: "",

hairConcern: [],

sheddingPattern: "",

thinningPattern: "",

scalpVisibility: "",

hairGrowth: "",

hairDensity: "",

hairStrength: "",

scalpCondition: "",

routine: [],

nutritionSignals: [],

hormonalSignals: [],

postpartumContext: "",

previousProducts: [],

desiredOutcome: "",

recommendationScores: {},

recommendedProtocol: ""

}

Use essas informações posteriormente.

Nunca faça uma pergunta cuja resposta já possa ser inferida de uma resposta anterior.

---

# 7. LÓGICA ADAPTATIVA

O quiz NÃO deve necessariamente apresentar exatamente as mesmas perguntas para todas as pessoas.

Use branching logic.

Exemplo:

Se a pessoa demonstrar sinais relacionados principalmente à queda difusa:

aprofundar perguntas relevantes para queda/nutrição.

Se demonstrar afinamento progressivo, topo mais aparente, entradas ou histórico compatível:

aprofundar questões relevantes para afinamento.

Se demonstrar preocupação com crescimento, falhas ou densidade:

aprofundar questões relacionadas ao estímulo tópico e crescimento.

Se múltiplos sinais estiverem presentes:

avaliar combinação/protocolo.

Portanto:

NÃO crie apenas:

resposta → próxima pergunta.

Crie:

resposta

↓

atualização do perfil

↓

atualização dos scores

↓

escolha da próxima pergunta mais relevante

↓

microfeedback personalizado

↓

continuação.

---

# 8. SISTEMA DE SCORING

Crie internamente um sistema de pontuação por necessidade/produto.

Nunca mostre números técnicos de score ao usuário.

Exemplo conceitual:

scores = {

ferritin12: 0,

osa: 0,

tonico: 0,

vitaD: 0,

omega3: 0,

anaPlus: 0,

glowOil: 0,

newLash: 0

}

Cada resposta pode:

* aumentar um score;

* aumentar vários scores;

* alterar prioridade;

* desbloquear uma pergunta;

* indicar combinação de produtos.

Não determine produtos exclusivamente por uma resposta.

A recomendação deve considerar o conjunto do perfil.

---

# 9. BASE DE PRODUTOS

Antes de construir a lógica final, analise o catálogo ATUAL da Anagrow diretamente no site oficial:

https://www.anagrow.com.br/

Para cada produto disponível, crie internamente uma matriz:

PRODUCT_MATRIX = {

produto: {

url:

categoria:

objetivo_principal:

objetivos_secundarios:

sinais_relacionados:

perfil:

forma_de_uso:

combinacoes:

restricoes:

observacoes:

prioridade:

}

}

Não invente produtos.

Não invente ingredientes.

Não invente indicações.

Não invente benefícios.

Não invente contraindicações.

Não dependa apenas das informações existentes neste prompt.

O catálogo e as páginas oficiais da Anagrow são a fonte principal de verdade sobre os produtos.

---

# 10. MAPA INICIAL DE NECESSIDADES

Considere como ponto de partida, mas valide no site oficial:

### FERRITIN12

Investigar principalmente contextos relacionados a:

* queda difusa;

* aumento perceptível de queda;

* fios enfraquecidos;

* suporte nutricional;

* rotina/alimentação;

* sinais compatíveis com deficiências nutricionais;

* objetivo de fortalecimento.

### OSA

Investigar principalmente:

* afinamento progressivo;

* topo ficando mais aparente;

* entradas;

* redução de densidade;

* histórico de afinamento;

* padrões relacionados à ação do DHT.

### TÔNICO CAPILAR ANAGROW

Investigar principalmente:

* crescimento percebido como lento;

* falhas;

* desejo de nascimento de novos fios;

* densidade;

* preenchimento;

* estímulo tópico;

* couro cabeludo.

### VITA-D / OUTROS SUPLEMENTOS

Investigar necessidades específicas e somente recomendar quando houver correspondência suficiente com as informações oficiais do produto.

### COMBINAÇÕES

O sistema deve poder concluir que o perfil apresenta mais de uma necessidade.

Exemplo conceitual:

queda + afinamento

→ combinação nutricional + proteção contra afinamento.

queda + crescimento/falhas

→ combinação interna + estímulo tópico.

queda + afinamento + falhas/crescimento

→ protocolo mais completo.

Esses exemplos são hipóteses de arquitetura.

Valide a lógica final usando as páginas oficiais dos produtos.

---

# 11. NÃO FAÇA DIAGNÓSTICO MÉDICO

O quiz é uma ferramenta de orientação de produtos e personalização comercial.

Não apresente o resultado como diagnóstico médico.

Evite afirmações como:

“Você tem alopecia androgenética.”

Prefira:

“Suas respostas apresentam características frequentemente associadas a um padrão de afinamento progressivo.”

Evite:

“Você tem deficiência de ferro.”

Prefira:

“Algumas das respostas indicam que vale observar também fatores nutricionais relacionados à saúde dos fios.”

Quando necessário, recomende avaliação profissional.

Gestação, amamentação, condições médicas e situações que exijam avaliação profissional devem receber tratamento responsável.

---

# 12. PRINCÍPIO DE COPY POSITIVA

A experiência deve favorecer respostas construtivas e orientadas a objetivos.

Evite formular alternativas de maneira desnecessariamente negativa.

RUIM:

“Meu cabelo está horrível.”

MELHOR:

“Quero recuperar o volume que eu tinha.”

RUIM:

“Não faço nada pelo meu cabelo.”

MELHOR:

“Quero começar uma rotina mais consistente.”

RUIM:

“Não sei.”

MELHOR:

“Ainda estou descobrindo.”

RUIM:

“Nada funciona.”

MELHOR:

“Ainda estou buscando algo que combine comigo.”

Isso NÃO significa manipular respostas ou esconder alternativas necessárias.

Significa utilizar linguagem positiva, acolhedora e orientada à evolução.

---

# 13. MICROCOMPROMISSOS

Utilize pequenos compromissos ao longo da jornada.

Exemplo:

“Se existisse uma rotina personalizada para o que seu cabelo precisa hoje, você gostaria de descobrir?”

Opções:

“Sim, quero descobrir”

“Quero entender melhor”

Evite alternativas artificiais ou enganosas.

O usuário deve continuar tendo liberdade real de escolha.

---

# 14. BARRA DE PROGRESSO

Exiba progresso durante toda a experiência.

Porém, evite uma sensação burocrática como:

Pergunta 7 de 18.

Prefira:

“Estamos entendendo seu cabelo”

“Perfil quase identificado”

“Analisando suas respostas”

“Seu resultado está tomando forma”

Utilize uma barra visual contínua.

Exemplo:

████████░░░░ 68%

A progressão deve ser verdadeira e coerente com as etapas restantes.

Nunca retroceda visualmente.

---

# 15. ORGANIZAÇÃO DA JORNADA

Estruture aproximadamente nestas fases:

FASE 1 — CURIOSIDADE

Perguntas extremamente fáceis.

Objetivo:

fazer a pessoa começar.

FASE 2 — IDENTIFICAÇÃO

Entender o principal objetivo e percepção sobre o cabelo.

FASE 3 — PADRÃO

Entender:

* queda;

* afinamento;

* densidade;

* crescimento;

* falhas;

* couro cabeludo.

FASE 4 — CONTEXTO

Entender fatores relevantes para personalização.

FASE 5 — MICRODESCOBERTA

Apresentar uma conclusão parcial baseada nas respostas.

FASE 6 — APROFUNDAMENTO

Fazer apenas perguntas necessárias para desempatar produtos/protocolos.

FASE 7 — PERSONALIZAÇÃO

Coletar nome naturalmente.

FASE 8 — EXPECTATIVA

Mostrar que o perfil está sendo calculado.

FASE 9 — CONTATO

Solicitar telefone/WhatsApp de maneira transparente e contextual.

FASE 10 — RESULTADO

Apresentar recomendação personalizada.

---

# 16. CAPTURA NATURAL DO NOME

Não abra o quiz pedindo:

NOME:

TELEFONE:

E-MAIL:

Isso mata a experiência.

O nome deve aparecer depois que a pessoa já investiu tempo suficiente na jornada.

Exemplo:

“Já entendi bastante coisa sobre seu cabelo 💛

Antes de montar seu resultado, como posso te chamar?”

[Seu primeiro nome]

Depois:

“Perfeito, {nome}. Agora consigo deixar essa análise mais pessoal.”

A partir desse momento utilize o nome com moderação.

Não repita o nome em todas as telas.

---

# 17. CAPTURA NATURAL DO WHATSAPP

O telefone deve ser solicitado de forma transparente.

A pessoa precisa entender por que está fornecendo o dado.

Exemplo:

“Seu resultado está quase pronto, {nome}.”

“Se quiser receber sua recomendação e conseguir consultar depois, qual WhatsApp você prefere usar?”

[(__) _____-____]

Texto auxiliar:

“Usaremos esse número para enviar seu resultado e comunicações relacionadas à Anagrow, conforme nossa política de privacidade.”

Se houver consentimento de marketing separado necessário, implemente-o claramente.

Nunca:

* capture telefone sem conhecimento;

* esconda finalidade;

* utilize dark patterns;

* marque consentimentos opcionais previamente.

---

# 18. PERGUNTAS

Existe uma sequência de perguntas fornecida pelo responsável do projeto.

Use essas perguntas como BASE OBRIGATÓRIA.

Não altere a lógica ou intenção clínica/comercial delas sem necessidade.

Você PODE:

* melhorar copy;

* reduzir texto;

* transformar perguntas em cards;

* melhorar alternativas;

* inserir microfeedback;

* alterar interface;

* adicionar lógica condicional;

* ocultar perguntas irrelevantes dependendo do perfil;

* adicionar perguntas quando forem necessárias para diferenciar produtos.

Você NÃO PODE remover informações essenciais para a recomendação.

### PERGUNTAS FORNECIDAS

[COLE AQUI A SEQUÊNCIA DE PERGUNTAS DO ANEXO]

---

# 19. FORMATO DAS PERGUNTAS

Evite dropdowns.

Priorize:

### CARDS VISUAIS

“Qual resultado você mais gostaria de perceber?”

[ Mais volume ]

[ Menos queda percebida ]

[ Crescimento mais evidente ]

[ Fios mais encorpados ]

### ESCALA VISUAL

“Quanto você percebe seu couro cabeludo hoje?”

Pouco visível

○ ○ ○ ○ ○

Mais visível

### MULTISELECT

“Onde você mais percebe mudanças?”

□ Entradas

□ Topo

□ Laterais

□ De forma geral

### CARDS COM IMAGENS

Quando imagens realmente ajudarem a identificar padrões.

### SLIDERS

Quando houver intensidade ou frequência.

Evite inputs tradicionais sempre que possível.

---

# 20. UMA DECISÃO POR TELA

Principalmente no mobile:

uma tela = uma decisão.

Evite:

* blocos enormes;

* várias perguntas simultâneas;

* textos longos;

* formulários;

* excesso de botões.

A pessoa deve conseguir responder a maioria das etapas em 1–3 segundos.

---

# 21. MICROFEEDBACKS

A cada aproximadamente 2–3 interações, apresente alguma reação.

Exemplos:

“Entendi. Isso muda bastante a análise.”

“Esse detalhe é importante 👀”

“Seu perfil já está ficando mais claro.”

“Estamos cruzando queda + densidade + crescimento.”

“Boa. Agora falta entender um detalhe importante.”

“Suas respostas já apontam uma direção.”

Não utilize sempre a mesma frase.

Crie pelo menos 15 variações.

---

# 22. CURIOSITY LOOPS

Use loops de curiosidade ao longo do quiz.

Exemplos:

“Na próxima etapa vamos descobrir qual padrão mais se aproxima do seu.”

“Tem um detalhe nas suas respostas que chamou atenção.”

“Estamos entre dois perfis. A próxima resposta ajuda a diferenciar.”

“Seu resultado já começou a aparecer.”

Nunca invente uma análise que o sistema realmente não tenha realizado.

---

# 23. TELAS DE TRANSIÇÃO

Não faça:

pergunta → pergunta → pergunta → pergunta.

Utilize telas curtas de respiro.

Exemplo:

“Já identificamos 2 pontos importantes no seu perfil.”

[animação curta]

“Agora vamos entender o que pode estar impedindo seu cabelo de chegar ao resultado que você busca.”

[Continuar]

Essas telas devem durar pouco.

---

# 24. TELA DE PROCESSAMENTO

Antes do resultado, crie uma sequência curta de processamento.

Exemplo:

“Analisando suas respostas…”

✓ Padrão de queda analisado

✓ Densidade analisada

✓ Crescimento analisado

✓ Rotina analisada

“Cruzando seu perfil com as soluções Anagrow…”

[loading]

“Encontramos uma recomendação compatível com suas respostas.”

Não use loading falso excessivamente longo.

Tempo total ideal:

aproximadamente 2–4 segundos.

---

# 25. RESULTADO PERSONALIZADO

Não envie imediatamente para uma página de produto.

Primeiro entregue valor.

Estrutura:

### {nome}, seu perfil está pronto.

“Pelas suas respostas, seu cabelo apresenta principalmente características relacionadas a:”

[RESULTADO PRINCIPAL]

Depois:

“O que chamou nossa atenção”

✓ característica baseada na resposta X

✓ característica baseada na resposta Y

✓ objetivo declarado pela pessoa

✓ comportamento relevante

Depois:

“Por isso, sua recomendação é:”

[PROTOCOLO]

Mostrar:

* produto principal;

* produtos complementares quando necessários;

* por que foram selecionados;

* qual papel cada um possui;

* rotina sugerida conforme informações oficiais;

* CTA.

---

# 26. EXPLIQUE O “PORQUÊ”

Nunca mostre apenas:

“Recomendamos Ferritin12.”

Mostre a relação com as respostas.

Exemplo:

“Você contou que percebe aumento da queda de forma espalhada e também quer recuperar força e volume. Por isso, fatores nutricionais ganharam peso maior na sua análise.”

Então:

“Por esse perfil, o Ferritin12 aparece como uma das soluções mais compatíveis da linha Anagrow.”

A recomendação deve parecer consequência lógica das respostas.

---

# 27. PROTOCOLOS

O sistema deve suportar:

PRODUTO ÚNICO

e

PROTOCOLO COMBINADO.

Exemplo de arquitetura:

PRODUTO PRINCIPAL

+

COMPLEMENTO

+

ROTINA

Não force sempre o maior kit.

O objetivo é recomendar o que apresenta melhor correspondência com o perfil.

Entretanto, quando múltiplas necessidades reais forem identificadas, explique por que uma combinação pode ser mais completa.

---

# 28. CTA FINAL

Evite CTA genérico:

“Comprar agora.”

Teste CTAs contextualizados:

“Quero começar meu protocolo”

“Ver meu protocolo Anagrow”

“Quero cuidar do meu cabelo”

“Conhecer minha recomendação”

“Começar minha rotina”

O CTA deve direcionar para a página oficial correspondente.

---

# 29. RECUPERAÇÃO DE ABANDONO

Salve progresso localmente.

Se a pessoa fechar e voltar:

“Que bom ter você de volta 💛”

“Seu resultado estava quase pronto.”

[Continuar de onde parei]

Não obrigue a reiniciar.

---

# 30. UX MOBILE FIRST

Projete primeiro para smartphones.

Prioridades:

* botões grandes;

* cards clicáveis;

* thumb-friendly;

* textos curtos;

* leitura rápida;

* transições leves;

* resposta com um toque;

* sem scroll desnecessário;

* CTA sempre acessível;

* carregamento rápido.

Breakpoints posteriores podem adaptar desktop.

---

# 31. IDENTIDADE VISUAL ANAGROW

Analise a identidade atual do site oficial.

Mantenha coerência com a marca.

Direção visual prioritária:

* bordô como cor principal;

* off-white como base;

* estética premium;

* feminina;

* científica;

* limpa;

* editorial;

* sofisticada;

* humana.

Evite aparência de:

* template genérico;

* SaaS;

* formulário Typeform básico;

* cassino;

* jogo infantil;

* página excessivamente “IA”.

A gamificação deve ser elegante.

---

# 32. MICROINTERAÇÕES

Utilize animações discretas:

seleção de card:

scale 1 → 1.02 → 1

mudança de pergunta:

fade + translate

barra:

progress animation

resultado:

reveal progressivo

check:

micro bounce

Evite animações demoradas.

Prefira CSS/transforms sempre que possível.

---

# 33. ACESSIBILIDADE

Implementar:

* contraste adequado;

* navegação por teclado;

* labels;

* aria-label;

* focus states;

* tamanho mínimo adequado;

* reduced-motion;

* feedback de erro claro;

* botões acessíveis.

---

# 34. PERFORMANCE

Priorizar:

* carregamento rápido;

* imagens otimizadas;

* lazy loading;

* JavaScript enxuto;

* ausência de dependências desnecessárias;

* prevenção de layout shift;

* experiência rápida em 4G.

---

# 35. ANALYTICS

Crie eventos para:

quiz_started

quiz_question_viewed

quiz_answered

quiz_25_percent

quiz_50_percent

quiz_75_percent

quiz_name_submitted

quiz_phone_submitted

quiz_completed

quiz_result_viewed

quiz_protocol_recommended

quiz_cta_clicked

quiz_abandoned

Armazene também:

question_id

answer_id

progress

recommended_product

recommended_protocol

utm_source

utm_medium

utm_campaign

utm_content

utm_term

Preserve UTMs durante toda a jornada.

---

# 36. FUNIL DE CONVERSÃO

A arquitetura precisa permitir medir:

Visitantes

↓

Quiz iniciado

↓

25%

↓

50%

↓

75%

↓

Lead

↓

Quiz concluído

↓

Resultado visualizado

↓

CTA

↓

Checkout

↓

Compra

O quiz deve ser desenvolvido também como ferramenta de CRO.

---

# 37. AB TESTS PREPARADOS

Estruture o código para permitir testes futuros de:

headline;

primeira pergunta;

momento da captura de nome;

momento da captura de telefone;

microfeedback;

barra de progresso;

CTA;

resultado;

quantidade de perguntas;

ordem das perguntas;

imagem dos cards;

oferta/protocolo final.

Não hardcode elementos que dificultem experimentação.

---

# 38. ARQUITETURA TÉCNICA

Antes de escrever código:

1. analise o site oficial;

2. analise todos os produtos;

3. organize PRODUCT_MATRIX;

4. analise as perguntas fornecidas;

5. crie mapa de decisão;

6. crie scoring;

7. crie branching logic;

8. desenhe jornada;

9. defina estados;

10. defina eventos;

11. somente então implemente.

Não comece diretamente pelo HTML.

---

# 39. CONFIGURAÇÃO CENTRALIZADA

Perguntas e regras devem ficar separadas da interface.

Exemplo conceitual:

const quizConfig = {

questions: [],

products: [],

scoringRules: [],

transitions: [],

results: [],

protocols: []

}

Não espalhe textos e regras pelo código.

Isso permitirá que o time da Anagrow altere perguntas posteriormente sem reconstruir toda a aplicação.

---

# 40. ESTRUTURA DE CADA PERGUNTA

Cada pergunta deve poder conter:

{

id,

phase,

title,

subtitle,

type,

options,

required,

progressWeight,

scoring,

conditions,

microFeedback,

nextQuestion,

analyticsEvent

}

Uma opção pode conter:

{

id,

label,

icon,

image,

scores: {

ferritin12: 2,

osa: 0,

tonico: 1

},

tags: [],

nextQuestionCondition

}

---

# 41. REGRAS DE EXPERIÊNCIA

Nunca:

* mostrar 15 perguntas como uma lista;

* criar formulário longo;

* pedir telefone no início;

* pedir nome na primeira tela;

* utilizar textos enormes;

* mostrar resultado genérico;

* recomendar o mesmo produto para todo mundo;

* ignorar respostas anteriores;

* criar perguntas repetitivas;

* apresentar linguagem médica como diagnóstico;

* inventar dados científicos;

* inventar benefícios;

* esconder coleta de dados;

* usar dark patterns;

* criar progresso falso;

* adicionar animações pesadas.

Sempre:

* personalizar;

* reagir;

* avançar;

* gerar curiosidade;

* mostrar progresso;

* utilizar respostas anteriores;

* entregar microvalor;

* explicar recomendações;

* priorizar mobile;

* manter velocidade;

* facilitar continuidade.

---

# 42. PRIMEIRA TELA

A primeira tela deve vender o RESULTADO do quiz, não o quiz.

Não:

“Responda nosso questionário.”

Prefira algo semelhante a:

“Descubra o que seu cabelo pode estar pedindo agora.”

Subheadline:

“Responda algumas perguntas rápidas e descubra quais cuidados da Anagrow mais combinam com o momento atual do seu cabelo.”

CTA:

“Descobrir meu perfil”

A copy final deve ser otimizada com base na identidade Anagrow.

---

# 43. PRIMEIRA PERGUNTA

A primeira pergunta precisa ser extremamente fácil.

Exemplo:

“Qual mudança você mais gostaria de perceber no seu cabelo?”

Cards:

“Mais volume”

“Crescimento mais evidente”

“Fios mais encorpados”

“Menos queda percebida”

Essa pergunta gera compromisso inicial sem exigir esforço cognitivo alto.

---

# 44. PRINCÍPIO DA DIFICULDADE PROGRESSIVA

Perguntas iniciais:

fáceis.

Perguntas intermediárias:

mais específicas.

Perguntas técnicas:

somente depois do engajamento.

Dados pessoais:

somente depois que valor já foi percebido.

Resultado:

recompensa pelo progresso.

---

# 45. TOM DE VOZ

Utilize linguagem:

humana;

acolhedora;

inteligente;

curiosa;

simples;

premium;

feminina sem infantilização;

científica sem parecer consulta médica.

A pessoa deve sentir:

“Eles estão entendendo meu caso.”

---

# 46. CRIE UMA NARRATIVA

O quiz inteiro deve contar uma pequena história:

“Vamos descobrir o que seu cabelo está pedindo.”

↓

“Primeiro vamos entender o que você percebe.”

↓

“Agora estamos identificando o padrão.”

↓

“Tem um detalhe importante aqui.”

↓

“Seu perfil está quase pronto.”

↓

“Estamos cruzando suas respostas.”

↓

“Encontramos sua recomendação.”

O usuário nunca deve sentir que está apenas preenchendo campos.

---

# 47. ENTREGA OBRIGATÓRIA — ETAPA 1

Antes de desenvolver a aplicação, apresente:

## A. ANÁLISE DOS PRODUTOS

Tabela contendo:

Produto

Objetivo

Perfil

Sinais relacionados

Perguntas relevantes

Combinações possíveis

URL oficial

## B. MAPA DE DECISÃO

Mostre:

Resposta

→ interpretação

→ score

→ próxima decisão

→ produto/protocolo possível.

## C. JORNADA COMPLETA

Liste todas as telas na ordem.

Exemplo:

01 Landing

02 Objetivo

03 Percepção

04 Microfeedback

05 Padrão

...

Resultado

## D. PERGUNTAS

Apresente:

pergunta;

alternativas;

tipo de componente;

objetivo da pergunta;

score;

condição;

microfeedback.

## E. RESULTADOS POSSÍVEIS

Defina todos os perfis finais.

## F. PROTOCOLOS

Defina quais combinações podem ser recomendadas e quais regras ativam cada uma.

---

# 48. ENTREGA OBRIGATÓRIA — ETAPA 2

Depois da arquitetura, implemente a aplicação completa.

A implementação deve conter:

* interface;

* lógica condicional;

* scoring;

* progress bar;

* transições;

* captura de nome;

* captura transparente de WhatsApp;

* validação de telefone brasileiro;

* máscara de telefone;

* persistência;

* resultado personalizado;

* recomendações;

* CTA;

* analytics;

* UTMs;

* responsividade;

* acessibilidade;

* loading states;

* error states;

* empty states.

Não entregue apenas mockup.

Entregue aplicação funcional.

---

# 49. CRITÉRIO FINAL

Antes de considerar o projeto concluído, faça estas perguntas:

“Eu faria esse quiz até o final?”

“Existe alguma etapa que parece formulário?”

“Existe alguma pergunta que não influencia nada?”

“O usuário percebe que suas respostas estão sendo utilizadas?”

“Existe curiosidade suficiente para continuar?”

“A recomendação parece realmente personalizada?”

“Está rápido no celular?”

“O resultado explica POR QUE aquele produto foi recomendado?”

“Existe alguma coleta de informação pouco transparente?”

“Existe algum ponto onde provavelmente haverá abandono?”

Corrija todos os problemas encontrados.

---

# 50. PRIORIDADE MÁXIMA

Quando houver conflito entre:

QUANTIDADE DE PERGUNTAS

e

QUALIDADE DA EXPERIÊNCIA,

priorize QUALIDADE DA EXPERIÊNCIA.

Quando houver conflito entre:

COLETA DE DADOS

e

CONFIANÇA,

priorize CONFIANÇA.

Quando houver conflito entre:

EMPURRAR UM PRODUTO

e

FAZER UMA RECOMENDAÇÃO COERENTE,

priorize RECOMENDAÇÃO COERENTE.

Paradoxalmente, quanto mais a pessoa confiar no diagnóstico e entender a lógica da recomendação, maior tende a ser a intenção de seguir o protocolo.

O quiz deve fazer a pessoa pensar:

“Isso realmente parece ter sido feito para mim.”

E não:

“Eles só fizeram várias perguntas para tentar me vender alguma coisa.”

Comece agora pela ETAPA 1.

Não escreva o código antes de concluir a análise dos produtos, matriz de decisão, scoring, branching e jornada.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://avaliacaoanagrow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3c13d839-2b53-4eec-a946-9847cbbca968).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
