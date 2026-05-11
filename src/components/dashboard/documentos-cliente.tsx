'use client'
import { useState, useRef, useTransition } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TIPOS = [
  { value: 'rg',                      label: 'RG' },
  { value: 'comprovante_residencia',   label: 'Comprovante de Residência' },
  { value: 'cpf',                      label: 'CPF' },
  { value: 'outro',                    label: 'Outro' },
]

type Doc = {
  id: string
  tipo: string
  nome: string
  storage_path: string
  created_at: string
}

interface Props {
  clienteId: string
  credorId: string
  documentosIniciais: Doc[]
}

export function DocumentosCliente({ clienteId, credorId, documentosIniciais }: Props) {
  const [docs, setDocs]         = useState<Doc[]>(documentosIniciais)
  const [tipo, setTipo]         = useState('rg')
  const [uploading, setUploading] = useState(false)
  const [, startTransition]     = useTransition()
  const inputRef                = useRef<HTMLInputElement>(null)

  const tipoLabel = (t: string) => TIPOS.find(x => x.value === t)?.label ?? t

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10 MB.')
      return
    }

    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${credorId}/${clienteId}/${Date.now()}_${tipo}.${ext}`

    const { error: storageErr } = await supabase.storage
      .from('documentos-clientes')
      .upload(path, file)

    if (storageErr) {
      toast.error('Erro ao enviar arquivo.')
      setUploading(false)
      return
    }

    const { data: doc, error: dbErr } = await supabase
      .from('documentos_clientes')
      .insert({ cliente_id: clienteId, credor_id: credorId, tipo, nome: file.name, storage_path: path })
      .select()
      .single()

    if (dbErr || !doc) {
      toast.error('Erro ao salvar registro.')
      await supabase.storage.from('documentos-clientes').remove([path])
      setUploading(false)
      return
    }

    setDocs(prev => [...prev, doc as Doc])
    toast.success(`${tipoLabel(tipo)} anexado com sucesso.`)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDownload(doc: Doc) {
    const { data, error } = await supabase.storage
      .from('documentos-clientes')
      .createSignedUrl(doc.storage_path, 60)

    if (error || !data) { toast.error('Erro ao gerar link.'); return }
    window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(doc: Doc) {
    startTransition(async () => {
      const { error: storageErr } = await supabase.storage
        .from('documentos-clientes')
        .remove([doc.storage_path])

      if (storageErr) { toast.error('Erro ao remover arquivo.'); return }

      await supabase.from('documentos_clientes').delete().eq('id', doc.id)
      setDocs(prev => prev.filter(d => d.id !== doc.id))
      toast.success('Documento removido.')
    })
  }

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring"
        >
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleUpload}
        />

        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
            : <><Upload className="h-4 w-4 mr-2" />Anexar documento</>
          }
        </Button>
        <span className="text-xs text-muted-foreground">PDF, JPG ou PNG · máx. 10 MB</span>
      </div>

      {/* Lista */}
      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 bg-background"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.nome}</p>
                  <p className="text-xs text-muted-foreground">{tipoLabel(doc.tipo)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Abrir">
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(doc)}
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
