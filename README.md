# pixel-perfect-replication

## Supabase

1) Crie um arquivo `.env` (ou `.env.local`) na raiz baseado em `.env.example`.

2) Preencha:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3) Use o cliente em `src/lib/supabaseClient.ts`.

## Supabase Auth (Email + Senha)

O app está configurado para login/cadastro por **email + senha**:

- **Log In**: pede email e senha
- **Sign Up**: cria conta com email e senha

### Checklist no Dashboard

No Supabase Dashboard:

1) **Authentication → Providers**: habilite **Email**

2) (Opcional) **Authentication → Settings**: configure se o projeto exige **confirmação de email** no cadastro.

Se a confirmação estiver ligada, o cadastro pode não criar sessão imediatamente até o usuário confirmar no email.

### Persistência (apostas, jogos acessados, saldo)

Este projeto cria no Supabase:

- `public.game_access_events` (jogos acessados)
- `public.bets` (apostas)
- `public.wallet_transactions` (razão/ledger do saldo)
- RPCs: `log_game_access`, `wallet_get_balance`, `wallet_place_bet`

Observação: essas tabelas usam `auth.users` (Supabase Auth). Para gravar dados por usuário, é necessário o usuário estar autenticado.

Exemplo (query simples):

```ts
import { assertSupabase } from "@/lib/supabaseClient";

const supabase = assertSupabase();
const { data, error } = await supabase.from("sua_tabela").select("*").limit(10);
```
