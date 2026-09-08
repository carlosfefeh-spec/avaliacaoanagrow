WITH q AS (
  INSERT INTO public.quizzes (title, description, slug, passing_score, max_attempts, published)
  VALUES ('Quiz: Cuidados com o cabelo', 'Teste rápido de 3 perguntas sobre saúde capilar. Edite ou exclua este exemplo quando quiser.', 'cuidados-com-o-cabelo', 70, 3, true)
  RETURNING id
), q1 AS (
  INSERT INTO public.quiz_questions (quiz_id, position, prompt, type, explanation)
  SELECT id, 0, 'Qual valor de ferritina é usado como referência capilar?', 'multiple_choice',
         'Tricologistas usam 150 ng/mL como referência capilar, e não o mínimo do laboratório.'
  FROM q RETURNING id
), q2 AS (
  INSERT INTO public.quiz_questions (quiz_id, position, prompt, type, explanation)
  SELECT id, 1, 'A queda de cabelo pode ter mais de uma causa ao mesmo tempo.', 'true_false',
         'Sim. Causas nutricionais, hormonais e foliculares costumam se somar.'
  FROM q RETURNING id
), q3 AS (
  INSERT INTO public.quiz_questions (quiz_id, position, prompt, type, explanation, expected_answer)
  SELECT id, 2, 'Em quantos meses costumam aparecer os primeiros resultados de um protocolo capilar?', 'short_answer',
         'Os primeiros resultados são relatados a partir do 3º mês, com efeito mais consistente em 6 meses.', '3'
  FROM q RETURNING id
)
INSERT INTO public.quiz_options (question_id, position, label, is_correct)
SELECT id, 0, '30 ng/mL', false FROM q1
UNION ALL SELECT id, 1, '70 ng/mL', false FROM q1
UNION ALL SELECT id, 2, '150 ng/mL', true FROM q1
UNION ALL SELECT id, 3, '400 ng/mL', false FROM q1
UNION ALL SELECT id, 0, 'Verdadeiro', true FROM q2
UNION ALL SELECT id, 1, 'Falso', false FROM q2;