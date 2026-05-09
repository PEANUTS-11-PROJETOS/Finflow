-- FinFlow — Schema Inicial
-- Credores (1:1 com auth.users)
CREATE TABLE IF NOT EXISTS credores (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                     TEXT NOT NULL,
  email                    TEXT NOT NULL,
  plano                    TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes do credor (devedores)
CREATE TABLE IF NOT EXISTS clientes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credor_id   UUID NOT NULL REFERENCES credores(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  cpf         TEXT,
  telefone    TEXT,
  email       TEXT,
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credor_id       UUID NOT NULL REFERENCES credores(id) ON DELETE CASCADE,
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  valor_principal NUMERIC(12,2) NOT NULL,
  taxa_juros      NUMERIC(5,2)  NOT NULL,
  num_parcelas    INTEGER       NOT NULL,
  data_inicio     DATE          NOT NULL,
  status          TEXT          DEFAULT 'ativo',
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Parcelas geradas automaticamente
CREATE TABLE IF NOT EXISTS parcelas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emprestimo_id  UUID NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
  credor_id      UUID NOT NULL REFERENCES credores(id),
  numero         INTEGER        NOT NULL,
  valor          NUMERIC(12,2)  NOT NULL,
  vencimento     DATE           NOT NULL,
  pago           BOOLEAN        DEFAULT FALSE,
  data_pagamento DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE credores    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas    ENABLE ROW LEVEL SECURITY;

-- Credor: lê e edita apenas o próprio perfil
CREATE POLICY "credor_proprio" ON credores
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Clientes: apenas os do credor logado
CREATE POLICY "credor_proprio" ON clientes
  USING (credor_id = auth.uid())
  WITH CHECK (credor_id = auth.uid());

-- Empréstimos: apenas os do credor logado
CREATE POLICY "credor_proprio" ON emprestimos
  USING (credor_id = auth.uid())
  WITH CHECK (credor_id = auth.uid());

-- Parcelas: apenas as do credor logado
CREATE POLICY "credor_proprio" ON parcelas
  USING (credor_id = auth.uid())
  WITH CHECK (credor_id = auth.uid());

-- ─── Trigger: criar perfil credor ao signup ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.credores (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
