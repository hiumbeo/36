import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { discordManager } from './server/discord-manager.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Ping / Keep-Alive endpoints for Render 24/7 & UptimeRobot
  app.get('/ping', (req, res) => {
    res.json({
      status: 'alive',
      service: 'discord-selfbot-afk',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/ping', (req, res) => {
    res.json({ status: 'pong', uptime: Math.floor(process.uptime()) });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now(), uptime: Math.floor(process.uptime()) });
  });

  // Reset or create demo session
  app.post('/api/selfbot/reset-demo', (req, res) => {
    const session = discordManager.createDemoSession();
    res.json({ success: true, session });
  });

  // Get auto-start configuration (check if DISCORD_TOKEN is set in ENV)
  app.get('/api/selfbot/auto-config', (req, res) => {
    res.json(discordManager.getAutoConfig());
  });

  // Trigger auto-start from ENV or direct token payload
  app.post('/api/selfbot/auto-run', async (req, res) => {
    try {
      const { token, autoConnect = true, voice, customStatus, activity, status, prefix } = req.body;
      if (token) {
        // Run with provided token
        const session = await discordManager.registerAccount({
          token,
          prefix: prefix || process.env.DISCORD_PREFIX || '!',
          status: status || 'dnd',
          customStatus: customStatus || { text: 'Đang leo rank Valorant 🔥', emojiName: '🎯' },
          activity: activity || {
            name: 'VALORANT',
            type: 0,
            details: 'Competitive (Ascendant 3)',
            state: 'In Match (Ascent - Score 11 - 9)',
          },
          voice: voice || {
            guildId: '',
            channelId: '',
            selfMute: true,
            selfDeaf: true,
            selfVideo: false,
            autoReconnect: true,
          },
        });
        if (autoConnect) {
          await discordManager.connect(session.id);
        }
        return res.json({ success: true, session, message: 'Đã tự động lắp token và khởi chạy thành công!' });
      }

      // Run from ENV
      const result = await discordManager.initAutoStartFromEnv();
      res.json({
        success: result.started > 0,
        started: result.started,
        errors: result.errors,
        sessions: discordManager.getSessions(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Validate a Discord User Token
  app.post('/api/selfbot/validate-token', async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token không được để trống' });
    }
    const result = await discordManager.validateToken(token);
    res.json(result);
  });

  // Get all registered sessions
  app.get('/api/selfbot/sessions', (req, res) => {
    res.json({
      sessions: discordManager.getSessions(),
    });
  });

  // Register or update an account
  app.post('/api/selfbot/register', async (req, res) => {
    try {
      const { token, status, customStatus, activity, voice, rotatingStatus } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token không được để trống' });
      }
      const session = await discordManager.registerAccount({
        token,
        status,
        customStatus,
        activity,
        voice,
        rotatingStatus,
      });
      res.json({ success: true, session });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Lỗi khi đăng ký tài khoản' });
    }
  });

  // Delete account
  app.delete('/api/selfbot/accounts/:id', async (req, res) => {
    const { id } = req.params;
    const success = await discordManager.removeAccount(id);
    res.json({ success });
  });

  // Connect to Gateway
  app.post('/api/selfbot/accounts/:id/connect', async (req, res) => {
    try {
      const { id } = req.params;
      await discordManager.connect(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Disconnect from Gateway
  app.post('/api/selfbot/accounts/:id/disconnect', async (req, res) => {
    const { id } = req.params;
    const success = await discordManager.disconnect(id);
    res.json({ success });
  });

  // Force Reconnect Gateway (Chống Zombie)
  app.post('/api/selfbot/accounts/:id/reconnect', (req, res) => {
    const { id } = req.params;
    const success = discordManager.forceReconnect(id);
    res.json({ success });
  });

  // Update Presence (Status & Activity)
  app.post('/api/selfbot/accounts/:id/presence', (req, res) => {
    const { id } = req.params;
    const { status, activity, customStatus } = req.body;
    const success = discordManager.updatePresence(id, status, activity, customStatus);
    res.json({ success });
  });

  // Update Voice channel
  app.post('/api/selfbot/accounts/:id/voice', (req, res) => {
    const { id } = req.params;
    const voiceConfig = req.body;
    const success = discordManager.updateVoice(id, voiceConfig);
    res.json({ success });
  });

  // Configure rotating status
  app.post('/api/selfbot/accounts/:id/rotating-status', (req, res) => {
    const { id } = req.params;
    const { enabled, intervalSeconds, items } = req.body;
    const success = discordManager.setRotatingStatus(id, { enabled, intervalSeconds, items });
    res.json({ success });
  });

  // Update Prefix
  app.post('/api/selfbot/accounts/:id/prefix', (req, res) => {
    const { id } = req.params;
    const { prefix } = req.body;
    const success = discordManager.updatePrefix(id, prefix);
    res.json({ success, prefix });
  });

  // Update AFK
  app.post('/api/selfbot/accounts/:id/afk', (req, res) => {
    const { id } = req.params;
    const { enabled, message } = req.body;
    const success = discordManager.updateAFK(id, { enabled, message });
    res.json({ success });
  });

  // Fetch Guilds for account
  app.get('/api/selfbot/accounts/:id/guilds', async (req, res) => {
    const { id } = req.params;
    const session = discordManager.getSession(id);
    if (!session) {
      return res.status(404).json({ error: 'Tài khoản không tồn tại' });
    }
    const guilds = await discordManager.fetchGuilds(session.token);
    res.json({ guilds });
  });

  // Fetch Voice Channels for account & guild
  app.get('/api/selfbot/accounts/:id/guilds/:guildId/channels', async (req, res) => {
    const { id, guildId } = req.params;
    const session = discordManager.getSession(id);
    if (!session) {
      return res.status(404).json({ error: 'Tài khoản không tồn tại' });
    }
    const channels = await discordManager.fetchGuildChannels(session.token, guildId);
    res.json({ channels });
  });

  // Get logs
  app.get('/api/selfbot/logs', (req, res) => {
    res.json({ logs: discordManager.getLogs() });
  });

  // Clear logs
  app.post('/api/selfbot/logs/clear', (req, res) => {
    discordManager.clearLogs();
    res.json({ success: true });
  });

  // SSE Stream for real-time logs & telemetry
  app.get('/api/selfbot/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial snapshot
    res.write(`data: ${JSON.stringify({ type: 'init', sessions: discordManager.getSessions() })}\n\n`);

    const unsubscribe = discordManager.subscribeLogs((log) => {
      res.write(`data: ${JSON.stringify({ type: 'log', log })}\n\n`);
    });

    const statusInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'sessions', sessions: discordManager.getSessions() })}\n\n`);
    }, 2000);

    req.on('close', () => {
      unsubscribe();
      clearInterval(statusInterval);
    });
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Selfbot Discord Server running on port ${PORT}`);

    // Self-Ping Keep-Alive for Render Free Tier (pings every 5 mins to prevent sleep)
    const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
    if (externalUrl) {
      const pingEndpoint = externalUrl.endsWith('/ping') ? externalUrl : `${externalUrl}/ping`;
      console.log(`[Keep-Alive 24/7] Đã kích hoạt tự động ping: ${pingEndpoint}`);
      setInterval(async () => {
        try {
          await fetch(pingEndpoint);
          discordManager.addLog('info', `[Keep-Alive] Ping thành công đến ${pingEndpoint}`);
        } catch (err: any) {
          discordManager.addLog('warn', `[Keep-Alive] Ping gặp lỗi: ${err.message}`);
        }
      }, 5 * 60 * 1000);
    }

    // Local process keep-alive to ensure event loop remains active
    setInterval(() => {
      // noop to keep timer ref active
    }, 60000);
  });
}

startServer();
