// SessionManager.js - Enhanced Session Management with QR timeout handling

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { EventEmitter } from 'events';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Get MessageMedia from the same package
const MessageMedia = pkg.MessageMedia || pkg.default?.MessageMedia;

export class SessionManager extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.qrStates = new Map(); // Track QR generation state
    this.verificationCodes = new Map(); // Track verification codes for login
    this.AUTH_DIR = process.env.AUTH_DIR || './.wwebjs_auth';
  }

  // Check if session exists on disk
  sessionExistsOnDisk(sessionId) {
    const sessionPath = join(this.AUTH_DIR, `session-${sessionId}`);
    return existsSync(sessionPath);
  }

  // Load session from disk if it exists
  async loadSessionFromDisk(sessionId) {
    if (!this.sessionExistsOnDisk(sessionId)) {
      return null;
    }

    console.log(`Loading session ${sessionId} from disk`);

    // Create session object
    const session = {
      id: sessionId,
      client: null,
      status: 'initializing',
      info: null,
      qr: null,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // Initialize client with existing session
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: this.AUTH_DIR,
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      qrMaxRetries: 1, // Important: Only 1 attempt after 60s
    });

    session.client = client;

    // Set up event handlers
    this.setupClientEvents(sessionId, client);

    // Initialize client
    try {
      await client.initialize();
      // Wait a bit for the client to restore session
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return session;
    } catch (error) {
      console.error(`Failed to load session ${sessionId} from disk:`, error);
      this.sessions.delete(sessionId);
      return null;
    }
  }

  // Check if QR is currently active (within 60s window)
  isQRActive(sessionId) {
    const qrState = this.qrStates.get(sessionId);
    if (!qrState || !qrState.active) {
      return false;
    }

    const elapsed = Date.now() - qrState.timestamp;
    return elapsed < 60000; // 60 seconds
  }

  // Get remaining time for active QR
  getQRTimeRemaining(sessionId) {
    const qrState = this.qrStates.get(sessionId);
    if (!qrState || !qrState.active) {
      return 0;
    }

    const elapsed = Date.now() - qrState.timestamp;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
    return remaining;
  }

  // Create new session
  async createSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      throw new Error('Session already exists');
    }

    const session = {
      id: sessionId,
      client: null,
      status: 'initializing',
      info: null,
      qr: null,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // Initialize client
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: this.AUTH_DIR,
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      qrMaxRetries: 1, // Important: Only 1 attempt after 60s
    });

    session.client = client;

    // Set up event handlers
    this.setupClientEvents(sessionId, client);

    // Initialize but don't wait
    client.initialize().catch((err) => {
      console.error(`Failed to initialize session ${sessionId}:`, err);
      session.status = 'error';
      session.error = err.message;
    });

    return {
      sessionId,
      status: session.status,
      message: 'Session created, initializing...',
    };
  }

  // Generate QR code with timeout handling
  async generateQR(sessionId) {
    let session = this.sessions.get(sessionId);

    // If not in memory, try to load from disk
    if (!session && this.sessionExistsOnDisk(sessionId)) {
      session = await this.loadSessionFromDisk(sessionId);
    }

    if (!session) {
      throw new Error('Session not found');
    }

    // Restart if disconnected (QR expired)
    if (session.status === 'disconnected') {
      console.log(`Restarting disconnected session ${sessionId}`);

      // Clean up old session
      if (session.client) {
        await session.client.destroy().catch(() => {});
      }
      this.sessions.delete(sessionId);
      this.qrStates.delete(sessionId);

      // Create fresh session
      await this.createSession(sessionId);
      session = this.sessions.get(sessionId);
    }

    // If already authenticated, return success
    if (session.status === 'ready') {
      return {
        status: 'ready',
        message: 'Session already authenticated',
        info: session.info,
      };
    }

    // If QR is already active, throw error
    if (this.isQRActive(sessionId)) {
      throw new Error('QR generation already in progress');
    }

    // Mark QR as active
    this.qrStates.set(sessionId, {
      active: true,
      timestamp: Date.now(),
      qr: null,
    });

    // Set up QR timeout
    setTimeout(() => {
      const qrState = this.qrStates.get(sessionId);
      if (qrState && qrState.active) {
        qrState.active = false;
        this.emit('qr:expired', { sessionId });
      }
    }, 60000);

    // If QR already available, return it
    if (session.qr) {
      const qrState = this.qrStates.get(sessionId);
      qrState.qr = session.qr;

      return {
        status: 'qr',
        qr: session.qr,
        expires_in: 60,
        expires_at: new Date(Date.now() + 60000).toISOString(),
        instructions: [
          '1. Open WhatsApp on your phone',
          '2. Go to Settings → Linked Devices',
          '3. Tap "Link a Device"',
          '4. Scan this QR code within 60 seconds',
        ],
      };
    }

    // Wait for QR with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('QR generation timeout'));
      }, 10000);

      const qrHandler = (qr) => {
        clearTimeout(timeout);

        const qrState = this.qrStates.get(sessionId);
        if (qrState) {
          qrState.qr = qr;
        }

        resolve({
          status: 'qr',
          qr,
          expires_in: 60,
          expires_at: new Date(Date.now() + 60000).toISOString(),
          instructions: [
            '1. Open WhatsApp on your phone',
            '2. Go to Settings → Linked Devices',
            '3. Tap "Link a Device"',
            '4. Scan this QR code within 60 seconds',
          ],
        });
      };

      session.client.once('qr', qrHandler);
    });
  }

  // Replace existing session
  async replaceSession(sessionId, options = {}) {
    const { preserveState = false } = options;

    // Get existing session
    const existingSession = this.sessions.get(sessionId);
    let savedState = null;

    if (existingSession && preserveState && existingSession.status === 'ready') {
      // Note: WhatsApp Web.js doesn't support state export/import
      // This is a placeholder for future implementation
      savedState = {
        info: existingSession.info,
        createdAt: existingSession.createdAt,
      };
    }

    // Destroy existing session
    if (existingSession) {
      await this.destroySession(sessionId);
    }

    // Wait a bit for cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create new session
    const result = await this.createSession(sessionId);

    if (savedState) {
      const newSession = this.sessions.get(sessionId);
      newSession.replacedAt = new Date();
      newSession.previousState = savedState;
    }

    return {
      ...result,
      replaced: true,
      preservedState: preserveState,
    };
  }

  // Get session status
  async getSessionStatus(sessionId) {
    let session = this.sessions.get(sessionId);

    // If not in memory, try to load from disk
    if (!session && this.sessionExistsOnDisk(sessionId)) {
      session = await this.loadSessionFromDisk(sessionId);
    }

    if (!session) {
      throw new Error('Session not found');
    }

    return {
      sessionId,
      status: session.status,
      info: session.info,
      qrActive: this.isQRActive(sessionId),
      qrTimeRemaining: this.getQRTimeRemaining(sessionId),
      createdAt: session.createdAt,
      replacedAt: session.replacedAt,
    };
  }

  // Send message (text or media)
  async sendMessage(sessionId, params) {
    let session = this.sessions.get(sessionId);

    // If not in memory, try to load from disk
    if (!session && this.sessionExistsOnDisk(sessionId)) {
      session = await this.loadSessionFromDisk(sessionId);
    }

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'ready') {
      throw new Error('Session not ready');
    }

    const { to, text, media, options = {} } = params;

    // Validate that we have content to send
    if (!text && !media) {
      throw new Error('Must provide either text or media');
    }

    // Format phone number
    const formattedNumber = this.formatPhoneNumber(to);
    const chatId = formattedNumber + '@c.us';

    let content;

    // Handle media if provided
    if (media) {
      try {
        const { url, base64, mimetype, filename } = media;

        if (url) {
          // From URL
          content = await MessageMedia.fromUrl(url);
        } else if (base64 && mimetype) {
          // From base64 data
          content = new MessageMedia(mimetype, base64, filename);
        } else {
          throw new Error('Media must include either url or base64+mimetype');
        }
      } catch (error) {
        throw new Error(`Failed to process media: ${error.message}`);
      }
    } else {
      // Plain text message
      content = text;
    }

    // Send the message
    const message = await session.client.sendMessage(chatId, content, options);

    return {
      success: true,
      messageId: message.id._serialized,
      to: formattedNumber,
      type: media ? 'media' : 'text',
      timestamp: new Date().toISOString(),
    };
  }

  // Destroy session
  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      if (session.client) {
        await session.client.destroy();
      }
    } catch (error) {
      console.error(`Error destroying session ${sessionId}:`, error);
    }

    this.sessions.delete(sessionId);
    this.qrStates.delete(sessionId);
  }

  // Get all sessions (both in memory and on disk)
  async getAllSessions() {
    const inMemory = Array.from(this.sessions.keys());

    let onDisk = [];
    try {
      onDisk = readdirSync(this.AUTH_DIR)
        .filter((dir) => dir.startsWith('session-'))
        .map((dir) => dir.replace('session-', ''));
    } catch (error) {
      // AUTH_DIR might not exist yet
      console.warn('Could not read auth directory:', error.message);
    }

    // Combine and deduplicate
    const allSessions = [...new Set([...inMemory, ...onDisk])];
    return allSessions;
  }

  // Get health status
  async getHealthStatus() {
    const sessions = Array.from(this.sessions.values());
    const allSessions = await this.getAllSessions();

    return {
      status: 'ok',
      uptime: process.uptime(),
      sessions: {
        total: allSessions.length,
        ready: sessions.filter((s) => s.status === 'ready').length,
        initializing: sessions.filter((s) => s.status === 'initializing').length,
        qr_pending: sessions.filter((s) => s.status === 'qr').length,
        error: sessions.filter((s) => s.status === 'error').length,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
    };
  }

  // Shutdown all sessions
  async shutdown() {
    const promises = Array.from(this.sessions.keys()).map((sessionId) =>
      this.destroySession(sessionId).catch((err) =>
        console.error(`Error destroying session ${sessionId} during shutdown:`, err)
      )
    );

    await Promise.all(promises);
  }

  // Set up client event handlers
  setupClientEvents(sessionId, client) {
    const session = this.sessions.get(sessionId);

    // QR Code
    client.on('qr', (qr) => {
      console.log(`QR received for session ${sessionId}`);
      session.status = 'qr';
      session.qr = qr;
      this.emit('session:qr', { sessionId, qr });
    });

    // Authenticated
    client.on('authenticated', () => {
      console.log(`Session ${sessionId} authenticated`);
      session.status = 'authenticated';
      session.qr = null;

      // Clear QR state
      const qrState = this.qrStates.get(sessionId);
      if (qrState) {
        qrState.active = false;
      }

      this.emit('session:authenticated', { sessionId });
    });

    // Ready
    client.on('ready', () => {
      console.log(`Session ${sessionId} ready`);
      session.status = 'ready';
      session.info = client.info;
      this.emit('session:ready', { sessionId, info: client.info });
    });

    // Auth failure
    client.on('auth_failure', (msg) => {
      console.error(`Auth failure for session ${sessionId}:`, msg);
      session.status = 'auth_failure';
      session.error = msg;
      this.emit('session:auth_failure', { sessionId, message: msg });
    });

    // Disconnected
    client.on('disconnected', (reason) => {
      console.log(`Session ${sessionId} disconnected:`, reason);
      session.status = 'disconnected';
      session.disconnectReason = reason;

      // Clear QR state
      this.qrStates.delete(sessionId);

      // Handle different disconnect reasons
      if (reason === 'LOGOUT') {
        // User logged out - session invalid
        session.status = 'logged_out';
      }

      this.emit('session:disconnected', { sessionId, reason });
    });

    // Messages
    client.on('message', async (msg) => {
      this.emit('message:received', {
        sessionId,
        message: {
          id: msg.id._serialized,
          from: msg.from,
          to: msg.to,
          body: msg.body,
          timestamp: msg.timestamp,
        },
      });
    });
  }

  // Format phone number for WhatsApp
  formatPhoneNumber(phone) {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Handle Brazilian numbers (remove 9th digit)
    if (cleaned.startsWith('55') && cleaned.length === 13) {
      const areaCode = cleaned.substring(2, 4);
      const ninthDigit = cleaned.substring(4, 5);
      const number = cleaned.substring(5);

      if (ninthDigit === '9') {
        cleaned = '55' + areaCode + number;
      }
    }

    return cleaned;
  }

  // ===== GROUP METHODS =====

  // Get all groups for a session
  async getGroups(sessionId) {
    let session = this.sessions.get(sessionId);

    // If not in memory, try to load from disk
    if (!session && this.sessionExistsOnDisk(sessionId)) {
      session = await this.loadSessionFromDisk(sessionId);
    }

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'ready') {
      throw new Error('Session not ready');
    }

    // Get all chats and filter for groups
    const chats = await session.client.getChats();
    const groups = chats
      .filter((chat) => chat.isGroup)
      .map((chat) => ({
        id: chat.id._serialized,
        name: chat.name,
        participantsCount: chat.participants?.length || 0,
        isReadOnly: chat.isReadOnly || false,
      }));

    return groups;
  }

  // ===== VERIFICATION METHODS =====

  // Generate a random numeric code
  generateCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  // Send verification code to phone number
  async sendVerificationCode(sessionId, params) {
    const { phone, codeLength = 6, expiresIn = 300 } = params;

    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Generate code
    const code = this.generateCode(codeLength);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store verification code
    const verificationKey = `${sessionId}:${this.formatPhoneNumber(phone)}`;
    this.verificationCodes.set(verificationKey, {
      code,
      phone: this.formatPhoneNumber(phone),
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
    });

    // Set expiration timer
    setTimeout(() => {
      this.verificationCodes.delete(verificationKey);
    }, expiresIn * 1000);

    // Send the code via WhatsApp
    const message = `Your verification code is: ${code}\n\nThis code expires in ${Math.floor(expiresIn / 60)} minutes.`;

    try {
      await this.sendMessage(sessionId, {
        to: phone,
        text: message,
      });

      return {
        success: true,
        phone: this.formatPhoneNumber(phone),
        expiresAt: expiresAt.toISOString(),
        expiresIn,
      };
    } catch (error) {
      // Clean up on failure
      this.verificationCodes.delete(verificationKey);
      throw error;
    }
  }

  // Verify code entered by user
  verifyCode(sessionId, params) {
    const { phone, code } = params;

    if (!phone || !code) {
      throw new Error('Phone number and code are required');
    }

    const verificationKey = `${sessionId}:${this.formatPhoneNumber(phone)}`;
    const verification = this.verificationCodes.get(verificationKey);

    if (!verification) {
      throw new Error('No verification code found. Request a new code.');
    }

    // Check expiration
    if (new Date() > verification.expiresAt) {
      this.verificationCodes.delete(verificationKey);
      throw new Error('Verification code expired. Request a new code.');
    }

    // Check attempts
    if (verification.attempts >= verification.maxAttempts) {
      this.verificationCodes.delete(verificationKey);
      throw new Error('Too many attempts. Request a new code.');
    }

    // Increment attempts
    verification.attempts++;

    // Verify code
    if (verification.code !== code) {
      const remaining = verification.maxAttempts - verification.attempts;
      throw new Error(`Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
    }

    // Success - clean up
    this.verificationCodes.delete(verificationKey);

    return {
      success: true,
      phone: verification.phone,
      verified: true,
    };
  }
}
