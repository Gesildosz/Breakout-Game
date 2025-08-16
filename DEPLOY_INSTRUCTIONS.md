# 🎮 Idle Breakout Game - Instruções de Deploy

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- Conta no GitHub
- Conta no Vercel

## 🚀 Como rodar localmente

### 1. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar variáveis de ambiente
O projeto já está configurado com Supabase. As variáveis de ambiente são:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Executar o banco de dados
Execute o script SQL para criar as tabelas:
\`\`\`bash
# O script está em: scripts/create-game-progress-table.sql
# Execute este script no seu Supabase Dashboard ou através da v0 UI
\`\`\`

### 4. Rodar o projeto
\`\`\`bash
npm run dev
\`\`\`

O jogo estará disponível em: `http://localhost:3000`

## 📱 Funcionalidades Mobile

✅ Layout totalmente responsivo
✅ Controles touch otimizados
✅ Canvas adaptável para diferentes tamanhos de tela
✅ Interface mobile-friendly

## 🎯 Funcionalidades do Jogo

### 🎮 Gameplay
- **Menu Principal**: Opções "Jogar" e "Sair"
- **Sistema de Levels**: Progressão sequencial 1→2→3→4...
- **Bolas Inteligentes**: Sistema anti-loop que detecta bolas presas
- **Tijolos Variados**: Múltiplos tipos com diferentes resistências
- **Recompensas por Level**: 100 coins base + 5% por level

### 🔧 Sistemas Avançados
- **Controle de Volume**: 0% a 100% nas configurações
- **Sons de Colisão**: Feedback auditivo nas batidas
- **Detecção de Loops**: Bolas presas são automaticamente redirecionadas
- **Save Automático**: Progresso salvo no Supabase a cada 10 segundos

### 💾 Banco de Dados
- **Supabase Integration**: Progresso salvo na nuvem
- **Fallback LocalStorage**: Funciona offline
- **Row Level Security**: Dados seguros por usuário

## 🚀 Deploy no GitHub e Vercel

### 1. Subir para o GitHub

\`\`\`bash
# Inicializar repositório Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "🎮 Idle Breakout Game - Versão completa mobile-ready"

# Conectar com repositório GitHub (substitua pelo seu)
git remote add origin https://github.com/SEU_USUARIO/idle-breakout-game.git

# Enviar para GitHub
git push -u origin main
\`\`\`

### 2. Deploy no Vercel

#### Opção A: Via GitHub (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte sua conta GitHub
4. Selecione o repositório `idle-breakout-game`
5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Clique em "Deploy"

#### Opção B: Via Vercel CLI
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy final
vercel --prod
\`\`\`

### 3. Configurar Domínio (Opcional)
1. No dashboard do Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

## 🔧 Configurações Adicionais

### Supabase RLS (Row Level Security)
As políticas de segurança já estão configuradas no script SQL:
- Usuários só acessam seus próprios dados
- Autenticação automática via JWT

### Performance
- **Next.js App Router**: Otimizado para performance
- **Canvas Rendering**: 60 FPS garantidos
- **Lazy Loading**: Componentes carregados sob demanda
- **Mobile Optimized**: Renderização otimizada para dispositivos móveis

## 🎮 Como Jogar

1. **Menu Principal**: Clique em "Jogar" para começar
2. **Comprar Bolas**: Use a loja para comprar sua primeira bola
3. **Quebrar Tijolos**: As bolas quebram tijolos automaticamente
4. **Ganhar Coins**: Colete coins e compre upgrades
5. **Progredir Levels**: Complete levels para ganhar recompensas
6. **Configurações**: Ajuste o volume no ícone de engrenagem

## 🐛 Troubleshooting

### Problema: Bolas não aparecem
**Solução**: Compre bolas na loja de upgrades

### Problema: Som não funciona
**Solução**: Verifique o volume nas configurações

### Problema: Progresso não salva
**Solução**: Verifique a conexão com Supabase nas variáveis de ambiente

### Problema: Layout quebrado no mobile
**Solução**: O layout é responsivo, tente recarregar a página

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console (F12)
2. Confirme as variáveis de ambiente
3. Teste a conexão com Supabase
4. Verifique se o script SQL foi executado

---

🎉 **Parabéns! Seu Idle Breakout Game está pronto para o mundo!** 🎉
