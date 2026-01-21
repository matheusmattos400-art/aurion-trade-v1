const http = require('http');
const https = require('https');
const tls = require('tls');
const { SocksClient } = require('socks');

const PORT = process.env.PORT || 3000;

// Configuração do proxy SOCKS5
const SOCKS_CONFIG = {
  proxy: {
    host: process.env.SOCKS_HOST || '104.248.136.155',
    port: parseInt(process.env.SOCKS_PORT || '8888'),
    type: 5,
    userId: process.env.SOCKS_USER || 'lovable-proxy',
    password: process.env.SOCKS_PASSWORD || 'manu125523'
  },
  command: 'connect',
  destination: {
    host: 'fapi.binance.com',
    port: 443
  }
};

console.log('🔧 Configuração SOCKS5:', {
  host: SOCKS_CONFIG.proxy.host,
  port: SOCKS_CONFIG.proxy.port,
  user: SOCKS_CONFIG.proxy.userId
});

// Função para fazer requisições via SOCKS5 com TLS handshake explícito
async function makeRequestViaSocks(options, postData = null) {
  let socksConnection = null;
  let tlsSocket = null;
  
  try {
    console.log('🔌 Conectando via SOCKS5 para:', options.path);
    
    // Passo 1: Conectar através do proxy SOCKS5 (túnel TCP)
    socksConnection = await SocksClient.createConnection(SOCKS_CONFIG);
    const socket = socksConnection.socket;
    
    console.log('✅ Conexão SOCKS5 estabelecida (TCP)');
    
    // Passo 2: Fazer TLS handshake sobre o socket SOCKS5
    tlsSocket = tls.connect({
      socket: socket,
      servername: options.hostname,
      rejectUnauthorized: false // Para debug; mude para true em produção
    });
    
    return new Promise((resolve, reject) => {
      let tlsReady = false;
      
      tlsSocket.on('secureConnect', () => {
        tlsReady = true;
        console.log('✅ TLS handshake concluído via SOCKS5 (HTTPS)');
        
        // Passo 3: Fazer requisição HTTPS usando o socket TLS
        const requestOptions = {
          hostname: options.hostname,
          port: options.port,
          path: options.path,
          method: options.method,
          headers: options.headers,
          createConnection: () => tlsSocket
        };
        
        console.log('📤 Fazendo requisição HTTPS via TLS socket');
        
        const req = https.request(requestOptions, (res) => {
          let data = '';
          
          console.log('📡 Resposta recebida - Status:', res.statusCode);
          
          res.on('data', (chunk) => {
            data += chunk;
            console.log('📦 Chunk recebido:', chunk.length, 'bytes');
          });
          
          res.on('end', () => {
            console.log('✅ Resposta completa recebida:', data.length, 'bytes');
            
            // Fechar conexões
            try {
              tlsSocket.end();
              socket.end();
            } catch (e) {
              console.error('⚠️ Erro ao fechar sockets:', e.message);
            }
            
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          });
          
          res.on('error', (error) => {
            console.error('❌ Erro ao ler resposta HTTPS:', error);
            reject(error);
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ Erro na requisição HTTPS:', error);
          tlsSocket.destroy();
          socket.destroy();
          reject(error);
        });
        
        req.on('timeout', () => {
          console.error('❌ Timeout na requisição HTTPS');
          req.destroy(new Error('HTTPS request timeout'));
        });
        
        req.setTimeout(30000);
        
        if (postData) {
          console.log('📝 Enviando dados POST');
          req.write(postData);
        }
        
        req.end();
        console.log('✅ Requisição HTTPS enviada via TLS socket');
      });
      
      tlsSocket.on('error', (error) => {
        console.error('❌ Erro no TLS handshake:', error);
        if (!tlsReady) {
          socket.destroy();
        }
        reject(error);
      });
      
      tlsSocket.on('timeout', () => {
        console.error('❌ Timeout no TLS handshake');
        tlsSocket.destroy();
        socket.destroy();
        reject(new Error('TLS handshake timeout'));
      });
      
      tlsSocket.setTimeout(30000);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar via SOCKS5:', error);
    if (tlsSocket) {
      tlsSocket.destroy();
    }
    if (socksConnection && socksConnection.socket) {
      socksConnection.socket.destroy();
    }
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
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

  const fullPath = `${targetEndpoint}?${targetQuery}`;
  
  console.log(`[${new Date().toISOString()}] ${targetMethod} ${fullPath}`);
  console.log('🔑 API Key:', apiKey.substring(0, 8) + '...');

  try {
    // Fazer requisição via SOCKS5
    const response = await makeRequestViaSocks({
      hostname: 'fapi.binance.com',
      port: 443,
      path: fullPath,
      method: targetMethod,
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Lovable-Proxy/1.0'
      }
    });

    console.log('📡 Resposta Binance:', {
      status: response.statusCode,
      dataLength: response.data.length
    });

    res.writeHead(response.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(response.data);
    
  } catch (error) {
    console.error('❌ Erro ao processar requisição:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Proxy request failed',
      message: error.message 
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Proxy SOCKS5 rodando na porta ${PORT}`);
  console.log(`📍 Roteando via SOCKS5: ${SOCKS_CONFIG.proxy.host}:${SOCKS_CONFIG.proxy.port}`);
  console.log(`🎯 Destino: fapi.binance.com (HTTPS com TLS handshake explícito)`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});
