-- Grants explícitos exigidos a partir de out/2026 (mudança Supabase Data API)
-- Sem estes grants, PostgREST retorna erro 42501 mesmo com RLS configurado.
-- anon não recebe acesso — todas as rotas exigem autenticação.

grant select, insert, update, delete
  on public.credores
  to authenticated, service_role;

grant select, insert, update, delete
  on public.clientes
  to authenticated, service_role;

grant select, insert, update, delete
  on public.emprestimos
  to authenticated, service_role;

grant select, insert, update, delete
  on public.parcelas
  to authenticated, service_role;

grant select, insert, update, delete
  on public.documentos_clientes
  to authenticated, service_role;
