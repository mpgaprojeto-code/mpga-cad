-- ==============================================================================
-- PROJETO: mpgaprojeto-code's Project (MPGA - Cadastro & Sorteio Oficial)
-- SCRIPT DE CRIAÇÃO DAS TABELAS NO SUPABASE
-- Execute este script no SQL Editor do painel do Supabase
-- ==============================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABELA 1: registered_children (Cadastro de Crianças Participantes)
-- Armazena os registros com número sequencial e credencial MPGA26-001 a MPGA26-999
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.registered_children (
    id TEXT PRIMARY KEY DEFAULT ('reg-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
    sequence_number INTEGER NOT NULL UNIQUE,
    credential_code TEXT NOT NULL UNIQUE,
    child_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    birth_date TEXT,
    guardian_name TEXT,
    city_neighborhood TEXT,
    whatsapp_phone TEXT,
    referral_source TEXT,
    registered_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para buscas ultrarrápidas
CREATE INDEX IF NOT EXISTS idx_registered_children_seq ON public.registered_children (sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_registered_children_code ON public.registered_children (credential_code);
CREATE INDEX IF NOT EXISTS idx_registered_children_name ON public.registered_children (child_name);

-- ==============================================================================
-- TABELA 2: sorteio_state (Estado em Tempo Real da Premiação / Sorteio)
-- Mantém os 20 ganhadores, ausentes e histórico de substituições sincronizados
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sorteio_state (
    id TEXT PRIMARY KEY DEFAULT 'active',
    winners JSONB NOT NULL DEFAULT '[]'::jsonb,
    absent_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    replacement_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inserir estado inicial do sorteio se não existir
INSERT INTO public.sorteio_state (id, winners, absent_ids, replacement_logs, updated_at)
VALUES ('active', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- Permitir leitura e escrita para o aplicativo web (chave anon)
-- ==============================================================================
ALTER TABLE public.registered_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorteio_state ENABLE ROW LEVEL SECURITY;

-- Políticas para registered_children
DROP POLICY IF EXISTS "Permitir leitura pública de cadastros" ON public.registered_children;
CREATE POLICY "Permitir leitura pública de cadastros"
    ON public.registered_children
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de cadastros" ON public.registered_children;
CREATE POLICY "Permitir inserção pública de cadastros"
    ON public.registered_children
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de cadastros" ON public.registered_children;
CREATE POLICY "Permitir atualização pública de cadastros"
    ON public.registered_children
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir deleção de cadastros" ON public.registered_children;
CREATE POLICY "Permitir deleção de cadastros"
    ON public.registered_children
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- Políticas para sorteio_state
DROP POLICY IF EXISTS "Permitir leitura do estado do sorteio" ON public.sorteio_state;
CREATE POLICY "Permitir leitura do estado do sorteio"
    ON public.sorteio_state
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Permitir atualização do estado do sorteio" ON public.sorteio_state;
CREATE POLICY "Permitir atualização do estado do sorteio"
    ON public.sorteio_state
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- ATIVAR SINCRONIZAÇÃO EM TEMPO REAL (Supabase Realtime)
-- Permite que novas inscrições e sorteios atualizem todas as telas instantaneamente
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'registered_children'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.registered_children;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sorteio_state'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sorteio_state;
    END IF;
END $$;
