# Configuração de Proxy com IP Fixo para Binance Futures

Este guia explica como configurar um servidor proxy intermediário com IP fixo para permitir o uso da Binance Futures API com whitelist de IP.

## Por que usar um Proxy?

A Binance Futures exige whitelist de IPs específicos para aumentar a segurança. Como o Lovable Cloud usa infraestrutura serverless com IPs dinâmicos, precisamos de um servidor intermediário (VPS) com IP fixo.

## Arquitetura

```
Lovable Cloud → VPS Proxy (IP Fixo) → Binance Futures API
```

## Passo 1: Configurar o VPS

### Requisitos Mínimos
- 1 vCPU
- 512MB RAM
- Sistema operacional: Ubuntu 22.04 ou superior

### Provedores Recomendados
- DigitalOcean (Droplet básico - $6/mês)
- AWS EC2 (t2.micro - $8/mês)
- Linode (Nanode - $5/mês)
- Vultr (Cloud Compute - $5/mês)

## Passo 2: Instalar Node.js no VPS

```bash
# Conectar ao VPS via SSH
ssh root@seu-ip-fixo

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

## Passo 3: Criar o Servidor Proxy

Crie um arquivo `proxy-server.js` no VPS:

```javascript
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Target-Endpoint, X-Target-Method, X-Target-Query, X-API-Key');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Extrair headers customizados
  const targetEndpoint = req.headers['x-target-endpoint'];
  const targetMethod = req.headers['x-target-method'] || 'GET';
  const targetQuery = req.headers['x-target-query'] || '';
  const apiKey = req.headers['x-api-key'];

  if (!targetEndpoint || !apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing required headers' }));
    return;
  }

  // Construir URL da Binance
  const binanceUrl = `https://fapi.binance.com${targetEndpoint}?${targetQuery}`;

  console.log(`[${new Date().toISOString()}] ${targetMethod} ${binanceUrl}`);

  // Fazer requisição para Binance
  const binanceReq = https.request(binanceUrl, {
    method: targetMethod,
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/json',
    },
  }, (binanceRes) => {
    let data = '';

    binanceRes.on('data', (chunk) => {
      data += chunk;
    });

    binanceRes.on('end', () => {
      res.writeHead(binanceRes.statusCode, {
        'Content-Type': 'application/json',
      });
      res.end(data);
    });
  });

  binanceReq.on('error', (error) => {
    console.error('Binance request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy request failed' }));
  });

  binanceReq.end();
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Ready to forward requests to Binance Futures API`);
});
```

## Passo 4: Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o proxy com PM2
pm2 start proxy-server.js --name binance-proxy

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs binance-proxy
```

## Passo 5: Configurar Firewall

```bash
# Permitir apenas portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # Proxy
ufw enable

# Verificar status
ufw status
```

## Passo 6: Obter o IP Fixo do VPS

```bash
# Obter IP público
curl ifconfig.me

# Este é o IP que você deve adicionar ao whitelist da Binance
```

## Passo 7: Configurar Whitelist na Binance

1. Acesse [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Selecione sua API Key
3. Clique em "Edit restrictions"
4. Em "IP Access Restriction", selecione "Restrict access to trusted IPs only"
5. Adicione o IP do seu VPS (ex: `123.45.67.89`)
6. Salve as alterações

## Passo 8: Configurar PROXY_URL no Lovable

1. A URL do proxy já foi adicionada aos secrets do Lovable
2. O formato deve ser: `http://seu-ip-fixo:3000`
3. Exemplo: `http://123.45.67.89:3000`

## Passo 9: Testar a Conexão

Após configurar tudo, teste usando o Aurion:
1. Acesse a aplicação
2. Tente iniciar uma operação de teste
3. Verifique os logs no VPS: `pm2 logs binance-proxy`

## Monitoramento e Logs

### Ver logs em tempo real
```bash
pm2 logs binance-proxy
```

### Verificar status
```bash
pm2 status
```

### Reiniciar proxy
```bash
pm2 restart binance-proxy
```

### Ver logs de erros
```bash
pm2 logs binance-proxy --err
```

## Segurança Adicional (Opcional)

### Adicionar HTTPS com Let's Encrypt

```bash
# Instalar Certbot
apt install certbot

# Você precisará de um domínio apontando para o IP do VPS
# Exemplo: proxy.seudominio.com

# Obter certificado SSL
certbot certonly --standalone -d proxy.seudominio.com

# Modificar proxy-server.js para usar HTTPS (código não incluído aqui)
```

### Limitar Rate Limiting

Adicione rate limiting ao proxy para evitar abuso:

```javascript
// Adicionar no início do proxy-server.js
const requestCounts = new Map();
const RATE_LIMIT = 100; // requisições por minuto
const RATE_WINDOW = 60000; // 1 minuto

function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_WINDOW };
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_WINDOW;
  } else {
    record.count++;
  }
  
  requestCounts.set(ip, record);
  return record.count <= RATE_LIMIT;
}
```

## Custos Estimados

- VPS: $5-8/mês
- Largura de banda: Incluída na maioria dos planos
- Total: ~$5-8/mês

## Troubleshooting

### Proxy não responde
```bash
pm2 restart binance-proxy
pm2 logs binance-proxy
```

### Erro de conexão com Binance
- Verifique se o IP está no whitelist da Binance
- Verifique se o firewall permite conexões de saída HTTPS (porta 443)

### Erro de autenticação
- Verifique se as credenciais da API estão corretas no Lovable
- Verifique se a API Key tem permissões de Futures habilitadas

## Próximos Passos

Após configurar o proxy:
1. A Edge Function do Lovable automaticamente usará o proxy
2. Todas as requisições para Binance passarão pelo seu VPS com IP fixo
3. A Binance aceitará as requisições pois vêm de um IP whitelistado

## Suporte

Se tiver problemas:
1. Verifique os logs do proxy: `pm2 logs binance-proxy`
2. Verifique os logs da Edge Function no Lovable Cloud
3. Confirme que o IP do VPS está no whitelist da Binance
