# 🚀 Guia Completo de Deploy - Idle Breakout Game

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no GitHub
- Conta no Vercel
- Conta no Supabase (já configurada)

## 🔧 1. Preparando o Projeto Localmente

### Instalar dependências
\`\`\`bash
npm install
\`\`\`

### Criar arquivo .env.local
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# Database Configuration (Postgres via Supabase)
POSTGRES_URL=sua_postgres_url
POSTGRES_PRISMA_URL=sua_postgres_prisma_url
POSTGRES_URL_NON_POOLING=sua_postgres_url_non_pooling
POSTGRES_USER=seu_usuario_postgres
POSTGRES_PASSWORD=sua_senha_postgres
POSTGRES_DATABASE=seu_database_postgres
POSTGRES_HOST=seu_host_postgres

# Supabase Internal
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_JWT_SECRET=seu_jwt_secret
\`\`\`

### Testar localmente
\`\`\`bash
npm run dev
\`\`\`
Acesse: http://localhost:3000

## 📤 2. Subindo para o GitHub

### Inicializar Git (se ainda não foi feito)
\`\`\`bash
git init
git add .
git commit -m "Initial commit - Idle Breakout Game"
\`\`\`

### Criar repositório no GitHub
1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Nome: `idle-breakout-game`
4. Deixe público ou privado (sua escolha)
5. NÃO marque "Initialize with README" (já temos arquivos)
6. Clique "Create repository"

### Conectar e enviar código
\`\`\`bash
git remote add origin https://github.com/SEU_USUARIO/idle-breakout-game.git
git branch -M main
git push -u origin main
\`\`\`

## 🌐 3. Deploy no Vercel

### Método 1: Via Dashboard Vercel (Recomendado)
1. Acesse [Vercel](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique "New Project"
4. Selecione seu repositório `idle-breakout-game`
5. Configure as variáveis de ambiente (veja seção abaixo)
6. Clique "Deploy"

### Método 2: Via CLI Vercel
\`\`\`bash
npm i -g vercel
vercel login
vercel --prod
\`\`\`

## ⚙️ 4. Configurando Variáveis de Ambiente no Vercel

### No Dashboard Vercel:
1. Vá para seu projeto
2. Clique em "Settings"
3. Clique em "Environment Variables"
4. Adicione TODAS as variáveis do seu `.env.local`:

**Variáveis Obrigatórias:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Via CLI:
\`\`\`bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... adicione todas as outras
\`\`\`

## 🗄️ 5. Configurando Banco de Dados

### Executar Scripts SQL no Supabase
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá para "SQL Editor"
3. Execute o script de criação de tabelas:

\`\`\`sql
-- Criar tabela de progresso do jogo
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  balls INTEGER DEFAULT 0,
  upgrades JSONB DEFAULT '{}',
  prestige JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{"volume": 50}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Users can manage their own game progress" ON game_progress
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

## 🔄 6. Atualizações Futuras

### Para atualizar o projeto:
\`\`\`bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
\`\`\`

O Vercel fará deploy automático a cada push!

## 🎮 7. Testando o Deploy

1. Acesse a URL fornecida pelo Vercel
2. Teste todas as funcionalidades:
   - Menu principal
   - Gameplay
   - Sistema de upgrades
   - Salvamento de progresso
   - Responsividade mobile

## 🆘 8. Solução de Problemas

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme que não há erros de TypeScript

### Erro de Banco de Dados
- Verifique se as variáveis de ambiente estão corretas
- Confirme se as tabelas foram criadas no Supabase

### Erro de Autenticação
- Verifique as chaves do Supabase
- Confirme se as políticas RLS estão configuradas

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel Dashboard
2. Teste localmente primeiro
3. Confirme se todas as variáveis de ambiente estão configuradas

---

🎉 **Parabéns! Seu Idle Breakout Game está online!**
