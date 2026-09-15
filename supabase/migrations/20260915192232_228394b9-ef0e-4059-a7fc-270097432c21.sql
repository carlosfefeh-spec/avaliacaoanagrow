CREATE OR REPLACE FUNCTION public.quiz_session_progress(p_id uuid, p_position integer)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.quiz_sessions SET current_question_position = p_position WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.quiz_session_complete(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.quiz_sessions SET status = 'completed', completed_at = now() WHERE id = p_id;
$$;

REVOKE ALL ON FUNCTION public.quiz_session_progress(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.quiz_session_complete(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quiz_session_progress(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.quiz_session_complete(uuid) TO anon;