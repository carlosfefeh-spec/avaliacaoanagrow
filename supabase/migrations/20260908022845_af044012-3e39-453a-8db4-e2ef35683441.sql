CREATE TABLE public.quiz_customization (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.quiz_customization TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_customization TO authenticated;
GRANT ALL ON public.quiz_customization TO service_role;

ALTER TABLE public.quiz_customization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads quiz customization" ON public.quiz_customization
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin writes quiz customization" ON public.quiz_customization
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin updates quiz customization" ON public.quiz_customization
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes quiz customization" ON public.quiz_customization
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER quiz_customization_touch BEFORE UPDATE ON public.quiz_customization
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();