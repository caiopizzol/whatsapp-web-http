# Security Policy

## ⚠️ Important Disclaimer

This service uses whatsapp-web.js which:

- Is **NOT** officially supported by WhatsApp
- Automates WhatsApp Web using Puppeteer
- **Can result in your WhatsApp account being blocked**
- Should not be used for spam or unsolicited messages

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities via GitHub Issues at: https://github.com/caiopizzol/whatsapp-web-api/issues

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours and keep you updated on the fix.

## Best Practices

### 1. WhatsApp Account Safety

- Use a dedicated phone number
- Don't spam or send bulk unsolicited messages
- Respect WhatsApp's Terms of Service
- Monitor for unusual activity

### 2. Authentication

- Use strong AUTH_TOKEN values (minimum 32 characters)
- Rotate tokens regularly
- Never expose tokens in logs or version control
- Use different tokens for each instance

### 3. Network Security

- **Never expose this service directly to the internet**
- Always run behind a reverse proxy or API gateway
- Use HTTPS at proxy level
- Restrict network access to authorized systems only
- **Implement rate limiting at gateway level**

### 4. Example Nginx Config

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=whatsapp:10m rate=30r/m;

    location /whatsapp/ {
        limit_req zone=whatsapp burst=5;
        proxy_pass http://localhost:3000/;
        proxy_set_header Authorization "Bearer YOUR_TOKEN";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Container Security

- Run containers as non-root user
- Set memory and CPU limits
- Use minimal base images
- Regularly update dependencies

### 6. Monitoring

- Monitor failed authentication attempts
- Set up alerts for unusual traffic patterns
- Log all API requests (but not tokens)
- Monitor resource usage

## Known Risks

1. **Account Blocking** - WhatsApp may block accounts using unofficial clients
2. **No Guarantees** - This is community software with no warranty
3. **Resource Usage** - Chromium can consume significant resources
4. **Session Loss** - Sessions may disconnect unexpectedly

## Docker Security Example

```dockerfile
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S whatsapp -u 1001
WORKDIR /app
COPY --chown=whatsapp:nodejs package*.json ./
RUN npm ci --omit=dev
COPY --chown=whatsapp:nodejs src ./src
USER whatsapp
EXPOSE 3000
CMD ["npm", "start"]
```
