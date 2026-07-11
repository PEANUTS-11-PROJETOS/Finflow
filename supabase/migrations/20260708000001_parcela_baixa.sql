-- Tipo de baixa da parcela: como o pagamento foi registrado (usado pela Carteira).
-- null = parcela em aberto (ainda não baixada).
ALTER TABLE parcelas ADD COLUMN IF NOT EXISTS baixa TEXT CHECK (baixa IN ('tudo','parcial','juros'));
