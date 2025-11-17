// Example client for WhatsApp Web API

const API_URL = 'http://localhost:3000';
const API_TOKEN = 'your-secret-token-here';

class WhatsAppClient {
  constructor(apiUrl, apiToken) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  async request(method, path, body = null) {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.apiUrl}${path}`, options);

    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Session methods
  async createSession() {
    return this.request('POST', '/sessions', {});
  }

  async getSession(sessionId) {
    return this.request('GET', `/sessions/${sessionId}`);
  }

  async getQR(sessionId) {
    return this.request('GET', `/sessions/${sessionId}/qr`);
  }

  async replaceSession(sessionId, preserveState = false) {
    return this.request('PUT', `/sessions/${sessionId}`, { preserveState });
  }

  async deleteSession(sessionId) {
    return this.request('DELETE', `/sessions/${sessionId}`);
  }

  // Send message (text or media) - unified method
  async sendMessage(sessionId, toOrParams, text) {
    // Handle both old API (3 params) and new API (2 params with object)
    if (typeof toOrParams === 'string') {
      // Old API: sendMessage(sessionId, to, text)
      return this.request('POST', `/sessions/${sessionId}/messages`, { to: toOrParams, text });
    } else {
      // New unified API: sendMessage(sessionId, { to, text, media, options })
      return this.request('POST', `/sessions/${sessionId}/messages`, toOrParams);
    }
  }

  // Health
  async health() {
    return this.request('GET', '/health');
  }
}

// Usage example
async function main() {
  const client = new WhatsAppClient(API_URL, API_TOKEN);

  try {
    // 1. Create session with auto-generated ID
    console.log('Creating session...');
    const sessionResult = await client.createSession();
    const sessionId = sessionResult.sessionId;
    console.log(`Using session: ${sessionId}`);

    // 2. Get QR code
    console.log('Getting QR code...');
    const qr = await client.getQR(sessionId);

    if (qr.status === 'qr') {
      console.log('Scan this QR code:');
      console.log(qr.qr);
      console.log(`Expires in ${qr.expires_in} seconds`);

      // Display QR in terminal (install qrcode-terminal: npm install qrcode-terminal)
      try {
        const qrcode = await import('qrcode-terminal');
        qrcode.default.generate(qr.qr, { small: true });
      } catch (error) {
        console.log('QR Code available - use a QR scanner to display it');
      }
    }

    // 3. Wait for authentication
    console.log('Waiting for authentication...');
    let authenticated = false;

    while (!authenticated) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const status = await client.getSession(sessionId);
      if (status.status === 'ready') {
        authenticated = true;
        console.log('Authenticated!', status.info);
      }
    }

    // 4. Send message
    console.log('Sending message...');
    const result = await client.sendMessage(
      sessionId,
      '5511999887766',
      'Hello from WhatsApp HTTP!'
    );
    console.log('Message sent:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export for ES modules
export { WhatsAppClient };

// Run if called directly (for Node.js)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
