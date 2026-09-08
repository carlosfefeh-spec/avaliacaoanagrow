CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL OR lower(_email) <> 'matheus@anagrow.com.br' THEN
    RETURN public.has_role(auth.uid(), 'super_admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Novo quiz',
  description text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE,
  passing_score integer NOT NULL DEFAULT 70,
  time_limit_mode text NOT NULL DEFAULT 'none',
  time_limit_seconds integer,
  max_attempts integer NOT NULL DEFAULT 1,
  randomize_questions boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_time_limit_mode_check CHECK (time_limit_mode IN ('none','per_question','per_quiz')),
  CONSTRAINT quizzes_passing_score_check CHECK (passing_score BETWEEN 0 AND 100),
  CONSTRAINT quizzes_max_attempts_check CHECK (max_attempts BETWEEN 1 AND 100)
);
CREATE TRIGGER quizzes_touch BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT SELECT ON public.quizzes TO anon;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published quizzes" ON public.quizzes FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "super admin reads quizzes" ON public.quizzes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin writes quizzes" ON public.quizzes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin updates quizzes" ON public.quizzes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes quizzes" ON public.quizzes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  prompt text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'multiple_choice',
  image_url text,
  video_url text,
  explanation text,
  expected_answer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_questions_type_check CHECK (type IN ('multiple_choice','true_false','short_answer'))
);
CREATE INDEX quiz_questions_quiz_idx ON public.quiz_questions (quiz_id, position);
CREATE TRIGGER quiz_questions_touch BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT SELECT (id, quiz_id, position, prompt, type, image_url, video_url) ON public.quiz_questions TO anon;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published questions" ON public.quiz_questions FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND q.published = true));
CREATE POLICY "super admin reads questions" ON public.quiz_questions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin writes questions" ON public.quiz_questions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin updates questions" ON public.quiz_questions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes questions" ON public.quiz_questions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quiz_options_question_idx ON public.quiz_options (question_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_options TO authenticated;
GRANT SELECT (id, question_id, position, label) ON public.quiz_options TO anon;
GRANT ALL ON public.quiz_options TO service_role;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published options" ON public.quiz_options FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quiz_questions qq JOIN public.quizzes q ON q.id = qq.quiz_id
    WHERE qq.id = question_id AND q.published = true));
CREATE POLICY "super admin reads options" ON public.quiz_options FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin writes options" ON public.quiz_options FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin updates options" ON public.quiz_options FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes options" ON public.quiz_options FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_name text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quiz_attempts_quiz_idx ON public.quiz_attempts (quiz_id, created_at DESC);
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT INSERT ON public.quiz_attempts TO anon;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can record an attempt" ON public.quiz_attempts FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND q.published = true)
  );
CREATE POLICY "users read own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "super admin reads attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.diagnostic_step_overrides (
  step_id text PRIMARY KEY,
  patch jsonb NOT NULL DEFAULT '{}'::jsonb,
  hidden boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostic_step_overrides TO authenticated;
GRANT SELECT ON public.diagnostic_step_overrides TO anon;
GRANT ALL ON public.diagnostic_step_overrides TO service_role;
ALTER TABLE public.diagnostic_step_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads diagnostic overrides" ON public.diagnostic_step_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin writes diagnostic overrides" ON public.diagnostic_step_overrides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin updates diagnostic overrides" ON public.diagnostic_step_overrides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes diagnostic overrides" ON public.diagnostic_step_overrides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));