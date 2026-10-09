# Integração com Supabase - "mpgaprojeto-code's Project"

Este guia explica como vincular seu projeto Supabase **mpgaprojeto-code's Project** ao sistema de Cadastro e Sorteio.

---

### Passo 1: Executar o script SQL no Supabase
1. Acesse o painel do Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Abra o projeto **mpgaprojeto-code's Project**
3. No menu lateral esquerdo, clique em **SQL Editor**
4. Clique em **+ New query**
5. Copie e cole todo o conteúdo do arquivo `supabase/schema.sql` (ou acesse a rota `/api/supabase/schema` no aplicativo)
6. Clique no botão verde **Run** (Executar)

O script irá criar automaticamente:
- A tabela `registered_children` (com credenciais sequenciais `MPGA26-001`, campos de responsável, telefone, bairro, etc.)
- A tabela `sorteio_state` (com premiação dos 20 ganhadores, ausentes e histórico de substituições)
- Índices otimizados para busca rápida
- Políticas de segurança (Row Level Security - RLS)
- Ativação do Supabase Realtime para sincronização simultânea em todos os dispositivos

---

### Passo 2: Configurar as Variáveis de Ambiente
No painel do Supabase, acesse **Project Settings** > **API**:
1. Copie o valor de **Project URL** (ex: `https://xyzcompany.supabase.co`)
2. Copie o valor de **anon public** (a chave pública JWT)

Defina as variáveis no ambiente da aplicação:
```env
VITE_SUPABASE_URL="https://SEU_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Passo 3: Funcionamento
- Assim que as variáveis forem configuradas, o sistema passará a utilizar o Supabase em tempo real.
- Todas as novas crianças cadastradas e todos os sorteios e substituições são persistidos instantaneamente na nuvem do Supabase.
