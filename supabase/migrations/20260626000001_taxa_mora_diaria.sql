-- Juros de mora por atraso (% ao dia). Campo opcional — null = sem mora configurada.
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS taxa_mora_diaria NUMERIC(6,4);
