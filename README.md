# WhatsApp Web API

[![Docker Pulls](https://img.shields.io/docker/pulls/cpolive/whatsapp-web-api)](https://hub.docker.com/r/cpolive/whatsapp-web-api)
[![Docker Image Size](https://img.shields.io/docker/image-size/cpolive/whatsapp-web-api/latest)](https://hub.docker.com/r/cpolive/whatsapp-web-api)

HTTP service for WhatsApp messages. Built on [whatsapp-web.js](https://wwebjs.dev/).

[Documentação em Português](#pt-br)

## Features

- 🚀 Send text and media messages via REST API
- 🎵 Audio support (MP3, OGG, voice notes)
- 📸 Images, videos, and documents
- 📱 QR code authentication with 60s timeout
- 🔄 Multiple isolated sessions
- ⚡ Session replacement without losing authentication
- 🔒 Bearer token authentication
- 💾 Persistence via Docker volumes

## Quick Start

### Using Docker Hub (Recommended)

```bash
# Pull the image
docker pull cpolive/whatsapp-web-api:latest

# Run the container
docker run -d \
  -p 3000:3000 \
  -e AUTH_TOKEN=your-secret-token-here \
  -v ./whatsapp-sessions:/app/.wwebjs_auth \
  --name whatsapp \
  cpolive/whatsapp-web-api:latest

# Or use Docker Compose
cat > docker-compose.yml << 'EOF'
services:
  whatsapp:
    image: cpolive/whatsapp-web-api:latest
    ports:
      - "3000:3000"
    environment:
      - AUTH_TOKEN=${AUTH_TOKEN}
    volumes:
      - ./whatsapp-sessions:/app/.wwebjs_auth
    restart: unless-stopped
EOF

docker-compose up -d
```

### Building from Source

```bash
# Clone and configure
git clone https://github.com/caiopizzol/whatsapp-web-api.git
cd whatsapp-web-api
export AUTH_TOKEN=your-secret-token-here

# Run with Docker
docker-compose up -d

# Check logs
docker-compose logs -f whatsapp
```

## API Usage

### 1. Create Session

```bash
# With specific ID
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "my-session"}'

# Or leave empty to auto-generate UUID
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Get QR Code

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/sessions/my-session/qr
```

Scan the QR code with WhatsApp on your phone.

### 3. Send Messages

The `/messages` endpoint handles both text and media:

```bash
# Text message
curl -X POST http://localhost:3000/sessions/my-session/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999887766",
    "text": "Hello from WhatsApp HTTP!"
  }'

# Audio message
curl -X POST http://localhost:3000/sessions/my-session/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999887766",
    "media": {
      "url": "https://example.com/audio.mp3"
    },
    "options": {
      "caption": "🎵 Listen to this!"
    }
  }'

# Voice note
curl -X POST http://localhost:3000/sessions/my-session/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999887766",
    "media": {
      "url": "https://example.com/voice.ogg"
    },
    "options": {
      "sendAudioAsVoice": true
    }
  }'
```

## Key Endpoints

- `POST /sessions` - Create session
- `GET /sessions/{id}` - Session status
- `GET /sessions/{id}/qr` - QR code (60s timeout)
- `POST /sessions/{id}/messages` - Send message
- `DELETE /sessions/{id}` - Delete session
- `GET /health` - Service status

## Resource Requirements

- **RAM**: ~512MB per session (Chromium)
- **CPU**: 1 vCPU
- **Storage**: 1GB

## ⚠️ Limitations

- **Resource intensive** (~512MB RAM for Chromium)
- **QR timeout**: 1 per 60 seconds per session
- **Unofficial**: WhatsApp doesn't support bots on personal accounts
- **Rate limiting**: Implement in your gateway

## License

MIT License - see [LICENSE](./LICENSE).

Construído com ❤️ sobre [whatsapp-web.js](https://wwebjs.dev/)

---

<a name="pt-br"></a>

# WhatsApp HTTP - Serviço HTTP WhatsApp

HTTP service para mensagens WhatsApp. Construído sobre [whatsapp-web.js](https://wwebjs.dev/).

## Recursos

- 🚀 Envie mensagens de texto e mídia via REST API unificada
- 🎵 Suporte a áudio (MP3, OGG, notas de voz)
- 📸 Imagens, vídeos e documentos
- 📱 Autenticação por QR code com timeout de 60s
- 🔄 Múltiplas sessões isoladas
- ⚡ Substituição de sessão sem perder autenticação
- 🔒 Autenticação Bearer token
- 💾 Persistência via volumes Docker

## Início Rápido

```bash
# Clone e configure
git clone https://github.com/caiopizzol/whatsapp-web-api.git
cd whatsapp-web-api
export AUTH_TOKEN=seu-token-secreto-aqui

# Execute com Docker
docker-compose up -d

# Verificar logs
docker-compose logs -f whatsapp
```

## Uso da API

### 1. Criar Sessão

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Obter QR Code

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/sessions/minha-sessao/qr
```

Escaneie o QR code com WhatsApp no celular.

### 3. Enviar Mensagens

O endpoint `/messages` lida com texto e mídia:

```bash
# Mensagem de texto
curl -X POST http://localhost:3000/sessions/minha-sessao/messages \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999887766",
    "text": "Olá do WhatsApp HTTP!"
  }'

# Mensagem de áudio
curl -X POST http://localhost:3000/sessions/minha-sessao/messages \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999887766",
    "media": {
      "url": "https://example.com/audio.mp3"
    },
    "options": {
      "caption": "🎵 Escute isso!"
    }
  }'

# Nota de voz
curl -X POST http://localhost:3000/sessions/minha-sessao/messages \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999887766",
    "media": {
      "url": "https://example.com/voice.ogg"
    },
    "options": {
      "sendAudioAsVoice": true
    }
  }'
```

## Principais Endpoints

- `POST /sessions` - Criar sessão
- `GET /sessions/{id}` - Status da sessão
- `GET /sessions/{id}/qr` - QR code (timeout 60s)
- `POST /sessions/{id}/messages` - Enviar mensagem (texto ou mídia)
- `DELETE /sessions/{id}` - Deletar sessão
- `GET /health` - Status do serviço

## Configuração

```bash
# Obrigatório
AUTH_TOKEN=seu-token-secreto-aqui

# Opcional (com padrões no Docker)
PORT=3000
NODE_ENV=production
```

## Deploy Docker

### Usando Docker Hub

```yaml
# docker-compose.yml
services:
  whatsapp:
    image: cpolive/whatsapp-web-api:1.4.0 # Or use :latest for latest version
    ports:
      - '3000:3000'
    environment:
      - AUTH_TOKEN=${AUTH_TOKEN:-your-secret-token-here}
      - PORT=${PORT:-3000}
      - NODE_ENV=${NODE_ENV:-production}
    volumes:
      - ./whatsapp-sessions:/app/.wwebjs_auth
    restart: unless-stopped
    mem_limit: 1g
    cpus: '1.0'

volumes:
  whatsapp-sessions:
    driver: local
```

### Construindo a partir do código fonte

```yaml
# docker-compose.yml
services:
  whatsapp:
    build: .
    ports:
      - '3000:3000'
    environment:
      - AUTH_TOKEN=${AUTH_TOKEN:-your-secret-token-here}
      - PORT=${PORT:-3000}
      - NODE_ENV=${NODE_ENV:-production}
    volumes:
      - ./whatsapp-sessions:/app/.wwebjs_auth
    restart: unless-stopped
    mem_limit: 1g
    cpus: '1.0'

volumes:
  whatsapp-sessions:
    driver: local
```

**Nota**: As sessões são persistidas no diretório `./whatsapp-sessions` do host.

## Recursos Necessários

- **RAM**: ~512MB por sessão (Chromium)
- **CPU**: 1 vCPU
- **Armazenamento**: 1GB

## ⚠️ Limitações

- **Intensivo em recursos** (~512MB RAM para Chromium)
- **QR timeout**: 1 por 60 segundos por sessão
- **Não oficial**: WhatsApp não suporta bots em contas pessoais
- **Rate limiting**: Implemente no seu gateway

## Desenvolvimento

```bash
npm install
npm run dev          # Hot reload
npm test            # Testes integração
npm run lint        # Verificar código
```

## Segurança

- Nunca exponha diretamente à internet
- Use proxy reverso ou API gateway
- AUTH_TOKEN forte (mín 32 chars)
- Execute em rede isolada

## Licença

MIT License - veja [LICENSE](./LICENSE).
