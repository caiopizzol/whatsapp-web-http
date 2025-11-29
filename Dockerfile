FROM node:20-alpine

RUN apk add --no-cache chromium

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY src ./src
COPY lib ./lib
COPY middleware ./middleware

# Create session directory for volume mount
RUN mkdir -p /app/.wwebjs_auth && chmod 777 /app/.wwebjs_auth

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

CMD ["node", "src/server.js"] 