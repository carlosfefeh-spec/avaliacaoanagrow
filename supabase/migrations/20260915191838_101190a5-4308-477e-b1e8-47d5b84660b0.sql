CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id text,
  workspace_id text,
  client_id text,
  status text NOT NULL DEFAULT 'in_progress',
  current_question_position integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_session_id uuid NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  question_position integer,
  option_ids text[] NOT NULL DEFAULT '{}',
  text_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_answers_session_idx ON public.quiz_answers (quiz_session_id);
CREATE INDEX IF NOT EXISTS quiz_sessions_status_idx ON public.quiz_sessions (status, started_at DESC);

GRANT INSERT, UPDATE ON public.quiz_sessions TO anon, authenticated;
GRANT INSERT ON public.quiz_answers TO anon, authenticated;
GRANT SELECT ON public.quiz_sessions TO authenticated;
GRANT SELECT ON public.quiz_answers TO authenticated;
GRANT ALL ON public.quiz_sessions TO service_role;
GRANT ALL ON public.quiz_answers TO service_role;

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can start a quiz session" ON public.quiz_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can update a quiz session" ON public.quiz_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "super admin reads quiz sessions" ON public.quiz_sessions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "anyone can record a quiz answer" ON public.quiz_answers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "super admin reads quiz answers" ON public.quiz_answers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));