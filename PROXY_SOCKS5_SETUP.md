# Configuração do Proxy SOCKS5 para Binance Futures

Este guia explica como configurar o proxy SOCKS5 no seu VPS para rotear requisições autenticadas para a Binance Futures API.

## 📋 Informações do Proxy SOCKS5

- **Host**: 104.248.136.155
- **Porta**: 8888
- **Tipo**: SOCKS5
- **Usuário**: lovable-proxy
- **Senha**: manu123

## ✅ Implementação Atual

A Edge Function `binance-trading` agora conecta **diretamente** ao proxy SOCKS5, sem necessidade de proxy HTTP intermediário.

### Fluxo de Conexão

```
Edge Function (Supabase) 
    ↓ (TCP via SOCKS5)
SOCKS5 Server (104.248.136.155:8888)
    ↓ (tunnel autenticado)
Binance Futures API (fapi.binance.com:443 via TLS)
```

### Protocolo Implementado

1. **Handshake SOCKS5**: Solicita método de autenticação username/password
2. **Autenticação**: Envia credenciais (`lovable-proxy:manu123`)
3. **Conexão**: Solicita túnel para `fapi.binance.com:443`
4. **TLS**: Estabelece handshake TLS sobre o túnel SOCKS5
5. **HTTP**: Envia requisições HTTPS através do túnel criptografado

## 🔧 Instalação no VPS

### 1. Instalar Dependências

```bash
# Conectar ao VPS
ssh root@104.248.136.155

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20.x (se ainda não instalado)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Instalar o Pacote SOCKS

```bash
# Criar diretório para o proxy
mkdir -p /opt/binance-proxy
cd /opt/binance-proxy

# Inicializar package.json
npm init -y

# Instalar dependência SOCKS
npm install socks
```

### 3. Criar o Servidor Proxy

Copie o arquivo `proxy-server-socks5.js` para o VPS:

```bash
# No seu computador local (onde está o arquivo)
scp proxy-server-socks5.js root@104.248.136.155:/opt/binance-proxy/

# OU crie manualmente no VPS
nano /opt/binance-proxy/proxy-server-socks5.js
# Cole o conteúdo do arquivo e salve (Ctrl+X, Y, Enter)
```

### 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano /opt/binance-proxy/.env
```

Adicione o seguinte conteúdo:

```env
PORT=3000
SOCKS_HOST=127.0.0.1
SOCKS_PORT=8888
SOCKS_USER=lovable-proxy
SOCKS_PASSWORD=manu125523
```

Salve e feche (Ctrl+X, Y, Enter).

### 5. Instalar PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo de configuração do PM2
nano /opt/binance-proxy/ecosystem.config.js
```

Adicione o seguinte conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'binance-proxy-socks5',
    script: 'proxy-server-socks5.js',
    cwd: '/opt/binance-proxy',
    env_file: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/binance-proxy-error.log',
    out_file: '/var/log/binance-proxy-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 6. Iniciar o Proxy

```bash
# Iniciar com PM2
cd /opt/binance-proxy
pm2 start ecosystem.config.js

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs binance-proxy-socks5
```

## 🔥 Configurar Firewall

```bash
# Permitir apenas portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 8888/tcp  # SOCKS5 (necessário para Edge Functions)
ufw enable

# Verificar status
ufw status
```

**Nota**: A porta 8888 (SOCKS5) precisa estar acessível externamente para a Edge Function do Supabase.

## 🧪 Testar a Conexão

### Teste Local no VPS (SOCKS5)

```bash
# Testar se o SOCKS5 está respondendo e autenticando
curl --socks5 lovable-proxy:manu123@127.0.0.1:8888 https://fapi.binance.com/fapi/v1/ping
```

### Teste da Edge Function

A Edge Function agora conecta diretamente ao SOCKS5, então não é necessário proxy HTTP intermediário. Teste chamando a função:

```javascript
const { data, error } = await supabase.functions.invoke('binance-trading', {
  body: { action: 'get_prices' }
});
```

## 📊 Monitoramento

### Ver Logs em Tempo Real

```bash
pm2 logs binance-proxy-socks5
```

### Verificar Status

```bash
pm2 status
```

### Reiniciar Proxy

```bash
pm2 restart binance-proxy-socks5
```

### Ver Logs de Erro

```bash
pm2 logs binance-proxy-socks5 --err
```

## 🔐 Adicionar IP à Whitelist da Binance

1. Acesse [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Selecione sua API Key
3. Clique em "Edit restrictions"
4. Em "IP Access Restriction", selecione "Restrict access to trusted IPs only"
5. Adicione o IP: **104.248.136.155**
6. Salve as alterações

## 🔄 Arquitetura Atual

```
Edge Function (Supabase Cloud)
    ↓ (Cliente SOCKS5 nativo em Deno)
SOCKS5 Server (104.248.136.155:8888)
    ↓ (túnel autenticado)
    ↓ (TLS handshake)
Binance Futures API (fapi.binance.com:443)
```

**Vantagens da Abordagem Atual:**
- ✅ Conexão direta sem proxy HTTP intermediário
- ✅ Menor latência
- ✅ Protocolo nativo SOCKS5
- ✅ TLS end-to-end

## ⚠️ Troubleshooting

### Proxy não conecta ao SOCKS5

```bash
# Verificar se o SOCKS5 está rodando
netstat -tulpn | grep 8888

# Testar conexão SOCKS5 manualmente
curl --socks5 lovable-proxy:manu125523@127.0.0.1:8888 https://fapi.binance.com/fapi/v1/ping
```

### Erro de autenticação SOCKS5

Verifique se as credenciais estão corretas no arquivo `.env`:
```bash
cat /opt/binance-proxy/.env
```

### Logs não aparecem

```bash
# Verificar permissões dos arquivos de log
ls -la /var/log/binance-proxy-*

# Se necessário, ajustar permissões
chmod 644 /var/log/binance-proxy-*.log
```

### Proxy não responde

```bash
# Reiniciar o proxy
pm2 restart binance-proxy-socks5

# Se não funcionar, parar e iniciar novamente
pm2 stop binance-proxy-socks5
pm2 delete binance-proxy-socks5
pm2 start ecosystem.config.js
```

## 📈 Otimizações Futuras

### 1. Adicionar Rate Limiting

Proteger contra excesso de requisições:

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100 // 100 requisições por minuto
});
```

### 2. Adicionar HTTPS

Usar Let's Encrypt para SSL:

```bash
apt install certbot
certbot certonly --standalone -d seu-dominio.com
```

### 3. Monitoramento Avançado

Instalar ferramentas de monitoramento:

```bash
npm install --save express prom-client
```

## 💰 Custos

- VPS DigitalOcean: ~$6-12/mês
- Largura de banda: Incluída
- Total: ~$6-12/mês

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `pm2 logs binance-proxy-socks5`
2. Verificar status: `pm2 status`
3. Testar conectividade: `curl http://localhost:3000`
4. Verificar firewall: `ufw status`
