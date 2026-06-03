-- FinFlow — Registro de aceite dos termos (LGPD)
-- Adiciona colunas em credores e atualiza handle_new_user para gravar o aceite
-- vindo do metadata `termos_versao` passado no signUp do Supabase Auth.

ALTER TABLE credores
  ADD COLUMN IF NOT EXISTS termos_aceitos_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS termos_versao     TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_termos_versao TEXT;
BEGIN
  v_termos_versao := NEW.raw_user_meta_data->>'termos_versao';

  INSERT INTO public.credores (
    id, nome, email, termos_versao, termos_aceitos_em
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    v_termos_versao,
    CASE WHEN v_termos_versao IS NOT NULL THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$$;
