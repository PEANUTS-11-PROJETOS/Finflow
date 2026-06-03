-- FinFlow — Plano único (trial / ativo)
-- Substitui o modelo free / pro / premium por um trial de 30 dias seguido de plano pago único.

ALTER TABLE credores ALTER COLUMN plano SET DEFAULT 'trial';

UPDATE credores
   SET plano = CASE
                 WHEN pagamento_confirmado = TRUE THEN 'ativo'
                 ELSE 'trial'
               END
 WHERE plano IN ('free', 'pro', 'premium');
