import WebSocket from 'ws';
import { handleExtensiveCommand } from './commands-handler.js';
import type { 
  AccountSession, 
  DiscordStatus, 
  ActivityConfig, 
  ActivityType,
  VoiceConfig, 
  LogMessage,
  DiscordGuild,
  DiscordChannel,
  RotatingStatusItem,
  DeviceType,
  AutoReactRule
} from '../src/types.js';

interface ActiveClient {
  session: AccountSession;
  ws: WebSocket | null;
  heartbeatInterval: NodeJS.Timeout | null;
  lastHeartbeatSent: number;
  lastSequence: number | null;
  sessionId: string | null;
  resumeGatewayUrl: string | null;
  reconnectAttempts: number;
  rotationInterval: NodeJS.Timeout | null;
  currentRotationIndex: number;
  intentionalDisconnect: boolean;
  heartbeatAckReceived: boolean;
  watchdogInterval: NodeJS.Timeout | null;
  voiceWs: WebSocket | null;
  voiceHeartbeatInterval: NodeJS.Timeout | null;
  voiceServerData: {
    token: string;
    endpoint: string;
    guildId: string;
  } | null;
  voiceSessionId: string | null;
  lastVoiceConnectAttempt: number;
  autoReactRules: Map<string, AutoReactRule>;
}

export class DiscordManager {
  private clients: Map<string, ActiveClient> = new Map();
  private logs: LogMessage[] = [];
  private logListeners: Set<(log: LogMessage) => void> = new Set();
  private maxLogs = 400;

  constructor() {
    this.addLog('info', 'Discord Selfbot Gateway Manager v2.0 khởi động thành công.');

    const rawTokens = process.env.DISCORD_TOKEN || process.env.DISCORD_USER_TOKEN || process.env.DISCORD_TOKENS;
    if (rawTokens && rawTokens.trim().length > 10) {
      // Tự động nhận diện token thật và khởi chạy ngay lập tức, không tạo demo
      this.initAutoStartFromEnv();
    } else {
      this.addLog('info', '[Sẵn Sàng] Chờ Token Discord thật từ bạn để tự động kết nối và treo 24/7 (nhập qua Web hoặc cấu hình DISCORD_TOKEN trên Render).');
    }
  }

