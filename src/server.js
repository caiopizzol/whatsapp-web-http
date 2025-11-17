// server.js - Enhanced WhatsApp Web API with proper QR handling
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { SessionManager } from './SessionManager.js';
import { Router } from '../lib/Router.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { errorHandler } from '../middleware/error.js';

const sessionManager = new SessionManager();
const router = new Router();

// Apply middleware
router.use(authMiddleware);
router.use(validateRequest);

// ===== SESSION ROUTES =====

// Create new session
router.post('/sessions', async (req, res) => {
  let { sessionId } = req.body;
  if (!sessionId) {
    sessionId = randomUUID();
  }

  try {
    const result = await sessionManager.createSession(sessionId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get session status
router.get('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const status = await sessionManager.getSessionStatus(sessionId);
    res.json(status);
  } catch (error) {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Get QR code (with 60s timeout handling)
router.get('/sessions/:sessionId/qr', async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Check if QR is already active (60s window)
    if (sessionManager.isQRActive(sessionId)) {
      return res.status(409).json({
        error: 'QR_ALREADY_ACTIVE',
        message: 'QR code already generated for this session',
        retry_after: sessionManager.getQRTimeRemaining(sessionId),
        help: 'Wait for current QR to expire or scan it',
      });
    }

    const result = await sessionManager.generateQR(sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Replace session (new feature)
router.put('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { preserveState = false } = req.body;

  try {
    const result = await sessionManager.replaceSession(sessionId, { preserveState });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Destroy session
router.delete('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    await sessionManager.destroySession(sessionId);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Session not found' });
  }
});

// ===== MESSAGE ROUTES =====

// Send message (text or media)
router.post('/sessions/:sessionId/messages', async (req, res) => {
  const { sessionId } = req.params;
  const { to, text, media, options } = req.body;

  // Validate recipient
  if (!to) {
    return res.status(400).json({
      error: 'Invalid request',
      help: 'Provide "to" (recipient phone number)',
    });
  }

  // Validate content
  if (!text && !media) {
    return res.status(400).json({
      error: 'Invalid request',
      help: 'Provide either "text" or "media"',
    });
  }

  // Validate media structure if provided
  if (media) {
    const { url, base64, mimetype } = media;

    if (!url && !base64) {
      return res.status(400).json({
        error: 'Invalid media',
        help: 'Media must include either "url" or "base64" with "mimetype"',
      });
    }

    if (base64 && !mimetype) {
      return res.status(400).json({
        error: 'Invalid media',
        help: 'When using base64, "mimetype" is required',
      });
    }
  }

  try {
    const result = await sessionManager.sendMessage(sessionId, {
      to,
      text,
      media,
      options,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('not ready')) {
      res.status(503).json({
        error: 'Session not ready',
        help: 'Check session status or authenticate with QR',
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'Session not found',
      });
    } else {
      res.status(500).json({
        error: error.message,
      });
    }
  }
});

// ===== HEALTH & MONITORING =====

router.get('/health', async (req, res) => {
  const health = await sessionManager.getHealthStatus();
  res.json(health);
});

// ===== SERVER SETUP =====

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route request
  try {
    await router.handle(req, res);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sessionManager.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WhatsApp Web API running on :${PORT}`);
});
