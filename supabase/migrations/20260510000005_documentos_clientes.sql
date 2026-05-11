-- Documentos dos clientes (RG, comprovante de residência, etc.)
CREATE TABLE IF NOT EXISTS documentos_clientes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  credor_id    UUID NOT NULL REFERENCES credores(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL DEFAULT 'outro', -- rg | comprovante_residencia | outro
  nome         TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documentos_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credor_proprio" ON documentos_clientes
  USING (credor_id = auth.uid())
  WITH CHECK (credor_id = auth.uid());

-- Bucket privado para documentos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('documentos-clientes', 'documentos-clientes', false)
  ON CONFLICT DO NOTHING;

CREATE POLICY "upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "download" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos-clientes' AND (storage.foldername(name))[1] = auth.uid()::text);
