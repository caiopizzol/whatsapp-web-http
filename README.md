# WhatsApp Web API

[![Docker Pulls](https://img.shields.io/docker/pulls/cpolive/whatsapp-web-api)](https://hub.docker.com/r/cpolive/whatsapp-web-api)
[![Docker Image Size](https://img.shields.io/docker/image-size/cpolive/whatsapp-web-api/latest)](https://hub.docker.com/r/cpolive/whatsapp-web-api)

HTTP service for WhatsApp messages. Built on [whatsapp-web.js](https://wwebjs.dev/).

## Features

- Send text and media messages via REST API
- Phone verification endpoints (OTP via WhatsApp)
- Audio support (MP3, OGG, voice notes)
- Images, videos, and documents
- QR code authentication with 60s timeout
- Multiple isolated sessions
- Session replacement without losing authentication
- Bearer token authentication
- Persistence via Docker volumes

## Use with WhatsApp Login

This API is the default backend for [@whatsapp-login/react](https://github.com/caiopizzol/whatsapp-login) - a drop-in React component for WhatsApp phone verification.

```jsx
import { WhatsAppLogin } from '@whatsapp-login/react'

<WhatsAppLogin
  apiUrl="http://localhost:3000"
  sessionId="login"
  authToken="your-token"
  onSuccess={({ phone }) => console.log('Verified:', phone)}
/>
```

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

| Endpoint | Description |
| -------- | ----------- |
| `POST /sessions` | Create session |
| `GET /sessions/{id}` | Session status |
| `GET /sessions/{id}/qr` | QR code (60s timeout) |
| `POST /sessions/{id}/messages` | Send message (text or media) |
| `POST /sessions/{id}/verify/send` | Send verification code **NEW** |
| `POST /sessions/{id}/verify/check` | Verify code **NEW** |
| `DELETE /sessions/{id}` | Delete session |
| `GET /health` | Service status |

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
