# 🚀 Guia de Migração para Vercel

Este guia explica como fazer deploy do Aurion Trading em um servidor externo (Vercel) usando seu próprio projeto Supabase.

## 📋 Pré-requisitos

1. **Conta Vercel** - [Criar em vercel.com](https://vercel.com)
2. **Projeto Supabase** - [Criar em supabase.com](https://supabase.com)
3. **Chave API do Gemini** - [Obter em aistudio.google.com](https://aistudio.google.com/apikey)
4. **Repositório GitHub** conectado

## 🔧 Variáveis de Ambiente Necessárias

Configure estas variáveis no Vercel (Settings → Environment Variables):

### Frontend (Obrigatórias)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend/Edge Functions (Obrigatórias)
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
```

### Opcionais
```env
BINANCE_API_KEY=sua_chave_binance
BINANCE_API_SECRET=seu_secret_binance
HELIUS_API_KEY=sua_chave_helius
VITE_PROXY_WS_URL=wss://seu-websocket.com
```

## 📦 Estrutura do Projeto

```
aurion-trading/
├── src/                    # Código frontend React
│   ├── lib/
│   │   ├── supabase-standalone.ts  # Cliente Supabase standalone
│   │   ├── gemini-client.ts        # Cliente Gemini direto
│   │   └── env-config.ts           # Configuração de ambiente
│   └── ...
├── supabase/
│   └── functions/          # Edge Functions do Supabase
├── vercel.json             # Configuração do Vercel
└── package.json
```

## 🗄️ Configuração do Supabase

### 1. Criar Tabelas
Execute as migrações SQL no seu projeto Supabase. As tabelas necessárias são:

- `active_operations`
- `trade_history`
- `user_credits`
- `user_trading_settings`
- `aurion_ai_conversations`
- `aurion_ai_messages`
- `aurion_ai_instructions`
- `aurion_simulated_trades`
- `binance_credentials`
- `credit_transactions`
- `momentum_history`
- `profit_totals`

### 2. Configurar RLS
Habilite Row Level Security em todas as tabelas e configure as políticas conforme o schema original.

### 3. Deploy das Edge Functions
As Edge Functions precisam ser deployadas no seu projeto Supabase:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar ao seu projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy das functions
supabase functions deploy aurion-full-analysis
supabase functions deploy aurion-ai-chat
supabase functions deploy aurion-gemini-analysis
supabase functions deploy crypto-news
supabase functions deploy dexscreener-scanner
# ... outras functions
```

### 4. Configurar Secrets no Supabase
```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase secrets set BINANCE_API_KEY=sua_chave
supabase secrets set BINANCE_API_SECRET=seu_secret
supabase secrets set HELIUS_API_KEY=sua_chave
```

## 🚀 Deploy no Vercel

### 1. Conectar GitHub
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório do GitHub
3. Configure as variáveis de ambiente

### 2. Build Settings
O arquivo `vercel.json` já está configurado com:
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite

### 3. Deploy
Clique em "Deploy" e aguarde o build completar.

## ✅ Verificação

Após o deploy, verifique:

1. **Frontend** - Acesse a URL do Vercel
2. **Auth** - Teste login/registro
3. **Database** - Verifique se dados estão salvando
4. **AI Analysis** - Teste o botão "Aurion AI"
5. **Edge Functions** - Verifique logs no Supabase Dashboard

## 🔄 Diferenças da Versão Lovable

| Feature | Lovable | Standalone |
|---------|---------|------------|
| AI Gateway | Lovable AI Gateway | Gemini API direto |
| Créditos AI | Sistema Lovable | Sem limite (sua API) |
| Supabase | Lovable Cloud | Seu projeto |
| Deploy | Automático | Manual (Vercel) |

## ❓ Troubleshooting

### Erro de CORS
Verifique se as Edge Functions têm os headers CORS corretos.

### AI não funciona
1. Verifique se `GEMINI_API_KEY` está configurada
2. Verifique logs no Supabase Dashboard
3. Teste a API diretamente: `curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY`

### Auth não funciona
1. Verifique se as URLs do Supabase estão corretas
2. Confirme que "Enable email confirmations" está OFF para testes

## 📞 Suporte

Para dúvidas sobre:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Gemini API**: [ai.google.dev/docs](https://ai.google.dev/docs)
