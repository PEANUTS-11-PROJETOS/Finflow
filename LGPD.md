# Auditoria LGPD — FinFlow

**Data:** 14/05/2026
**Status:** Pendente de implementação

---

## Nível de Risco Geral: ALTO

O FinFlow coleta CPF, RG, comprovante de residência e histórico financeiro completo de terceiros (devedores) sem as salvaguardas legais obrigatórias pela Lei nº 13.709/2018.

---

## Riscos Críticos — Ação Imediata

### 1. Sem Política de Privacidade nem Termos de Serviço
- Nenhuma página `/politica-privacidade` ou `/termos` existe no projeto
- Links no signup apontam para `href="#"` (placeholder)
- **Artigo violado:** Art. 6º (transparência) e Art. 9º (informações ao titular)
- **Correção:** Criar `/politica-privacidade` e `/termos`. Linkar no rodapé e no signup

### 2. Coleta de dados de terceiros sem base legal documentada
- Devedores (clientes dos credores) nunca interagem com o sistema — não deram consentimento e não podem exercer direitos de titular
- CPF, telefone, e-mail e documentos de identidade são coletados sem que o titular saiba
- **Artigo violado:** Art. 7º (nenhuma base legal documentada)
- **Base legal recomendada:** "Proteção ao crédito" (Art. 7º, X) para CPF e dados financeiros; "Execução de contrato" (Art. 7º, V) para dados operacionais
- **Correção:** Documentar a base legal na Política de Privacidade

### 3. `/api/notify-admin` envia dados pessoais por e-mail
- Arquivo: `src/app/api/notify-admin/route.ts`
- Nome e e-mail do novo usuário enviados em HTML puro via Gmail (Nodemailer) para caixa pessoal do admin
- **Artigo violado:** Art. 46 (segurança no tratamento)
- **Correção:** Substituir por notificação interna no painel admin, sem incluir dados pessoais no e-mail

### 4. Credencial de e-mail exposta no `.env.local`
- `GMAIL_APP_PASSWORD` com valor real está no arquivo `.env.local`
- Se o repositório for público ou o arquivo for commitado por acidente, a credencial vaza
- **Correção:** Confirmar que `.env.local` está no `.gitignore`. Rotacionar a app password

### 5. Documentos de identidade sem política de retenção
- Arquivo: `src/components/dashboard/documentos-cliente.tsx`
- RG, CPF e comprovante de residência armazenados no Supabase Storage indefinidamente
- **Artigo violado:** Art. 15 e 16 (término do tratamento)
- **Correção:** Definir prazo (duração do empréstimo + 5 anos para obrigação legal). Implementar rotina de exclusão ou alerta

---

## Riscos Moderados — Corrigir em até 30 dias

### 6. Soft delete não garante direito ao esquecimento
- `desativarCliente()` apenas define `ativo = false` — dados permanecem no banco
- **Artigo violado:** Art. 18, IV (eliminação)
- **Correção:** Implementar hard delete ou anonimização dos dados pessoais, mantendo apenas os financeiros por obrigação legal

### 7. Exportação CSV restrita por plano pode violar Art. 18
- Arquivo: `src/app/api/exportar/clientes/route.ts`
- Export disponível apenas nos planos Pro e Premium
- **Artigo violado:** Art. 18, I e V (acesso e portabilidade não podem ser condicionados a plano pago)
- **Correção:** Separar export operacional (restrito por plano) do export por direito do titular (disponível para todos)

### 8. Sem logs de auditoria de acesso a dados pessoais
- Nenhum arquivo registra quem acessou, modificou ou exportou dados de clientes
- **Artigo violado:** Art. 6º, X (responsabilização)
- **Correção:** Criar tabela `audit_log` com `user_id`, `acao`, `tabela`, `registro_id`, `ip`, `timestamp`

### 9. E-mail do admin hardcoded no código
- Arquivos: `src/app/(dashboard)/layout.tsx` e `src/app/admin/actions.ts`
- `soaresvinicius11112@gmail.com` hardcoded — expõe dado pessoal no código-fonte
- **Correção:** Mover para variável de ambiente `ADMIN_EMAIL`

### 10. Google Fonts carregando de CDN externa
- `next/font/google` envia o IP do usuário ao Google sem consentimento
- **Artigo violado:** Art. 7º (compartilhamento com terceiro sem base legal)
- **Correção:** Usar `next/font/local` com fontes hospedadas localmente, ou declarar na política de privacidade

---

## Pontos de Atenção

### 11. Stripe preparado mas não implementado
- Quando integrado (Fase 3): exige DPA com Stripe, declaração na política de privacidade e garantia de que dados de cartão nunca passam pelo servidor FinFlow (apenas tokens)

### 12. Sem `.env.example` no repositório
- Facilita onboarding seguro sem expor credenciais reais

---

## Conformidades Identificadas

- RLS (Row Level Security) ativo — cada credor acessa apenas seus próprios dados
- Storage privado com políticas de acesso por `auth.uid()`
- Signed URLs com expiração de 60s para download de documentos
- Cookies de sessão HTTP-only via Supabase SSR
- Validação de dados com Zod nos formulários
- Nenhum tracker de terceiros (sem Google Analytics, Meta Pixel, Hotjar)
- Proteção de rotas no layout do dashboard

---

## Plano de Ação

| # | Ação | Prazo | Artigo LGPD | Status |
|---|------|-------|-------------|--------|
| 1 | Criar Política de Privacidade | Imediato | Art. 6º e 9º | Pendente |
| 2 | Remover dados pessoais do `/api/notify-admin` | Imediato | Art. 46 | Pendente |
| 3 | Garantir `.env.local` no `.gitignore` + rotacionar senha Gmail | Imediato | Art. 46 | Pendente |
| 4 | Documentar base legal para cada tipo de dado | 7 dias | Art. 7º | Pendente |
| 5 | Mover `ADMIN_EMAIL` para variável de ambiente | 7 dias | Boa prática | Pendente |
| 6 | Implementar hard delete / anonimização de clientes | 15 dias | Art. 18, IV | Pendente |
| 7 | Criar tabela `audit_log` | 15 dias | Art. 6º, X | Pendente |
| 8 | Definir política de retenção de documentos | 30 dias | Art. 15 e 16 | Pendente |
| 9 | Separar export operacional do export por direito do titular | 30 dias | Art. 18, I e V | Pendente |
| 10 | Migrar Google Fonts para hospedagem local | 30 dias | Art. 7º | Pendente |
| 11 | Criar DPA com Supabase antes do lançamento | Antes do launch | Art. 33 | Pendente |
| 12 | Criar `.env.example` | Próximo commit | Boa prática | Pendente |

---

## Documentos a Criar

- [ ] Política de Privacidade — obrigatória, cobrir: quais dados, por que, base legal, com quem compartilha, direitos dos titulares, contato do encarregado
- [ ] Registro de Atividades de Tratamento (RoPA) — mapa interno de todos os tratamentos
- [ ] DPA com Supabase — contrato de operador (disponível em supabase.com/legal)
- [ ] Plano de Resposta a Incidentes — o que fazer nas 72h após um vazamento (Res. ANPD 15/2024)
- [ ] `.env.example` — sem valores reais, apenas chaves documentadas

---

## Referências

- Lei nº 13.709/2018 — LGPD
- Resolução CD/ANPD nº 15/2024 — Comunicação de incidentes (prazo: 72h)
- Resolução CD/ANPD nº 4/2023 — Transferências internacionais
- Art. 52 — Multas: até 2% do faturamento ou R$ 50 milhões por infração
