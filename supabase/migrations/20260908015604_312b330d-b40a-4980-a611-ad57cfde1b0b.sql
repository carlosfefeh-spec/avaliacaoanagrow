CREATE TABLE public.quiz_funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event text NOT NULL,
  step_id text,
  step_index integer,
  step_kind text,
  progress integer,
  time_on_step numeric,
  option_id text,
  option_label text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  variants jsonb NOT NULL DEFAULT '{}'::jsonb,
  utms jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.quiz_funnel_events TO anon;
GRANT SELECT, INSERT ON public.quiz_funnel_events TO authenticated;
GRANT ALL ON public.quiz_funnel_events TO service_role;

ALTER TABLE public.quiz_funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can record funnel events"
  ON public.quiz_funnel_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "super admin reads funnel events"
  ON public.quiz_funnel_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE INDEX quiz_funnel_events_created_at_idx ON public.quiz_funnel_events (created_at DESC);
CREATE INDEX quiz_funnel_events_session_idx ON public.quiz_funnel_events (session_id);
CREATE INDEX quiz_funnel_events_event_idx ON public.quiz_funnel_events (event);

CREATE TABLE public.quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  phone_digits text NOT NULL DEFAULT '',
  email text,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  cause text,
  protocol_id text,
  protocol_title text,
  recovery_chance integer,
  ferritin text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  utms jsonb NOT NULL DEFAULT '{}'::jsonb,
  variants jsonb NOT NULL DEFAULT '{}'::jsonb,
  webhook_ok boolean NOT NULL DEFAULT false,
  webhook_status integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quiz_leads TO authenticated;
GRANT ALL ON public.quiz_leads TO service_role;

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin reads leads"
  ON public.quiz_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE INDEX quiz_leads_created_at_idx ON public.quiz_leads (created_at DESC);