-- Quiz tracking writes move to trusted server code only
drop policy if exists "anyone can start a quiz session" on public.quiz_sessions;
drop policy if exists "anyone can update a quiz session" on public.quiz_sessions;
drop policy if exists "anyone can record a quiz answer" on public.quiz_answers;
drop policy if exists "anyone can record funnel events" on public.quiz_funnel_events;

revoke insert, update, delete on public.quiz_sessions from anon, authenticated;
revoke insert, update, delete on public.quiz_answers from anon, authenticated;
revoke insert, update, delete on public.quiz_funnel_events from anon, authenticated;
revoke all on public.quiz_leads from anon;
grant all on public.quiz_sessions to service_role;
grant all on public.quiz_answers to service_role;
grant all on public.quiz_funnel_events to service_role;
grant all on public.quiz_leads to service_role;

-- Diagnostic overrides are internal configuration
drop policy if exists "anyone reads diagnostic overrides" on public.diagnostic_step_overrides;
create policy "super admin reads diagnostic overrides"
  on public.diagnostic_step_overrides for select to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
revoke select on public.diagnostic_step_overrides from anon;
grant all on public.diagnostic_step_overrides to service_role;

-- SECURITY DEFINER surface reduced
drop function if exists public.claim_super_admin();
drop function if exists public.quiz_session_progress(uuid, integer);
drop function if exists public.quiz_session_complete(uuid);
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

-- Stored media readable only for published quizzes (or super admins)
drop policy if exists "quiz media readable" on storage.objects;
create policy "published quiz media readable"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'quiz-media'
    and exists (
      select 1 from public.quizzes q
      where q.published = true
        and (storage.foldername(name))[1] = q.id::text
    )
  );
create policy "super admin reads quiz media"
  on storage.objects for select to authenticated
  using (bucket_id = 'quiz-media' and public.has_role(auth.uid(), 'super_admin'));