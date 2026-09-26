export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'invisible';

export type ActivityType = 
  | 0 // Playing
  | 1 // Streaming
  | 2 // Listening
  | 3 // Watching
  | 4 // Custom (handled separately in Discord)
  | 5; // Competing

export interface ActivityConfig {
  name: string;
  type: ActivityType;
  details?: string;
  state?: string;
  url?: string; // Streaming URL (Twitch / YouTube)
  application_id?: string;
  timestamps?: {
    start?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface CustomStatusConfig {
  text: string;
  emojiName?: string;
  emojiId?: string;
}

export interface VoiceConfig {
  guildId: string;
  guildName?: string;
  channelId: string;
  channelName?: string;
  selfMute: boolean;
  selfDeaf: boolean;
  selfVideo: boolean;
  autoReconnect: boolean;
}

export interface RotatingStatusItem {
  id: string;
  text: string;
  activityName: string;
  activityType: ActivityType;
  status: DiscordStatus;
}

export type DeviceType = 'mobile' | 'ios' | 'desktop' | 'web';

export interface AutoReactRule {
  id: string;
  targetUserId: string;
  targetUsername?: string;
  emoji: string;
  guildId?: string;
  guildName?: string;
  channelId?: string;
  createdAt: number;
}

export interface OwOConfig {
  enabled: boolean;
  channelId: string;
  guildId?: string;
  channelName?: string;
  guildName?: string;
  autoHunt: boolean;
  autoBattle: boolean;
  autoPray: boolean;
  prayUser?: string;
  autoDaily: boolean;
  autoCoinflip: boolean;
  coinflipAmount: number;
  autoSlots: boolean;
  slotsAmount: number;
  minDelay: number; // seconds, default 15
  maxDelay: number; // seconds, default 19
  autoSleep: boolean; // periodic pause to avoid bot detection
  sleepAfterMinutes: number; // e.g. 35 mins
  sleepDurationMinutes: number; // e.g. 5 mins
  captchaDetected: boolean;
  captchaMessage?: string;
  captchaDetectedAt?: number;
}

export interface OwOStats {
  huntsCount: number;
  battlesCount: number;
  praysCount: number;
  dailiesCount: number;
  coinflipsCount: number;
  slotsCount: number;
  lastCommandSent?: string;
  lastCommandAt?: number;
  startedAt?: number;
  cowoncyEarned?: number;
}

export interface AccountSession {
  id: string;
  token: string;
  name: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: DiscordStatus;
  deviceType?: DeviceType;
  customStatus?: CustomStatusConfig;
  activity?: ActivityConfig;
  prefix?: string;
  afk?: {
    enabled: boolean;
    message: string;
  };
  rotatingStatus: {
    enabled: boolean;
    intervalSeconds: number;
    items: RotatingStatusItem[];
  };
  voice: VoiceConfig;
  autoReactRules?: AutoReactRule[];
  owoConfig?: OwOConfig;
  owoStats?: OwOStats;
  isConnected: boolean;
  isVoiceConnected: boolean;
  uptimeStart: number | null;
  voiceUptimeStart: number | null;
  ping: number;
  lastHeartbeatAck: number | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number; // 2: GUILD_VOICE, 13: GUILD_STAGE_VOICE
  position: number;
}

export interface LogMessage {
  id: string;
  accountId?: string;
  timestamp: number;
  level: 'info' | 'success' | 'warn' | 'error' | 'ws' | 'voice';
  message: string;
}