  /**
   * Tự động nhận diện token từ Biến Môi Trường (DISCORD_TOKEN) và tự động kích hoạt bot chạy 24/7
   */
  public async initAutoStartFromEnv(): Promise<{ started: number; errors: string[] }> {
    const rawTokens = process.env.DISCORD_TOKEN || process.env.DISCORD_USER_TOKEN || process.env.DISCORD_TOKENS;
    const result = { started: 0, errors: [] as string[] };

    if (!rawTokens) {
      this.addLog('info', '[Tự Động Chạy] Chưa cấu hình DISCORD_TOKEN trong biến môi trường. Bạn có thể thêm token qua Web UI hoặc đặt DISCORD_TOKEN trên Render.');
      return result;
    }

    const tokenList = rawTokens
      .split(/[\n,;]+/)
      .map(t => t.trim().replace(/^["']|["']$/g, ''))
      .filter(t => t.length > 10);

    if (tokenList.length === 0) {
      return result;
    }

    // Tự động xoá tài khoản demo nếu đang có tài khoản thật
    if (this.clients.has('demo-user-1337')) {
      this.clients.delete('demo-user-1337');
    }

    this.addLog('info', `[Tự Động Chạy] Phát hiện ${tokenList.length} token từ Environment Variables. Đang tự động kiểm tra và khởi chạy bot...`);

    const deviceType = ((process.env.DISCORD_DEVICE_TYPE as DeviceType) || 'mobile');
    const customStatusText = process.env.DISCORD_CUSTOM_STATUS || '';
    const customStatusEmoji = process.env.DISCORD_CUSTOM_EMOJI || '';
    const activityName = process.env.DISCORD_ACTIVITY_NAME || '';
    const activityType = (process.env.DISCORD_ACTIVITY_TYPE ? parseInt(process.env.DISCORD_ACTIVITY_TYPE, 10) : 0) as ActivityType;
    const streamUrl = process.env.DISCORD_STREAM_URL || '';
    const defaultStatus = (process.env.DISCORD_STATUS as DiscordStatus) || 'online';
    const guildId = process.env.DISCORD_GUILD_ID || '';
    const channelId = process.env.DISCORD_VOICE_CHANNEL_ID || '';

    for (const token of tokenList) {
      try {
        const session = await this.registerAccount({
          token,
          prefix: process.env.DISCORD_PREFIX || '!',
          deviceType,
          status: defaultStatus,
          customStatus: customStatusText ? { text: customStatusText, emojiName: customStatusEmoji || '⚡' } : { text: '', emojiName: '' },
          activity: activityName ? {
            name: activityName,
            type: activityType,
            details: process.env.DISCORD_ACTIVITY_DETAILS || '',
            state: process.env.DISCORD_ACTIVITY_STATE || '',
            url: activityType === 1 ? streamUrl : undefined,
          } : { name: '', type: 0 },
          voice: {
            guildId,
            channelId,
            selfMute: process.env.DISCORD_VOICE_MUTE !== 'false',
            selfDeaf: process.env.DISCORD_VOICE_DEAF !== 'false',
            selfVideo: process.env.DISCORD_VOICE_VIDEO === 'true',
            autoReconnect: true,
          },
        });

        this.addLog('success', `[Tự Động Chạy] Đã xác thực [${session.name}] (@${session.username})! Đang kết nối Gateway (Chế độ thiết bị: ${deviceType.toUpperCase()} - Icon: 📱)...`, session.id);
        await this.connect(session.id);
        this.addLog('success', `[Tự Động Chạy] Bot [${session.name}] đã kết nối thành công và đang treo 24/7 trực tuyến liên tục (📱 Điện thoại)!`, session.id);
        result.started++;
      } catch (err: any) {
        const msg = `Không thể tự động khởi chạy token: ${err.message}`;
        this.addLog('error', `[Tự Động Chạy] ${msg}`);
        result.errors.push(msg);
      }
    }

    return result;
  }

  /**
   * Lấy thông tin cấu hình tự động chạy
   */
  public getAutoConfig() {
    const rawToken = process.env.DISCORD_TOKEN || process.env.DISCORD_USER_TOKEN || '';
    return {
      hasEnvToken: Boolean(rawToken && rawToken.trim().length > 10),
      maskedToken: rawToken && rawToken.trim().length > 10
        ? `${rawToken.trim().slice(0, 8)}••••••••••••••••${rawToken.trim().slice(-6)}`
        : null,
      defaults: {
        deviceType: (process.env.DISCORD_DEVICE_TYPE as DeviceType) || 'mobile',
        status: process.env.DISCORD_STATUS || 'online',
        customStatus: process.env.DISCORD_CUSTOM_STATUS || '',
        customEmoji: process.env.DISCORD_CUSTOM_EMOJI || '',
        activityName: process.env.DISCORD_ACTIVITY_NAME || '',
        activityType: process.env.DISCORD_ACTIVITY_TYPE ? parseInt(process.env.DISCORD_ACTIVITY_TYPE, 10) : 0,
        streamUrl: process.env.DISCORD_STREAM_URL || '',
        guildId: process.env.DISCORD_GUILD_ID || '',
        channelId: process.env.DISCORD_VOICE_CHANNEL_ID || '',
      }
    };
  }

  /**
   * Tạo hoặc đặt lại tài khoản mẫu (Demo Account) để xem trước giao diện và trải nghiệm
   */
  public createDemoSession(): AccountSession {
    const demoId = 'demo-user-1337';
    let client = this.clients.get(demoId);
    if (!client) {
      const session: AccountSession = {
        id: demoId,
        token: 'demo-token-preview',
        name: 'NguyenDev (Xem Trước)',
        username: 'nguyendev',
        discriminator: '1337',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face',
        status: 'online',
        deviceType: 'mobile',
        customStatus: { text: 'Treo 24/7 trên Render.com 🚀', emojiName: '💻' },
        activity: {
          name: 'Twitch',
          type: 1, // Streaming
          details: 'Live Coding Discord Selfbot 24/7',
          state: 'Hosting on Render Free Cloud',
          url: 'https://twitch.tv/nguyendev',
        },
        rotatingStatus: {
          enabled: false,
          intervalSeconds: 15,
          items: [
            { id: '1', text: 'Treo Voice 24/7 🔊', activityName: 'Lofi Girl', activityType: 2, status: 'online' },
            { id: '2', text: 'Coding Bot on Render 🚀', activityName: 'Visual Studio Code', activityType: 0, status: 'idle' },
          ],
        },
        voice: {
          guildId: 'guild-demo-999',
          guildName: 'Vietnam Dev Hub 🇻🇳',
          channelId: 'chan-demo-111',
          channelName: 'Phòng Voice AFK 24/7 🔊',
          selfMute: true,
          selfDeaf: true,
          selfVideo: false,
          autoReconnect: true,
        },
        prefix: '!',
        afk: {
          enabled: false,
          message: 'Tài khoản đang AFK / Treo 24/7 trên Render Cloud 🚀',
        },
        isConnected: true,
        isVoiceConnected: true,
        uptimeStart: Date.now() - 1000 * 60 * 142, // Đã chạy 2.3h
        voiceUptimeStart: Date.now() - 1000 * 60 * 120, // 2h
        ping: 28,
        lastHeartbeatAck: Date.now(),
      };

      client = {
        session,
        ws: null,
        heartbeatInterval: null,
        lastHeartbeatSent: 0,
        lastSequence: null,
        sessionId: 'demo-session-id',
        resumeGatewayUrl: null,
        reconnectAttempts: 0,
        rotationInterval: null,
        currentRotationIndex: 0,
        intentionalDisconnect: false,
        heartbeatAckReceived: true,
        watchdogInterval: null,
        voiceWs: null,
        voiceHeartbeatInterval: null,
        voiceServerData: null,
        voiceSessionId: 'demo-voice-session',
        lastVoiceConnectAttempt: 0,
        autoReactRules: new Map(),
      };

      this.clients.set(demoId, client);
      this.addLog('success', 'Tài khoản mẫu [NguyenDev] đã sẵn sàng để bạn trải nghiệm và xem trước trực tiếp.', demoId);
      this.addLog('ws', '[Opcode 2] Kết nối Discord Gateway v10 thành công (Ping: 28ms)', demoId);
      this.addLog('voice', '[Opcode 4] Đang giữ kết nối phòng: Phòng Voice AFK 24/7 🔊', demoId);
    }
    return { ...client.session };
  }

  public addLog(level: LogMessage['level'], message: string, accountId?: string) {
    const logItem: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      accountId,
      timestamp: Date.now(),
      level,
      message,
    };
    this.logs.push(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    for (const listener of this.logListeners) {
      try {
        listener(logItem);
      } catch (err) {
        console.error('Error in log listener:', err);
      }
    }
  }

  public subscribeLogs(cb: (log: LogMessage) => void): () => void {
    this.logListeners.add(cb);
    return () => {
      this.logListeners.delete(cb);
    };
  }

  public getLogs(): LogMessage[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.addLog('info', 'Đã xóa toàn bộ nhật ký hệ thống.');
  }

  public getSessions(): AccountSession[] {
    return Array.from(this.clients.values()).map(c => ({
      ...c.session,
      autoReactRules: Array.from(c.autoReactRules?.values() || []),
    }));
  }

  public getSession(id: string): AccountSession | undefined {
    const client = this.clients.get(id);
    return client ? {
      ...client.session,
      autoReactRules: Array.from(client.autoReactRules?.values() || []),
    } : undefined;
  }

  /**
   * Validate token against Discord REST API
   */
  public async validateToken(token: string): Promise<{
    valid: boolean;
    user?: { id: string; username: string; discriminator: string; avatar: string | null; global_name?: string };
    error?: string;
  }> {
    try {
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      const res = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: cleanToken,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { valid: false, error: `Discord API từ chối token (HTTP ${res.status}): ${errorText}` };
      }

      const userData = await res.json();
      return {
        valid: true,
        user: {
          id: userData.id,
          username: userData.global_name || userData.username,
          discriminator: userData.discriminator,
          avatar: userData.avatar 
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128` 
            : null,
          global_name: userData.global_name,
        },
      };
    } catch (err: any) {
      return { valid: false, error: `Lỗi kết nối kiểm tra token: ${err.message}` };
    }
  }

  /**
   * Fetch guilds for a user token
   */
  public async fetchGuilds(token: string): Promise<DiscordGuild[]> {
    if (token === 'demo-token-preview') {
      return [
        { id: 'guild-demo-999', name: 'Vietnam Dev Hub 🇻🇳', icon: null },
        { id: 'guild-demo-888', name: 'Gaming & Chill Lounge 🎮', icon: null },
        { id: 'guild-demo-777', name: 'Streamer Squad 🟣', icon: null },
      ];
    }
    try {
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: cleanToken,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
      }));
    } catch (err) {
      console.error('Failed to fetch guilds:', err);
      return [];
    }
  }

  /**
   * Fetch voice channels for a guild
   */
  public async fetchGuildChannels(token: string, guildId: string): Promise<DiscordChannel[]> {
    if (token === 'demo-token-preview') {
      return [
        { id: 'chan-demo-111', name: 'Phòng Voice AFK 24/7 🔊', type: 2, position: 0 },
        { id: 'chan-demo-222', name: 'Góc Nghe Nhạc Lofi 🎧', type: 2, position: 1 },
        { id: 'chan-demo-333', name: 'Chém Gió Đêm Khuya 💬', type: 2, position: 2 },
      ];
    }
    try {
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: {
          Authorization: cleanToken,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      // Type 2: GUILD_VOICE, Type 13: GUILD_STAGE_VOICE
      return data
        .filter((c: any) => c.type === 2 || c.type === 13)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          position: c.position || 0,
        }))
        .sort((a: DiscordChannel, b: DiscordChannel) => a.position - b.position);
    } catch (err) {
      console.error('Failed to fetch channels:', err);
      return [];
    }
  }

  /**
   * Add or update an account session
   */
  public async registerAccount(accountData: Partial<AccountSession> & { token: string }): Promise<AccountSession> {
    const cleanToken = accountData.token.trim().replace(/^["']|["']$/g, '');
    const val = await this.validateToken(cleanToken);

    if (!val.valid || !val.user) {
      throw new Error(val.error || 'Token Discord không hợp lệ hoặc đã hết hạn.');
    }

    const id = val.user.id;
    
    // Tự động xoá tài khoản demo khi có tài khoản Discord thật được đăng ký
    if (this.clients.has('demo-user-1337')) {
      this.clients.delete('demo-user-1337');
      this.addLog('info', 'Đã tự động huỷ tài khoản Demo, chuyển sang sử dụng tài khoản Discord thật của bạn.');
    }

    let client = this.clients.get(id);

    if (!client) {
      const session: AccountSession = {
        id,
        token: cleanToken,
        name: val.user.username,
        username: val.user.username,
        discriminator: val.user.discriminator,
        avatar: val.user.avatar,
        deviceType: accountData.deviceType || 'mobile',
        status: accountData.status || 'online',
        customStatus: accountData.customStatus !== undefined 
          ? accountData.customStatus 
          : { text: '', emojiName: '' },
        activity: accountData.activity !== undefined 
          ? accountData.activity 
          : { name: '', type: 0 },
        rotatingStatus: accountData.rotatingStatus || {
          enabled: false,
          intervalSeconds: 15,
          items: [],
        },
        voice: accountData.voice || {
          guildId: '',
          channelId: '',
          selfMute: true,
          selfDeaf: true,
          selfVideo: false,
          autoReconnect: true,
        },
        prefix: accountData.prefix || process.env.DISCORD_PREFIX || '!',
        afk: accountData.afk || {
          enabled: false,
          message: 'Hiện tại tôi đang AFK / bận, tôi sẽ phản hồi sau!',
        },
        isConnected: false,
        isVoiceConnected: false,
        uptimeStart: null,
        voiceUptimeStart: null,
        ping: 0,
        lastHeartbeatAck: null,
      };

      client = {
        session,
        ws: null,
        heartbeatInterval: null,
        lastHeartbeatSent: 0,
        lastSequence: null,
        sessionId: null,
        resumeGatewayUrl: null,
        reconnectAttempts: 0,
        rotationInterval: null,
        currentRotationIndex: 0,
        intentionalDisconnect: false,
        heartbeatAckReceived: true,
        watchdogInterval: null,
        voiceWs: null,
        voiceHeartbeatInterval: null,
        voiceServerData: null,
        voiceSessionId: null,
        lastVoiceConnectAttempt: 0,
        autoReactRules: new Map(),
      };

      this.clients.set(id, client);
      this.addLog('info', `Đã thêm tài khoản [${val.user.username}] (${id}) vào hệ thống. Chế độ thiết bị: [${session.deviceType?.toUpperCase() || 'MOBILE'}].`, id);
    } else {
      // Update existing
      client.session.token = cleanToken;
      client.session.name = val.user.username;
      client.session.username = val.user.username;
      client.session.discriminator = val.user.discriminator;
      client.session.avatar = val.user.avatar;
      if (accountData.deviceType) client.session.deviceType = accountData.deviceType;
      if (accountData.status) client.session.status = accountData.status;
      if (accountData.customStatus !== undefined) client.session.customStatus = accountData.customStatus;
      if (accountData.activity !== undefined) client.session.activity = accountData.activity;
      if (accountData.voice) client.session.voice = accountData.voice;
      if (accountData.rotatingStatus) client.session.rotatingStatus = accountData.rotatingStatus;
    }

    return { ...client.session };
  }

  /**
   * Delete an account
   */
  public async removeAccount(id: string): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) return false;
    await this.disconnect(id);
    this.clients.delete(id);
    this.addLog('info', `Đã xóa tài khoản (${id}) khỏi hệ thống.`, id);
    return true;
  }

  /**
   * Connect account to Discord Gateway
   */
  public async connect(id: string): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) throw new Error('Không tìm thấy tài khoản');

    if (id.startsWith('demo-')) {
      client.session.isConnected = true;
      client.session.uptimeStart = Date.now();
      client.session.ping = 24 + Math.floor(Math.random() * 12);
      this.addLog('ws', `[DEMO Opcode 2] Gửi gói tin Identify xác thực tài khoản mẫu...`, id);
      this.addLog('success', `[DEMO Gateway] Kết nối Gateway thành công (Ping: ${client.session.ping}ms)`, id);
      if (client.session.voice.channelId) {
        client.session.isVoiceConnected = true;
        client.session.voiceUptimeStart = Date.now();
        this.addLog('voice', `[DEMO Opcode 4] Đã giữ kết nối phòng: ${client.session.voice.channelName || 'Phòng Voice AFK 24/7'}`, id);
      }
      return true;
    }

    if (client.ws && (client.ws.readyState === WebSocket.OPEN || client.ws.readyState === WebSocket.CONNECTING)) {
      this.addLog('warn', `Tài khoản ${client.session.name} đã ở trạng thái kết nối.`, id);
      return true;
    }

    client.intentionalDisconnect = false;
    this.initGatewayConnection(client);
    return true;
  }

  /**
   * Disconnect account from Gateway
   */
  public async disconnect(id: string): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) return false;

    if (id.startsWith('demo-')) {
      client.session.isConnected = false;
      client.session.isVoiceConnected = false;
      client.session.uptimeStart = null;
      client.session.voiceUptimeStart = null;
      client.session.ping = 0;
      this.addLog('info', `[DEMO Gateway] Đã ngắt kết nối Gateway cho tài khoản mẫu.`, id);
      return true;
    }

    client.intentionalDisconnect = true;

    // Leave voice if joined
    if (client.session.isVoiceConnected && client.ws && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({
          op: 4,
          d: {
            guild_id: client.session.voice.guildId,
            channel_id: null,
            self_mute: false,
            self_deaf: false,
            self_video: false,
          },
        }));
      } catch (e) {
        // ignore
      }
    }

    if (client.heartbeatInterval) {
      clearInterval(client.heartbeatInterval);
      client.heartbeatInterval = null;
    }
    if (client.rotationInterval) {
      clearInterval(client.rotationInterval);
      client.rotationInterval = null;
    }
    if (client.watchdogInterval) {
      clearInterval(client.watchdogInterval);
      client.watchdogInterval = null;
    }

    this.cleanupVoiceWs(client);

    if (client.ws) {
      try {
        client.ws.close(1000, 'User requested disconnect');
      } catch (e) {
        // ignore
      }
      client.ws = null;
    }

    client.session.isConnected = false;
    client.session.isVoiceConnected = false;
    client.session.uptimeStart = null;
    client.session.voiceUptimeStart = null;
    client.session.ping = 0;

    this.addLog('info', `Đã ngắt kết nối Gateway cho tài khoản [${client.session.name}].`, id);
    return true;
  }

  /**
   * Khởi động lại kết nối Gateway ngay lập tức (Chống Zombie / Phục hồi 24/7)
   */
  public forceReconnect(id: string): boolean {
    const client = this.clients.get(id);
    if (!client) return false;
    this.addLog('info', `[Làm Mới Gateway] Đang làm mới socket kết nối cho ${client.session.name}...`, id);
    if (client.ws) {
      try {
        client.ws.terminate();
      } catch (e) {
        // ignore
      }
    } else {
      this.initGatewayConnection(client);
    }
    return true;
  }

  /**
   * Update Presence (Status & Activity)
   */
  public updatePresence(id: string, status?: DiscordStatus, activity?: ActivityConfig, customStatus?: { text: string; emojiName?: string }): boolean {
    const client = this.clients.get(id);
    if (!client) return false;

    if (status) client.session.status = status;
    if (activity) client.session.activity = activity;
    if (customStatus) client.session.customStatus = customStatus;

    if (id.startsWith('demo-')) {
      this.addLog('info', `[DEMO Opcode 3] Cập nhật trạng thái [${client.session.status}] và hoạt động thành công!`, id);
      return true;
    }

    if (client.ws && client.ws.readyState === WebSocket.OPEN) {
      this.sendPresencePayload(client);
      this.addLog('info', `Cập nhật trạng thái [${client.session.status}] và hoạt động cho [${client.session.name}].`, id);
    }
    return true;
  }

  /**
   * Cập nhật loại thiết bị (Mobile Phone, iOS, PC, Web) và kích hoạt lại kết nối để cập nhật icon
   */
  public async updateDeviceType(id: string, deviceType: DeviceType): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) return false;
    client.session.deviceType = deviceType;

    const deviceLabels: Record<DeviceType, string> = {
      mobile: '📱 Điện thoại (Discord Android)',
      ios: '🍏 Điện thoại iPhone (Discord iOS)',
      desktop: '💻 Máy tính (Discord PC / Desktop)',
      web: '🌐 Trình duyệt Web (Chrome)',
    };

    this.addLog('info', `Đã chuyển loại thiết bị sang: ${deviceLabels[deviceType]}`, id);

    if (id.startsWith('demo-')) {
      return true;
    }

    // Nếu đang kết nối, cần re-identify để Discord nhận diện loại thiết bị mới
    if (client.ws && client.ws.readyState === WebSocket.OPEN) {
      this.addLog('ws', `Làm mới kết nối Gateway với thiết bị [${deviceLabels[deviceType]}] để Discord cập nhật icon biểu tượng...`, id);
      client.sessionId = null; // Xoá sessionId để Gateway gửi IDENTIFY mới thay vì RESUME
      client.lastSequence = null;
      try {
        client.ws.terminate();
      } catch {}
    }
    return true;
  }

  /**
   * Thiết lập chế độ Treo Điện Thoại Tinh Khiết 24/7 (Không status, không game, chỉ treo online điện thoại liên tục)
   */
  public setPureOnlineMobile(id: string): boolean {
    const client = this.clients.get(id);
    if (!client) return false;

    client.session.deviceType = 'mobile';
    client.session.status = 'online';
    client.session.customStatus = { text: '', emojiName: '' };
    client.session.activity = { name: '', type: 0, details: '', state: '' };

    if (client.rotationInterval) {
      clearInterval(client.rotationInterval);
      client.rotationInterval = null;
    }
    client.session.rotatingStatus = { enabled: false, intervalSeconds: 15, items: [] };

    this.addLog('success', `[Treo Điện Thoại 24/7] Đã bật chế độ Tinh Khiết: Trực tuyến liên tục với icon Điện Thoại (📱), không status và không game!`, id);

    if (id.startsWith('demo-')) {
      return true;
    }

    if (client.ws && client.ws.readyState === WebSocket.OPEN) {
      client.sessionId = null;
      client.lastSequence = null;
      try {
        client.ws.terminate();
      } catch {}
    }
    return true;
  }

  /**
   * Update Voice Channel connection
   */
  public async updateVoice(id: string, voiceConfig: Partial<VoiceConfig>): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) return false;

    // Xử lý nếu người dùng dán cả link Discord Channel (e.g. https://discord.com/channels/GUILD_ID/CHANNEL_ID)
    if (voiceConfig.channelId) {
      const linkMatch = voiceConfig.channelId.match(/discord\.com\/channels\/([0-9]+)\/([0-9]+)/);
      if (linkMatch) {
        voiceConfig.guildId = linkMatch[1];
        voiceConfig.channelId = linkMatch[2];
      } else {
        voiceConfig.channelId = voiceConfig.channelId.replace(/[^0-9]/g, '');
      }
    }
    if (voiceConfig.guildId) {
      voiceConfig.guildId = voiceConfig.guildId.replace(/[^0-9]/g, '');
    }

    client.session.voice = {
      ...client.session.voice,
      ...voiceConfig,
    };

    if (id.startsWith('demo-')) {
      if (client.session.voice.channelId) {
        client.session.isVoiceConnected = true;
        client.session.voiceUptimeStart = Date.now();
        this.addLog('voice', `[DEMO Opcode 4] Đã chuyển vào phòng Voice: ${client.session.voice.channelName || client.session.voice.channelId}`, id);
      } else {
        client.session.isVoiceConnected = false;
        client.session.voiceUptimeStart = null;
        this.addLog('voice', `[DEMO Opcode 4] Đã rời phòng Voice.`, id);
      }
      return true;
    }

    // Nếu có channelId mà thiếu guildId, tự động tra cứu qua API Discord để lấy đúng guildId
    if (client.session.voice.channelId && !client.session.voice.guildId) {
      try {
        const cleanChanId = client.session.voice.channelId.replace(/[^0-9]/g, '');
        const res = await fetch(`https://discord.com/api/v9/channels/${cleanChanId}`, {
          headers: {
            Authorization: client.session.token,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          },
        });
        if (res.ok) {
          const chData: any = await res.json();
          if (chData.guild_id) {
            client.session.voice.guildId = chData.guild_id;
            client.session.voice.channelName = chData.name || cleanChanId;
            this.addLog('voice', `Tự động nhận diện Server (Guild ID: ${chData.guild_id}) cho phòng ${chData.name || cleanChanId}`, id);
          }
        }
      } catch (err: any) {
        this.addLog('warn', `Không thể tra cứu thông tin kênh voice: ${err.message}`, id);
      }
    }

    if (client.ws && client.ws.readyState === WebSocket.OPEN) {
      if (client.session.voice.channelId) {
        if (!client.session.voice.guildId) {
          this.addLog('warn', `Cần có Guild ID (Server ID) để vào phòng Voice. Hãy dùng lệnh: !join <guild_id> <channel_id> hoặc chọn trên Web.`, id);
          return false;
        }
        client.lastVoiceConnectAttempt = Date.now();
        this.sendVoiceStatePayload(client, client.session.voice.guildId, client.session.voice.channelId);
        this.addLog('voice', `Đang kết nối phòng Voice ID: ${client.session.voice.channelId} (Guild: ${client.session.voice.guildId})...`, id);
      } else {
        // Rời phòng voice
        this.cleanupVoiceWs(client);
        if (client.session.voice.guildId) {
          this.sendVoiceStatePayload(client, client.session.voice.guildId, null);
        }
        client.session.isVoiceConnected = false;
        client.session.voiceUptimeStart = null;
        this.addLog('voice', `Đã rời phòng Voice.`, id);
      }
    }
    return true;
  }

  /**
   * Configure Rotating Status
   */
  public setRotatingStatus(id: string, config: { enabled: boolean; intervalSeconds: number; items: RotatingStatusItem[] }): boolean {
    const client = this.clients.get(id);
    if (!client) return false;

    client.session.rotatingStatus = config;
    if (client.rotationInterval) {
      clearInterval(client.rotationInterval);
      client.rotationInterval = null;
    }

    if (config.enabled && config.items.length > 0) {
      const intervalMs = Math.max(5, config.intervalSeconds) * 1000;
      client.rotationInterval = setInterval(() => {
        if (!client.session.isConnected || !client.ws || client.ws.readyState !== WebSocket.OPEN) return;
        
        client.currentRotationIndex = (client.currentRotationIndex + 1) % config.items.length;
        const item = config.items[client.currentRotationIndex];
        if (item) {
          client.session.status = item.status;
          client.session.customStatus = { text: item.text };
          client.session.activity = {
            name: item.activityName || item.text,
            type: item.activityType,
          };
          this.sendPresencePayload(client);
        }
      }, intervalMs);
      this.addLog('info', `Đã kích hoạt đổi trạng thái tự động mỗi ${config.intervalSeconds}s (${config.items.length} trạng thái).`, id);
    } else {
      this.addLog('info', `Đã tắt đổi trạng thái tự động.`, id);
    }

    return true;
  }

  /**
   * Update Command Prefix for account
   */
  public updatePrefix(id: string, prefix: string): boolean {
    const client = this.clients.get(id);
    if (!client) return false;
    const cleanPrefix = prefix.trim() || '!';
    client.session.prefix = cleanPrefix;
    this.addLog('info', `Đã đổi tiền tố lệnh (prefix) sang: [${cleanPrefix}]`, id);
    return true;
  }

  /**
   * Update AFK Auto-Responder
   */
  public updateAFK(id: string, afk: { enabled: boolean; message: string }): boolean {
    const client = this.clients.get(id);
    if (!client) return false;
    client.session.afk = {
      enabled: afk.enabled,
      message: afk.message.trim() || 'Hiện tại tôi đang AFK / bận, tôi sẽ phản hồi sau!',
    };
    this.addLog('info', `Chế độ AFK Auto-Reply: ${afk.enabled ? 'ĐÃ BẬT (' + client.session.afk.message + ')' : 'ĐÃ TẮT'}`, id);
    return true;
  }

  /**
   * Thêm quy tắc tự động thả emoji (Auto-React) cho một mục tiêu
   */
  public addAutoReactRule(id: string, rule: Omit<AutoReactRule, 'id' | 'createdAt'>): AutoReactRule | null {
    const client = this.clients.get(id);
    if (!client) return null;
    if (!client.autoReactRules) client.autoReactRules = new Map();

    const ruleId = Math.random().toString(36).substring(2, 9);
    const key = `${rule.guildId || 'all'}_${rule.targetUserId}`;
    const newRule: AutoReactRule = {
      ...rule,
      id: ruleId,
      createdAt: Date.now(),
    };
    client.autoReactRules.set(key, newRule);
    return newRule;
  }

  /**
   * Xóa quy tắc thả emoji (Auto-React)
   */
  public removeAutoReactRule(id: string, targetUserId?: string, guildId?: string): number {
    const client = this.clients.get(id);
    if (!client || !client.autoReactRules) return 0;
    let count = 0;
    if (!targetUserId && !guildId) {
      count = client.autoReactRules.size;
      client.autoReactRules.clear();
      return count;
    }
    for (const [key, rule] of client.autoReactRules.entries()) {
      const matchTarget = !targetUserId || rule.targetUserId === targetUserId;
      const matchGuild = !guildId || rule.guildId === guildId || !rule.guildId;
      if (matchTarget && matchGuild) {
        client.autoReactRules.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Lấy danh sách quy tắc thả emoji của tài khoản
   */
  public getAutoReactRules(id: string): AutoReactRule[] {
    const client = this.clients.get(id);
    if (!client || !client.autoReactRules) return [];
    return Array.from(client.autoReactRules.values());
  }

  /**
   * Thả emoji vào tin nhắn qua Discord REST API
   */
  public async addReaction(client: ActiveClient, channelId: string, messageId: string, emoji: string): Promise<boolean> {
    if (client.session.id.startsWith('demo-')) {
      this.addLog('info', `[DEMO Reaction] Thả emoji ${emoji} vào tin nhắn ${messageId}`, client.session.id);
      return true;
    }
    try {
      let formattedEmoji = emoji.trim();
      const customEmojiMatch = formattedEmoji.match(/^<(?:a)?:([a-zA-Z0-9_]+):([0-9]+)>$/);
      if (customEmojiMatch) {
        formattedEmoji = `${customEmojiMatch[1]}:${customEmojiMatch[2]}`;
      }
      const encoded = encodeURIComponent(formattedEmoji);

      const res = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${encoded}/@me`, {
        method: 'PUT',
        headers: {
          Authorization: client.session.token,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Content-Length': '0',
        },
      });
      return res.ok || res.status === 204;
    } catch (err: any) {
      this.addLog('warn', `Lỗi khi thả emoji: ${err.message}`, client.session.id);
      return false;
    }
  }

  /**
   * Xóa tin nhắn (stealth/silent execution)
   */
  public async deleteMessage(client: ActiveClient, channelId: string, messageId: string): Promise<boolean> {
    if (client.session.id.startsWith('demo-')) return true;
    try {
      const res = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: client.session.token,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      });
      return res.ok || res.status === 204;
    } catch {
      return false;
    }
  }

  private buildActivities(session: AccountSession): any[] {
    const activities: any[] = [];

    // Custom status (type: 4)
    if (session.customStatus && session.customStatus.text.trim()) {
      activities.push({
        name: 'Custom Status',
        type: 4,
        state: session.customStatus.text,
        emoji: session.customStatus.emojiName ? { name: session.customStatus.emojiName } : undefined,
      });
    }

    // Rich Presence Activity (Playing, Streaming, Listening, Watching, Competing)
    if (session.activity && session.activity.name.trim()) {
      const act = session.activity;
      const actObj: any = {
        name: act.name,
        type: act.type,
      };

      if (act.application_id && act.application_id.trim()) {
        actObj.application_id = act.application_id.trim();
      }

      if (act.type === 1) {
        // Streaming requires valid twitch or youtube URL for purple badge
        actObj.url = act.url && act.url.trim() ? act.url : 'https://www.twitch.tv/discord';
      }

      if (act.details && act.details.trim()) {
        actObj.details = act.details;
      }
      if (act.state && act.state.trim()) {
        actObj.state = act.state;
      }

      if (session.uptimeStart) {
        actObj.timestamps = {
          start: session.uptimeStart,
        };
      }

      if (act.assets) {
        actObj.assets = {};
        if (act.assets.large_image && act.assets.large_image.trim()) {
          actObj.assets.large_image = act.assets.large_image.trim();
        }
        if (act.assets.large_text && act.assets.large_text.trim()) {
          actObj.assets.large_text = act.assets.large_text.trim();
        }
        if (act.assets.small_image && act.assets.small_image.trim()) {
          actObj.assets.small_image = act.assets.small_image.trim();
        }
        if (act.assets.small_text && act.assets.small_text.trim()) {
          actObj.assets.small_text = act.assets.small_text.trim();
        }
      }

      activities.push(actObj);
    }

    return activities;
  }

  private sendPresencePayload(client: ActiveClient) {
    if (!client.ws || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      const payload = {
        op: 3,
        d: {
          since: null,
          activities: this.buildActivities(client.session),
          status: client.session.status,
          afk: false,
        },
      };

      client.ws.send(JSON.stringify(payload));
    } catch (err: any) {
      this.addLog('error', `Lỗi khi gửi Presence: ${err.message}`, client.session.id);
    }
  }

  private sendVoiceStatePayload(client: ActiveClient, guildId: string, channelId: string | null) {
    if (!client.ws || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      const payload = {
        op: 4,
        d: {
          guild_id: guildId || null,
          channel_id: channelId || null,
          self_mute: Boolean(client.session.voice.selfMute),
          self_deaf: Boolean(client.session.voice.selfDeaf),
          self_video: Boolean(client.session.voice.selfVideo),
        },
      };

      client.ws.send(JSON.stringify(payload));
    } catch (err: any) {
      this.addLog('error', `Lỗi khi gửi Op 4 Voice State: ${err.message}`, client.session.id);
    }
  }

  /**
   * Kết nối và xác thực Voice Gateway (WebSocket) để Discord giữ tài khoản trong phòng thoại 24/7
   */
  private connectVoiceWs(client: ActiveClient) {
    if (!client.voiceServerData || !client.voiceSessionId) return;
    const { endpoint, token, guildId } = client.voiceServerData;
    if (!endpoint) return;

    this.cleanupVoiceWs(client);

    const cleanEndpoint = endpoint.replace(':80', '').replace(':443', '');
    const voiceWsUrl = `wss://${cleanEndpoint}/?v=4`;
    const id = client.session.id;

    this.addLog('voice', `Đang bắt tay Voice Gateway tại: ${cleanEndpoint}...`, id);

    try {
      client.voiceWs = new WebSocket(voiceWsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Origin: 'https://discord.com',
        },
      });

      client.voiceWs.on('open', () => {
        this.addLog('voice', `Đã mở socket Voice Gateway thành công. Đang chờ mã Op 8 HELLO...`, id);
      });

      client.voiceWs.on('message', (raw: WebSocket.RawData) => {
        try {
          const packet = JSON.parse(raw.toString());
          const { op, d } = packet;

          // Op 8: HELLO -> Bắt đầu nhịp tim Voice và gửi Op 0 Identify
          if (op === 8) {
            const interval = d.heartbeat_interval || 20000;
            this.addLog('voice', `Voice Gateway HELLO (Heartbeat: ${interval}ms). Bắt đầu xác thực Op 0 IDENTIFY...`, id);

            if (client.voiceHeartbeatInterval) {
              clearInterval(client.voiceHeartbeatInterval);
            }

            client.voiceHeartbeatInterval = setInterval(() => {
              if (client.voiceWs && client.voiceWs.readyState === WebSocket.OPEN) {
                try {
                  client.voiceWs.send(JSON.stringify({
                    op: 3,
                    d: Date.now(),
                  }));
                } catch {}
              }
            }, Math.min(interval, 30000));

            // Gửi Op 0 Identify
            if (client.voiceWs && client.voiceWs.readyState === WebSocket.OPEN) {
              try {
                client.voiceWs.send(JSON.stringify({
                  op: 0,
                  d: {
                    server_id: guildId,
                    user_id: client.session.id,
                    session_id: client.voiceSessionId,
                    token: token,
                  },
                }));
              } catch (e: any) {
                this.addLog('error', `Lỗi gửi Op 0 Voice Identify: ${e.message}`, id);
              }
            }
          } else if (op === 2) {
            // Op 2: READY -> Hoàn tất bắt tay phòng thoại
            this.addLog('success', `Đã xác thực và giữ phòng thoại 24/7 an toàn! (SSRC: ${d.ssrc || 'OK'})`, id);
            client.session.isVoiceConnected = true;
            if (!client.session.voiceUptimeStart) {
              client.session.voiceUptimeStart = Date.now();
            }

            // Gửi Speaking State Op 5 để xác nhận trạng thái trong phòng
            if (client.voiceWs && client.voiceWs.readyState === WebSocket.OPEN) {
              try {
                client.voiceWs.send(JSON.stringify({
                  op: 5,
                  d: {
                    speaking: 0,
                    delay: 0,
                    ssrc: d.ssrc || 1,
                  },
                }));
              } catch {}
            }
          }
        } catch (e) {
          // parse error ignore
        }
      });

      client.voiceWs.on('error', (err) => {
        this.addLog('warn', `Voice Gateway cảnh báo: ${err.message}`, id);
      });

      client.voiceWs.on('close', (code, reason) => {
        const reasonStr = reason ? reason.toString() : '';
        this.addLog('voice', `Voice Gateway Socket đã đóng (Mã: ${code}${reasonStr ? `, Lý do: ${reasonStr}` : ''})`, id);
        this.cleanupVoiceWs(client);
      });
    } catch (err: any) {
      this.addLog('error', `Không thể khởi tạo Voice Gateway: ${err.message}`, id);
    }
  }

  private cleanupVoiceWs(client: ActiveClient) {
    if (client.voiceHeartbeatInterval) {
      clearInterval(client.voiceHeartbeatInterval);
      client.voiceHeartbeatInterval = null;
    }
    if (client.voiceWs) {
      try {
        client.voiceWs.removeAllListeners();
        client.voiceWs.terminate();
      } catch {}
      client.voiceWs = null;
    }
  }

  private initGatewayConnection(client: ActiveClient) {
    const gatewayUrl = client.resumeGatewayUrl || 'wss://gateway.discord.gg/?v=10&encoding=json';
    const id = client.session.id;

    // Dọn dẹp interval cũ nếu có
    if (client.heartbeatInterval) {
      clearInterval(client.heartbeatInterval);
      client.heartbeatInterval = null;
    }
    if (client.watchdogInterval) {
      clearInterval(client.watchdogInterval);
      client.watchdogInterval = null;
    }

    this.addLog('ws', `Đang kết nối tới Discord Gateway (${client.session.name})...`, id);

    try {
      client.ws = new WebSocket(gatewayUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Origin: 'https://discord.com',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      // Bật Watchdog 24/7 kiểm tra liên tục mỗi 15 giây
      client.watchdogInterval = setInterval(() => {
        if (!client.ws) return;

        // 1. Gửi ping frame WebSocket tầng transport để giữ mở cổng NAT Cloud/Render
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.ping();
          } catch {}
        }

        // 2. Kiểm tra nếu socket bị Zombie (quá 90s không có Heartbeat ACK từ Discord)
        const now = Date.now();
        if (
          client.session.isConnected &&
          client.session.lastHeartbeatAck &&
          now - client.session.lastHeartbeatAck > 90000
        ) {
          this.addLog(
            'warn',
            `[Watchdog 24/7] Quá 90s không nhận được tín hiệu Gateway từ Discord (Zombie Connection). Đang ép tái kết nối để phục hồi bot nhận lệnh...`,
            id
          );
          try {
            client.ws.terminate();
          } catch {}
        }
      }, 15000);

      client.ws.on('open', () => {
        client.heartbeatAckReceived = true;
        this.addLog('ws', `Đã mở socket Gateway thành công. Đang chờ mã Op 10 HELLO...`, id);
      });

      client.ws.on('message', (data: WebSocket.RawData) => {
        this.handleGatewayMessage(client, data.toString());
      });

      client.ws.on('error', (err) => {
        this.addLog('error', `Lỗi Gateway Socket: ${err.message}`, id);
      });

      client.ws.on('close', (code, reason) => {
        const reasonStr = reason ? reason.toString() : 'Không rõ';
        this.addLog('warn', `Gateway đóng kết nối. Code: ${code}, Lý do: ${reasonStr}`, id);
        
        if (client.heartbeatInterval) {
          clearInterval(client.heartbeatInterval);
          client.heartbeatInterval = null;
        }
        if (client.watchdogInterval) {
          clearInterval(client.watchdogInterval);
          client.watchdogInterval = null;
        }

        client.session.isConnected = false;
        client.session.isVoiceConnected = false;

        if (!client.intentionalDisconnect) {
          // Auto-reconnect with exponential backoff
          const timeout = Math.min(30000, 2500 * Math.pow(1.3, Math.min(client.reconnectAttempts, 8)));
          client.reconnectAttempts++;
          this.addLog('info', `Tự động kết nối lại sau ${(timeout / 1000).toFixed(1)} giây (Lần thử ${client.reconnectAttempts})...`, id);
          setTimeout(() => {
            if (!client.intentionalDisconnect) {
              this.initGatewayConnection(client);
            }
          }, timeout);
        }
      });
    } catch (err: any) {
      this.addLog('error', `Không thể tạo WebSocket Gateway: ${err.message}`, id);
    }
  }

  private handleGatewayMessage(client: ActiveClient, rawMessage: string) {
    let packet: any;
    try {
      packet = JSON.parse(rawMessage);
    } catch (e) {
      return;
    }

    const { op, d, s, t } = packet;
    const id = client.session.id;

    if (s !== null && s !== undefined) {
      client.lastSequence = s;
    }

    switch (op) {
      // Op 10: HELLO
      case 10: {
        const heartbeatInterval = d.heartbeat_interval;
        this.addLog('ws', `Nhận Op 10 HELLO. Nhịp tim Heartbeat: ${heartbeatInterval}ms`, id);

        client.heartbeatAckReceived = true;

        // Start heartbeat
        if (client.heartbeatInterval) {
          clearInterval(client.heartbeatInterval);
        }

        // Send first heartbeat with jitter
        const jitter = Math.random() * heartbeatInterval;
        setTimeout(() => {
          this.sendHeartbeat(client);
        }, jitter);

        client.heartbeatInterval = setInterval(() => {
          this.sendHeartbeat(client);
        }, heartbeatInterval);

        // Send IDENTIFY or RESUME
        if (client.sessionId && client.lastSequence !== null) {
          this.addLog('ws', `Thử gửi RESUME cho Session ${client.sessionId}...`, id);
          client.ws?.send(JSON.stringify({
            op: 6,
            d: {
              token: client.session.token,
              session_id: client.sessionId,
              seq: client.lastSequence,
            },
          }));
        } else {
          this.sendIdentify(client);
        }
        break;
      }

      // Op 11: HEARTBEAT_ACK
      case 11: {
        const now = Date.now();
        const ping = client.lastHeartbeatSent > 0 ? now - client.lastHeartbeatSent : 25;
        client.session.ping = ping;
        client.session.lastHeartbeatAck = now;
        client.heartbeatAckReceived = true;
        break;
      }

      // Op 1: HEARTBEAT request from Discord
      case 1: {
        this.sendHeartbeat(client);
        break;
      }

      // Op 7: RECONNECT
      case 7: {
        this.addLog('warn', 'Discord yêu cầu tái kết nối (Op 7 RECONNECT).', id);
        client.ws?.close(4000, 'Op 7 Reconnect requested');
        break;
      }

      // Op 9: INVALID_SESSION
      case 9: {
        const resumable = d === true;
        this.addLog('warn', `Phiên không hợp lệ (Op 9 INVALID_SESSION). Có thể phục hồi: ${resumable}`, id);
        if (!resumable) {
          client.sessionId = null;
          client.lastSequence = null;
        }
        setTimeout(() => {
          this.sendIdentify(client);
        }, 2000);
        break;
      }

      // Op 0: DISPATCH
      case 0: {
        this.handleDispatch(client, t, d);
        break;
      }
    }
  }

  private sendHeartbeat(client: ActiveClient) {
    if (!client.ws || client.ws.readyState !== WebSocket.OPEN) return;

    // Kiểm tra nếu nhịp tim trước chưa được Discord phản hồi Op 11 ACK -> Socket bị Zombie
    if (!client.heartbeatAckReceived) {
      this.addLog(
        'warn',
        `[Chống Treo Bot] Không nhận được Op 11 ACK cho Heartbeat trước đó (Zombie Socket). Đang ngắt kết nối để phục hồi ngay...`,
        client.session.id
      );
      try {
        client.ws.terminate();
      } catch (e) {
        // ignore
      }
      return;
    }

    client.heartbeatAckReceived = false;
    client.lastHeartbeatSent = Date.now();
    try {
      client.ws.send(JSON.stringify({
        op: 1,
        d: client.lastSequence,
      }));
    } catch (err: any) {
      this.addLog('error', `Lỗi khi gửi Heartbeat: ${err.message}`, client.session.id);
    }
  }

  private sendIdentify(client: ActiveClient) {
    if (!client.ws || client.ws.readyState !== WebSocket.OPEN) return;
    const id = client.session.id;
    const deviceType = client.session.deviceType || 'mobile';

    const deviceLabels: Record<DeviceType, string> = {
      mobile: '📱 Điện thoại (Discord Android)',
      ios: '🍏 Điện thoại iPhone (Discord iOS)',
      desktop: '💻 Máy tính (PC / Desktop)',
      web: '🌐 Trình duyệt Web (Chrome)',
    };

    this.addLog('ws', `Gửi IDENTIFY đăng nhập Gateway cho ${client.session.name} [Thiết bị: ${deviceLabels[deviceType]}]...`, id);

    let properties: any;
    if (deviceType === 'mobile') {
      // Chuẩn Discord Android Mobile: Hiện biểu tượng Cái Điện Thoại (📱) xanh lá trên Discord
      properties = {
        os: 'Android',
        browser: 'Discord Android',
        device: 'Discord Android',
        $os: 'Android',
        $browser: 'Discord Android',
        $device: 'Discord Android',
        system_locale: 'vi-VN',
        client_version: '210.0',
        release_channel: 'stable',
      };
    } else if (deviceType === 'ios') {
      // Chuẩn Discord iOS iPhone: Hiện biểu tượng Cái Điện Thoại (🍏📱)
      properties = {
        os: 'iOS',
        browser: 'Discord iOS',
        device: 'iPhone',
        $os: 'iOS',
        $browser: 'Discord iOS',
        $device: 'iPhone',
        system_locale: 'vi-VN',
        client_version: '210.0',
        release_channel: 'stable',
      };
    } else if (deviceType === 'desktop') {
      // Discord Desktop PC
      properties = {
        os: 'Windows',
        browser: 'Discord Client',
        device: '',
        $os: 'Windows',
        $browser: 'Discord Client',
        $device: '',
        system_locale: 'vi-VN',
        client_build_number: 350000,
        release_channel: 'stable',
      };
    } else {
      // Web Browser
      properties = {
        os: 'Windows',
        browser: 'Chrome',
        device: '',
        $os: 'Windows',
        $browser: 'Chrome',
        $device: '',
        system_locale: 'vi-VN',
        browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        browser_version: '131.0.0.0',
        os_version: '10',
        release_channel: 'stable',
        client_build_number: 350000,
      };
    }

    const identifyPayload = {
      op: 2,
      d: {
        token: client.session.token,
        capabilities: 30717,
        properties,
        presence: {
          status: client.session.status || 'online',
          since: null,
          activities: this.buildActivities(client.session),
          afk: false,
        },
        compress: false,
      },
    };

    try {
      client.ws.send(JSON.stringify(identifyPayload));
    } catch (err: any) {
      this.addLog('error', `Lỗi khi gửi Identify: ${err.message}`, id);
    }
  }

  private handleDispatch(client: ActiveClient, eventType: string, eventData: any) {
    const id = client.session.id;

    if (eventType === 'READY') {
      client.sessionId = eventData.session_id;
      client.resumeGatewayUrl = eventData.resume_gateway_url || null;
      client.reconnectAttempts = 0;
      client.session.isConnected = true;
      if (!client.session.uptimeStart) {
        client.session.uptimeStart = Date.now();
      }

      this.addLog('success', `Đăng nhập Gateway Discord thành công! Tài khoản [${client.session.name}] đã Trực tuyến.`, id);

      // Auto start rotating status if configured
      if (client.session.rotatingStatus.enabled && client.session.rotatingStatus.items.length > 0) {
        this.setRotatingStatus(id, client.session.rotatingStatus);
      }

      // Check if voice channel is configured and auto-join
      if (client.session.voice.guildId && client.session.voice.channelId) {
        this.addLog('voice', `Tự động tham gia kênh Voice: ${client.session.voice.channelName || client.session.voice.channelId}...`, id);
        this.sendVoiceStatePayload(client, client.session.voice.guildId, client.session.voice.channelId);
      }
    } else if (eventType === 'RESUMED') {
      this.addLog('success', `Phiên kết nối đã được khôi phục (RESUMED) thành công!`, id);
      client.session.isConnected = true;
    } else if (eventType === 'VOICE_STATE_UPDATE') {
      // If voice state is for this user
      if (eventData.user_id === client.session.id) {
        const channelId = eventData.channel_id;
        if (channelId) {
          if (!client.session.isVoiceConnected) {
            client.session.voiceUptimeStart = Date.now();
          }
          client.session.isVoiceConnected = true;
          client.session.voice.channelId = channelId;
          client.voiceSessionId = eventData.session_id;
          this.addLog('voice', `Tài khoản đã vào phòng Voice ID: ${channelId}`, id);

          // Nếu đã nhận được thông số endpoint từ VOICE_SERVER_UPDATE thì mở socket Voice Gateway ngay
          if (client.voiceServerData) {
            this.connectVoiceWs(client);
          }
        } else {
          // Rời hoặc bị ngắt khỏi voice
          const wasVoice = client.session.isVoiceConnected;
          client.session.isVoiceConnected = false;
          client.session.voiceUptimeStart = null;
          client.voiceSessionId = null;
          this.cleanupVoiceWs(client);

          if (wasVoice) {
            this.addLog('warn', `Tài khoản đã rời phòng Voice.`, id);
            // Throttle autoReconnect: chống bão kết nối liên tục gây crash
            const now = Date.now();
            if (
              client.session.voice.autoReconnect &&
              !client.intentionalDisconnect &&
              client.session.voice.guildId &&
              client.session.voice.channelId &&
              now - (client.lastVoiceConnectAttempt || 0) > 15000
            ) {
              client.lastVoiceConnectAttempt = now;
              this.addLog('voice', `Auto-Reconnect kích hoạt! Đang tự động kết nối lại kênh thoại sau 5 giây...`, id);
              setTimeout(() => {
                try {
                  if (client.session.isConnected && client.session.voice.guildId && client.session.voice.channelId) {
                    this.sendVoiceStatePayload(client, client.session.voice.guildId, client.session.voice.channelId);
                  }
                } catch (e: any) {
                  this.addLog('error', `Lỗi auto-reconnect voice: ${e.message}`, id);
                }
              }, 5000);
            }
          }
        }
      }
    } else if (eventType === 'VOICE_SERVER_UPDATE') {
      this.addLog('voice', `Đã nhận Voice Server endpoint: ${eventData.endpoint}`, id);
      client.voiceServerData = {
        token: eventData.token,
        endpoint: eventData.endpoint,
        guildId: eventData.guild_id,
      };
      if (client.voiceSessionId) {
        this.connectVoiceWs(client);
      }
    } else if (eventType === 'MESSAGE_CREATE') {
      this.handleMessageCreate(client, eventData);
    }
  }

  /**
   * Handle incoming Discord messages for Prefix Commands and AFK Auto-Reply
   */
  private async handleMessageCreate(client: ActiveClient, msg: any) {
    if (!msg || !msg.content) return;
    const authorId = msg.author?.id;
    const isOwner = authorId === client.session.id;
    const prefix = client.session.prefix || process.env.DISCORD_PREFIX || '!';
    const content = (msg.content || '').trim();

    // 0. Tự Động Thả Emoji (Auto-React) khi mục tiêu gửi tin nhắn trong Server
    if (!isOwner && client.autoReactRules && client.autoReactRules.size > 0 && authorId) {
      const guildId = msg.guild_id || undefined;
      for (const rule of client.autoReactRules.values()) {
        const matchUser = rule.targetUserId === authorId;
        const matchGuild = !rule.guildId || rule.guildId === guildId;
        const matchChannel = !rule.channelId || rule.channelId === msg.channel_id;

        if (matchUser && matchGuild && matchChannel) {
          this.addReaction(client, msg.channel_id, msg.id, rule.emoji).catch(() => {});
          this.addLog('info', `[Auto-React] Tự động thả ${rule.emoji} vào tin nhắn của @${msg.author?.username || authorId} tại kênh ${msg.channel_id}`, client.session.id);
        }
      }
    }

    // 1. AFK Auto-Responder: when someone mentions the user or DMs the user
    if (!isOwner && client.session.afk?.enabled && !msg.author?.bot) {
      const isMentioned = msg.mentions?.some((m: any) => m.id === client.session.id);
      const isDM = !msg.guild_id;
      if (isMentioned || isDM) {
        const afkText = `💤 **[Tự Động Trả Lời AFK]** Tôi hiện đang vắng mặt: *${client.session.afk.message}* (Treo 24/7 trên Render Cloud)`;
        await this.sendOrEditMessage(client, msg.channel_id, null, afkText);
        this.addLog('info', `[AFK] Tự động trả lời tin nhắn từ @${msg.author?.username || 'user'} tại kênh ${msg.channel_id}`, client.session.id);
        return;
      }
    }

    // 2. Selfbot Prefix Commands: ONLY executed by the account owner
    if (!isOwner) return;

    if (!content.startsWith(prefix)) return;

    const body = content.slice(prefix.length).trim();
    const parts = body.split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);
    const argsString = args.join(' ').trim();

    this.addLog('info', `[Lệnh Prefix] Thực thi lệnh: ${prefix}${command} ${argsString}`, client.session.id);

    try {
      const handled = await handleExtensiveCommand({
        client,
        msg,
        command,
        args,
        argsString,
        prefix,
        manager: this,
        sendOrEdit: (chId, mId, text) => this.sendOrEditMessage(client, chId, mId, text),
        deleteMessage: (chId, mId) => this.deleteMessage(client, chId, mId),
        addReaction: (chId, mId, emoji) => this.addReaction(client, chId, mId, emoji),
      });

      if (handled) return;
    } catch (cmdErr: any) {
      this.addLog('error', `Lỗi khi xử lý lệnh ${prefix}${command}: ${cmdErr.message}`, client.session.id);
      return;
    }

    switch (command) {
      case 'ping': {
        const ping = client.session.ping || 25;
        const uptime = client.session.uptimeStart
          ? Math.floor((Date.now() - client.session.uptimeStart) / 1000)
          : 0;
        const uptimeMin = Math.floor(uptime / 60);
        const reply = `🏓 **Pong!** \`${ping}ms\` | Gateway: \`Hoạt động\` | Uptime: \`${uptimeMin} phút\` | Host: \`Render.com 24/7 🚀\``;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'help': {
        const p = prefix;
        const helpText = [
          `⚡ **DANH SÁCH LỆNH SELFBOT DISCORD (Tiền tố: \`${p}\`)**`,
          `• \`${p}val [chế_độ]\` : Chuyển ngay sang chơi **VALORANT** (Competitive, Ascendant 3)`,
          `• \`${p}ping\` : Kiểm tra độ trễ Gateway Discord ms`,
          `• \`${p}stream <tiêu đề> [url]\` : Bật Stream Twitch (viền tím Rich Presence)`,
          `• \`${p}play [tên game]\` : Giả lập đang chơi game (mặc định: VALORANT)`,
          `• \`${p}listen <bài hát>\` : Giả lập đang nghe Spotify`,
          `• \`${p}watch <tên phim>\` : Giả lập đang xem video`,
          `• \`${p}status <online|idle|dnd|invisible> [text]\` : Đổi trạng thái`,
          `• \`${p}voice <guild_id> <channel_id>\` : Tự động vào phòng Voice`,
          `• \`${p}leave\` : Rời phòng Voice`,
          `• \`${p}mute\` / \`${p}unmute\` : Bật/tắt mic Voice`,
          `• \`${p}deaf\` / \`${p}undeaf\` : Bật/tắt tai nghe Voice`,
          `• \`${p}afk <lý do>\` : Bật tự động trả lời khi có người ping`,
          `• \`${p}noafk\` : Tắt chế độ AFK`,
          `• \`${p}prefix <ký tự>\` : Đổi tiền tố lệnh (ví dụ: \`${p}prefix .\`)`,
          `• \`${p}info\` : Xem thông tin tài khoản và thời gian hoạt động`,
        ].join('\n');
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, helpText);
        break;
      }

      case 'val':
      case 'valorant': {
        const mode = argsString || 'Competitive (Ranked)';
        this.updatePresence(client.session.id, 'dnd', {
          name: 'VALORANT',
          type: 0,
          details: `In Match - ${mode}`,
          state: 'Ascendant 3 (Score: 11 - 9)',
        }, {
          text: 'Đang leo rank Valorant 🔥',
          emojiName: '🎯',
        });
        const reply = `🎯 Đã chuyển sang trạng thái chơi **VALORANT** 24/7: \`${mode}\` | \`Ascendant 3 - Score 11:9\` 🎮 (DND)`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'stream': {
        const streamTitle = argsString || 'Live Coding Discord Selfbot 24/7';
        const streamUrl = args[1]?.startsWith('http') ? args[1] : 'https://twitch.tv/discord_live_stream';
        this.updatePresence(client.session.id, client.session.status, {
          name: 'Twitch',
          type: 1, // Streaming
          details: streamTitle,
          state: 'Hosting on Render Free Cloud 24/7',
          url: streamUrl,
        });
        const reply = `🟣 Đã chuyển sang trạng thái **Stream Twitch**: \`${streamTitle}\` (Viền tím Rich Presence 24/7 🚀)`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'play': {
        const gameName = argsString || 'VALORANT';
        const isVal = gameName.toUpperCase().includes('VAL');
        this.updatePresence(client.session.id, isVal ? 'dnd' : client.session.status, {
          name: isVal ? 'VALORANT' : gameName,
          type: 0, // Playing
          details: isVal ? 'Competitive (Ascendant 3)' : 'Đang chơi cùng bạn bè',
          state: isVal ? 'In Match (Score: 11 - 9)' : '24/7 AFK Mode',
        }, isVal ? { text: 'Đang leo rank Valorant 🔥', emojiName: '🎯' } : undefined);
        const reply = isVal 
          ? `🎯 Đã chuyển sang trạng thái chơi **VALORANT**: \`Competitive (Ascendant 3 - Score: 11:9)\``
          : `🎮 Đã chuyển sang trạng thái chơi game: **${gameName}**`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'listen': {
        const songName = argsString || 'Lofi Hip Hop - Beats to Relax/Study to';
        this.updatePresence(client.session.id, client.session.status, {
          name: 'Spotify',
          type: 2, // Listening
          details: songName,
          state: 'Lofi Girl',
        });
        const reply = `🎧 Đã chuyển sang nghe nhạc Spotify: **${songName}**`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'watch': {
        const watchName = argsString || 'YouTube Live 24/7';
        this.updatePresence(client.session.id, client.session.status, {
          name: watchName,
          type: 3, // Watching
          details: 'Livestream',
        });
        const reply = `🎬 Đã chuyển sang xem: **${watchName}**`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'status': {
        const targetStatus = (args[0]?.toLowerCase() || 'online') as DiscordStatus;
        const validStatuses: DiscordStatus[] = ['online', 'idle', 'dnd', 'invisible'];
        if (!validStatuses.includes(targetStatus)) {
          await this.sendOrEditMessage(client, msg.channel_id, msg.id, `❌ Trạng thái không hợp lệ! Hãy dùng: \`online\`, \`idle\`, \`dnd\`, hoặc \`invisible\`.`);
          return;
        }
        const customText = args.slice(1).join(' ').trim();
        this.updatePresence(
          client.session.id,
          targetStatus,
          client.session.activity,
          customText ? { text: customText } : client.session.customStatus
        );
        const reply = `✨ Đã đổi trạng thái sang: **${targetStatus.toUpperCase()}** ${customText ? `(${customText})` : ''}`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'voice': {
        if (args.length < 2) {
          await this.sendOrEditMessage(client, msg.channel_id, msg.id, `❌ Cú pháp: \`${prefix}voice <Guild_ID> <Voice_Channel_ID>\``);
          return;
        }
        const [guildId, channelId] = args;
        this.updateVoice(client.session.id, { guildId, channelId });
        const reply = `🔊 Đang kết nối vào phòng Voice \`${channelId}\` (Server: \`${guildId}\`)...`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'leave': {
        this.updateVoice(client.session.id, { channelId: '' });
        const reply = `🔇 Đã ngắt kết nối và rời khỏi phòng Voice.`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'mute':
      case 'unmute': {
        const newMute = command === 'mute';
        this.updateVoice(client.session.id, { selfMute: newMute });
        const reply = `🎙️ Trạng thái Mic phòng Voice: **${newMute ? 'ĐÃ TẮT MIC (Muted)' : 'ĐÃ BẬT MIC (Unmuted)'}**`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'deaf':
      case 'undeaf': {
        const newDeaf = command === 'deaf';
        this.updateVoice(client.session.id, { selfDeaf: newDeaf });
        const reply = `🎧 Trạng thái Tai nghe Voice: **${newDeaf ? 'ĐÃ TẮT TAI NGHE (Deafened)' : 'ĐÃ BẬT TAI NGHE (Undeafened)'}**`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'afk': {
        const reason = argsString || 'Tôi hiện đang bận / AFK, sẽ trả lời sau!';
        this.updateAFK(client.session.id, { enabled: true, message: reason });
        const reply = `💤 Chế độ **AFK Auto-Reply** đã BẬT! Lý do: *${reason}*`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'noafk': {
        this.updateAFK(client.session.id, { enabled: false, message: '' });
        const reply = `👋 Chế độ **AFK** đã TẮT! Chào mừng bạn đã quay lại!`;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'prefix': {
        const newPrefix = args[0]?.trim();
        if (!newPrefix) {
          await this.sendOrEditMessage(client, msg.channel_id, msg.id, `❌ Vui lòng nhập tiền tố mới! Ví dụ: \`${prefix}prefix .\``);
          return;
        }
        this.updatePrefix(client.session.id, newPrefix);
        const reply = `⚙️ Đã đổi tiền tố lệnh thành công sang: \`${newPrefix}\`! Bây giờ hãy gõ: \`${newPrefix}help\``;
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, reply);
        break;
      }

      case 'info': {
        const session = client.session;
        const ping = session.ping || 25;
        const uptime = session.uptimeStart
          ? Math.floor((Date.now() - session.uptimeStart) / 1000)
          : 0;
        const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
        const voiceStr = session.isVoiceConnected
          ? `Kênh ID \`${session.voice.channelId}\` (Uptime: ${session.voiceUptimeStart ? Math.floor((Date.now() - session.voiceUptimeStart) / 60000) + 'm' : '0m'})`
          : 'Không kết nối';

        const infoText = [
          `📊 **THÔNG TIN DISCORD SELFBOT 24/7**`,
          `• Tài khoản: **${session.name}** (@${session.username})`,
          `• ID: \`${session.id}\``,
          `• Tiền tố (Prefix): \`${session.prefix || '!'}\``,
          `• Trạng thái Gateway: **${session.isConnected ? '🟢 Trực tuyến' : '🔴 Ngắt kết nối'}** (Ping: \`${ping}ms\`)`,
          `• Treo Voice: **${voiceStr}**`,
          `• Thời gian hoạt động: \`${uptimeStr}\``,
          `• Nền tảng: **Render.com Cloud 24/7**`,
        ].join('\n');
        await this.sendOrEditMessage(client, msg.channel_id, msg.id, infoText);
        break;
      }

      default:
        break;
    }
  }

  /**
   * Send or edit message in Discord
   */
  private async sendOrEditMessage(client: ActiveClient, channelId: string, messageId: string | null, content: string) {
    if (client.session.id.startsWith('demo-')) {
      this.addLog('info', `[DEMO Chat] ${content}`, client.session.id);
      return;
    }

    try {
      if (messageId) {
        // Try edit the author's message first
        const editRes = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
          method: 'PATCH',
          headers: {
            Authorization: client.session.token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          },
          body: JSON.stringify({ content }),
        });
        if (editRes.ok) return;
        if (editRes.status === 429) {
          const rateData: any = await editRes.json().catch(() => ({}));
          this.addLog('warn', `[Rate Limit Discord] Vui lòng thử lại sau ${rateData?.retry_after || 1}s`, client.session.id);
        }
      }

      // Fallback: send as new message
      const postRes = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: client.session.token,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({ content }),
      });

      if (!postRes.ok && postRes.status !== 429) {
        const errTxt = await postRes.text().catch(() => '');
        this.addLog('warn', `[Gửi tin nhắn Discord lỗi ${postRes.status}] ${errTxt.substring(0, 100)}`, client.session.id);
      }
    } catch (err: any) {
      this.addLog('error', `Lỗi kết nối khi gửi phản hồi lệnh: ${err.message}`, client.session.id);
    }
  }
}

export const discordManager = new DiscordManager();
