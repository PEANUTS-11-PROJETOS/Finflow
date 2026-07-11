# Carteira — Pauta do dia (design)

Data: 2026-07-08

## Objetivo

Criar uma nova aba **Carteira**: uma pauta diária navegável ("como um caderno"),
onde o credor vê os clientes que vencem naquele dia e dá **baixa rápida** no
pagamento (tudo / parcial / só juros), além de um atalho direto pro WhatsApp do
cliente. A Carteira passa a ser a **aba principal** do app, à frente do Painel.

## Decisões (do brainstorming)

1. **Conteúdo do dia:** cada dia mostra **apenas** as parcelas com `vencimento`
   naquela data (metáfora do caderno). Atrasados de dias anteriores **não**
   sobem pro dia de hoje — vê-se cada um paginando pro dia dele.
2. **Tipos de empréstimo:** Renovável e Price aparecem juntos. Renovável usa as
   três ações (Tudo/Parcial/Só juros); Price usa **só "Tudo"**.
3. **Confirmação:** "Tudo" e "Só juros" usam **mini-confirmação de 2 toques**
   ("Confirmar pagamento de R$ X?"). "Parcial" já abre modal pra digitar o valor.
4. **Migração:** Carteira vira a aba principal (1º no menu; login e "/" passam a
   levar pra `/carteira`). A página `/a-receber-hoje` é **aposentada** (redirect
   pra `/carteira`). O card "A receber hoje" do Painel passa a linkar pra Carteira.
5. **Colunas por linha:** "Valor que pegou" (principal) e "Valor da parcela"
   (total do vencimento). O juros **não** é coluna própria (fica implícito).
6. **Totais do topo:** "A receber hoje" + "Baixados X/Y". Sem "Juros do dia".

## Arquitetura (Abordagem A — Server Component + `?dia=`)

Página Server Component que lê o dia da URL, consulta no servidor e renderiza.
As linhas são componentes client que chamam as **server actions de pagamento já
existentes**. Paginação = navegação com `prefetch` (troca instantânea). Segue o
padrão da atual `/a-receber-hoje` e reaproveita 100% da lógica de pagamento.

### Rota e navegação

- Rota: `/carteira`, com dia via query param: `/carteira?dia=YYYY-MM-DD`
  (sem parâmetro = hoje).
- Item de menu "Carteira" em **1º lugar**: Carteira · Painel · Clientes ·
  Empréstimos · Configurações (sidebar no desktop, tab bar no mobile).
- Login e "/" passam a redirecionar pra `/carteira` (hoje vão pro `/dashboard`).
- `/a-receber-hoje` → `redirect('/carteira')`.

### Consulta do dia

```
parcelas
  .select('id, valor, valor_juros, vencimento, pago, rolado, baixa,
           emprestimos(id, tipo, valor_principal, taxa_juros,
                       clientes(id, nome, telefone))')
  .eq('credor_id', user.id)
  .eq('vencimento', dia)
```

Inclui as **já baixadas** (pago/rolado) pra mostrar o estado concluído e o
contador. Ordenação: em aberto no topo, baixadas embaixo.

### Dados exibidos por linha

- **Renovável:** "Valor que pegou" = `emprestimos.valor_principal`;
  "Valor da parcela" = `parcela.valor` (principal + juros).
- **Price:** "Valor que pegou" = `emprestimos.valor_principal`;
  "Valor da parcela" = `parcela.valor` (a parcela em si).

### Totais do topo

- **A receber hoje** = Σ `parcela.valor` de todas as parcelas do dia.
- **Baixados X/Y** = quantas têm `pago || rolado` sobre o total do dia.

## Ações da linha

| Ação | Renovável | Price | Confirmação |
|---|---|---|---|
| Tudo | `pagarTudo(parcelaId)` | `marcarParcela(parcelaId, true)` | 2 toques |
| Parcial | modal → `pagarParcial(parcelaId, valor)` | oculto | modal (digita valor) |
| Só juros | `pagarJuros(parcelaId)` | oculto | 2 toques |
| WhatsApp | `wa.me/55<telefone>` com msg pronta | idem | — |

- Após qualquer baixa: `router.refresh()` atualiza a lista na hora.
- WhatsApp desabilitado quando o cliente não tem telefone.
- **Linha já baixada:** mostra o rótulo do que aconteceu ("✓ Pagou tudo" /
  "Pagou parcial" / "Rolou só os juros"), esmaecida; WhatsApp continua ativo.

As server actions (`pagarTudo`, `pagarJuros`, `pagarParcial`, `marcarParcela`)
já existem em `src/app/(dashboard)/emprestimos/actions.ts` e são reaproveitadas.

## Migração de dados

Nova coluna em `parcelas`: **`baixa`** — `null | 'tudo' | 'parcial' | 'juros'`.
Preenchida pelas 4 actions no momento da baixa. Motivo: hoje "parcial" não é
distinguível de "tudo" só pelos flags (`pago`/`rolado`); a coluna deixa o
histórico e o rótulo da linha corretos. Migration aplicada manualmente no
Supabase (padrão do projeto):

```sql
alter table parcelas
  add column if not exists baixa text
  check (baixa in ('tudo','parcial','juros'));
```

## Estrutura de arquivos

- `src/app/(dashboard)/carteira/page.tsx` — Server Component (query + totais + render).
- `src/app/(dashboard)/carteira/loading.tsx` — skeleton.
- `src/components/carteira/day-nav.tsx` — ‹ › + data grande + "Trocar dia" (date picker), com `prefetch`.
- `src/components/carteira/pauta-row.tsx` — Client Component: uma linha com ações, mini-confirmação e WhatsApp.
- `src/components/carteira/parcial-modal.tsx` — modal do pagamento parcial.
- Ajustes: item de nav (componente da sidebar/tab bar), redirect de `/a-receber-hoje`,
  destino de login/"/", link do card "A receber hoje" no dashboard, e as 4 actions
  passam a gravar `baixa`.

## Layouts

- **Desktop:** tabela — Cliente · Valor que pegou · Valor da parcela · Como pagou
  (ações) · Zap; rodapé "Total do dia"; cabeçalho com data grande + ‹ › + "Trocar dia".
- **Mobile:** cards empilhados; dois cards de total no topo ("A receber" / "Baixados");
  ações em linha; ícone WhatsApp no canto do card.

## Estados

- **Dia sem parcelas:** empty state amigável ("Nenhuma cobrança nesse dia" ☕).
- **Trocar dia:** seletor de data pra pular pra qualquer dia.

## Fora de escopo (YAGNI)

- Acumular atrasados no dia de hoje (decidido: cada dia só o seu).
- "Desfazer" pós-baixa (optou-se pela mini-confirmação).
- Parcial/Só juros para Price (não se aplica ao modelo).
- Juros de mora diária na pauta (existe no card de detalhe; não entra nesta v1).
```
