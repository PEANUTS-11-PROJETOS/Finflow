-- Tipo do empréstimo: 'price' (parcelas fixas) | 'renovavel' (juros mensais com rolagem)
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'price';

-- Para empréstimos renováveis: num_parcelas não se aplica — deixar nullable
ALTER TABLE emprestimos ALTER COLUMN num_parcelas DROP NOT NULL;

-- Para parcelas de empréstimos renováveis
ALTER TABLE parcelas ADD COLUMN IF NOT EXISTS valor_juros NUMERIC(12,2);
ALTER TABLE parcelas ADD COLUMN IF NOT EXISTS rolado BOOLEAN DEFAULT FALSE;
