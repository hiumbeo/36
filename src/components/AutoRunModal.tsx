import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Sparkles, 
  Cloud, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Radio, 
  Volume2, 
  Tv, 
  Code, 
  Headphones, 
  Gamepad2, 
  Copy, 
  Check, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import type { DiscordStatus, ActivityConfig, VoiceConfig, DeviceType } from '../types.js';

interface AutoConfigResponse {
  hasEnvToken: boolean;
  maskedToken: string | null;
  defaults: {
    deviceType?: DeviceType;
    status: DiscordStatus;
    customStatus: string;
    customEmoji: string;
    activityName: string;
    activityType: number;
    streamUrl: string;
    guildId: string;
    channelId: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAutoRunSuccess: () => void;
}

export const AutoRunModal: React.FC<Props> = ({ isOpen, onClose, onAutoRunSuccess }) => {
  const [activeMode, setActiveMode] = useState<'instant' | 'render'>('instant');
  const [autoConfig, setAutoConfig] = useState<AutoConfigResponse | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // Instant Run Form State
  const [token, setToken] = useState('');
  const [prefix, setPrefix] = useState('!');
  const [rememberToken, setRememberToken] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<'mobile_pure' | 'twitch' | 'vscode' | 'spotify' | 'gaming'>('mobile_pure');
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [customStatusText, setCustomStatusText] = useState('');
  const [guildId, setGuildId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAutoConfig();
      // Load saved token from localStorage if available
      const saved = localStorage.getItem('discord_selfbot_saved_token');
      if (saved && !token) {
        setToken(saved);
      }
      const savedGuild = localStorage.getItem('discord_selfbot_guild_id');
      if (savedGuild && !guildId) setGuildId(savedGuild);
      const savedChan = localStorage.getItem('discord_selfbot_voice_id');
      if (savedChan && !channelId) setChannelId(savedChan);
    }
  }, [isOpen]);

  const fetchAutoConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const res = await fetch('/api/selfbot/auto-config');
      if (res.ok) {
        const data = await res.json();
        setAutoConfig(data);
      }
    } catch (e) {
      console.error('Failed to fetch auto-config:', e);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(id);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleRunFromEnv = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/selfbot/auto-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi kích hoạt tự chạy');
      }

      if (data.started > 0) {
        setSuccessMsg(`Thành công! Đã tự động kích hoạt và kết nối ${data.started} tài khoản từ biến môi trường.`);
        onAutoRunSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.errors?.[0] || 'Không thể khởi chạy token trong biến môi trường. Vui lòng kiểm tra lại giá trị DISCORD_TOKEN.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsRunning(false);
    }
  };

  const handleInstantRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg('Vui lòng nhập Token Discord của bạn.');
      return;
    }

    setIsRunning(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Activity preset
    let activity: ActivityConfig = {
      name: '',
      type: 0,
    };
    let activeDevType: DeviceType = deviceType;

    if (selectedPreset === 'mobile_pure') {
      activeDevType = 'mobile';
      activity = { name: '', type: 0 };
    } else if (selectedPreset === 'twitch') {
      activity = {
        name: 'Twitch',
        type: 1,
        details: 'Live Coding Discord Selfbot 24/7',
        state: 'Hosting on Render Free Cloud',
        url: 'https://twitch.tv/discord_live_stream',
      };
    } else if (selectedPreset === 'vscode') {
      activity = {
        name: 'Visual Studio Code',
        type: 0,
        details: 'Developing Selfbot AFK 24/7',
        state: 'TypeScript & Express',
      };
    } else if (selectedPreset === 'spotify') {
      activity = {
        name: 'Spotify',
        type: 2,
        details: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        state: 'Lofi Girl',
      };
    } else if (selectedPreset === 'gaming') {
      activity = {
        name: 'VALORANT',
        type: 0,
        details: 'Competitive (Ascendant 3)',
        state: 'In Match (Ascent - Score 11 - 9)',
      };
    }

    const voice: VoiceConfig = {
      guildId: guildId.trim(),
      channelId: channelId.trim(),
      selfMute: true,
      selfDeaf: true,
      selfVideo: false,
      autoReconnect: true,
    };

    try {
      const res = await fetch('/api/selfbot/auto-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          prefix: prefix.trim() || '!',
          deviceType: activeDevType,
          autoConnect: true,
          status: 'online',
          customStatus: selectedPreset === 'mobile_pure' 
            ? { text: '', emojiName: '' } 
            : { text: customStatusText.trim(), emojiName: '⚡' },
          activity,
          voice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi tự động kích hoạt');
      }

      if (rememberToken) {
        localStorage.setItem('discord_selfbot_saved_token', token.trim());
        if (guildId.trim()) localStorage.setItem('discord_selfbot_guild_id', guildId.trim());
        if (channelId.trim()) localStorage.setItem('discord_selfbot_voice_id', channelId.trim());
      } else {
        localStorage.removeItem('discord_selfbot_saved_token');
      }

      setSuccessMsg(`Tuyệt vời! Đã tự lắp token cho tài khoản [${data.session?.name}] và kết nối Gateway thành công.`);
      onAutoRunSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kiểm tra token');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Tự Lắp Token & Tự Chạy Bot 24/7</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Auto-Start
                </span>
              </div>
              <p className="text-xs text-slate-400">Tự động cấu hình, kết nối Discord Gateway và giữ phòng voice liên tục</p>
            </div>
          </div>
          <button
            id="close-autorun-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4 border-b border-slate-800/80 bg-slate-950/40 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('instant')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeMode === 'instant'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Lắp Token & Chạy Ngay (1-Click)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('render')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeMode === 'render'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Tự Chạy Tự Động Trên Render (Không Cần Bật Web)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Message Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Thao tác không thành công</p>
                <p className="mt-0.5 text-slate-300">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: INSTANT 1-CLICK AUTO-RUN */}
          {activeMode === 'instant' && (
            <form onSubmit={handleInstantRun} className="space-y-4">
              {/* Token Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>Nhập Discord Token Của Bạn</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  {localStorage.getItem('discord_selfbot_saved_token') && (
                    <button
                      type="button"
                      onClick={() => setToken(localStorage.getItem('discord_selfbot_saved_token') || '')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      Dán token đã lưu trước đó
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Ví dụ: OTk2Mjk5... (Token bí mật tài khoản Discord của bạn)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  required
                />
              </div>

              {/* Status Preset Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Chọn Kiểu Hoạt Động & Trạng Thái Muốn Treo:
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPreset('mobile_pure');
                      setCustomStatusText('');
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                      selectedPreset === 'mobile_pure'
                        ? 'bg-emerald-950/60 border-emerald-400 text-white ring-2 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-300">📱 Treo Điện Thoại Tinh Khiết 24/7 (Khuyên Dùng)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-semibold">Đúng Yêu Cầu Bạn</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Treo Online liên tục với biểu tượng <b>Cái Điện Thoại (📱)</b>, <b>không status</b> và <b>không hoạt động/game</b> gì cả.
                      </div>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPreset('twitch')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      selectedPreset === 'twitch'
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Tv className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-purple-300">Stream Twitch Tím 🟣</div>
                      <div className="text-[11px] text-slate-400">Viền tím & nút Watch Stream</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPreset('vscode')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      selectedPreset === 'vscode'
                        ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Code className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-blue-300">Visual Studio Code 💻</div>
                      <div className="text-[11px] text-slate-400">Giả lập lập trình 24/7</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPreset('spotify')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      selectedPreset === 'spotify'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Headphones className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">Spotify Chill 🎧</div>
                      <div className="text-[11px] text-slate-400">Nghe nhạc Lofi 24/7</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPreset('gaming')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                      selectedPreset === 'gaming'
                        ? 'bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-rose-300">Chơi VALORANT 🎯</div>
                      <div className="text-[11px] text-slate-400">Competitive (Ascendant 3)</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Status Text */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Dòng Trạng Thái Tuỳ Chỉnh (Custom Status):
                </label>
                <input
                  type="text"
                  value={customStatusText}
                  onChange={(e) => setCustomStatusText(e.target.value)}
                  placeholder="Ví dụ: Treo 24/7 trên Render.com 🚀"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Prefix Command Setup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block">
                    Tiền tố lệnh (Prefix) trong Discord:
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Gõ <code className="text-indigo-300 font-mono">{prefix || '!'}help</code> trong Discord để điều khiển bot từ xa.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="!"
                    className="w-16 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-center text-indigo-300 font-mono text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-1">
                    {['!', '.', '?'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrefix(p)}
                        className={`px-2 py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                          prefix === p
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Voice AFK */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Treo Kênh Thoại Voice 24/7 (Tuỳ chọn):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">ID Server (Guild ID):</span>
                    <input
                      type="text"
                      value={guildId}
                      onChange={(e) => setGuildId(e.target.value)}
                      placeholder="Ví dụ: 1029384756..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">ID Kênh Voice (Channel ID):</span>
                    <input
                      type="text"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      placeholder="Ví dụ: 9876543210..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  * Nhấp chuột phải vào server và phòng voice trong Discord (bật Developer Mode) để sao chép ID.
                </p>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="chk-remember-token"
                  type="checkbox"
                  checked={rememberToken}
                  onChange={(e) => setRememberToken(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700"
                />
                <label htmlFor="chk-remember-token" className="text-xs text-slate-300 cursor-pointer">
                  Lưu token vào trình duyệt để tự động kết nối lại khi mở web
                </label>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isRunning || !token.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xác thực và kết nối Gateway...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      ⚡ TỰ ĐỘNG LẮP TOKEN & CHẠY BOT NGAY
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HOST ON RENDER 24/7 AUTO-RUN */}
          {activeMode === 'render' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Cơ chế Tự Chạy Bot Vĩnh Viễn Không Cần Mở Trình Duyệt:
                </div>
                <p className="leading-relaxed">
                  Khi bạn thêm biến môi trường <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">DISCORD_TOKEN</code> vào Render.com, mỗi khi server Render khởi động hoặc được khởi động lại sau bảo trì, mã nguồn sẽ <strong>tự động lắp token, kết nối Discord Gateway, phát stream Twitch và vào phòng voice ngay lập tức</strong> mà không cần bất kỳ ai phải mở website!
                </p>
              </div>

              {/* Check if Server already has DISCORD_TOKEN */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Trạng thái Biến Môi Trường hiện tại:</span>
                  {isLoadingConfig ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : autoConfig?.hasEnvToken ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ĐÃ CẤU HÌNH TOKEN MÔI TRƯỜNG
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Chưa có DISCORD_TOKEN trong ENV
                    </span>
                  )}
                </div>

                {autoConfig?.hasEnvToken && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 text-xs flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-[11px]">Token đã nhận diện:</div>
                      <div className="font-mono text-emerald-400 font-semibold">{autoConfig.maskedToken}</div>
                    </div>
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={handleRunFromEnv}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Chạy Lại Token Này
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions to add to Render */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200">
                  Các Biến Cần Thêm Vào Render Dashboard &gt; Environment:
                </h4>
                
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-semibold text-indigo-300">DISCORD_TOKEN</div>
                      <div className="text-[11px] text-slate-400">Token Discord bí mật của bạn</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('DISCORD_TOKEN', 'env-tok')}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
                    >
                      {copiedVar === 'env-tok' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-semibold text-indigo-300">DISCORD_GUILD_ID</div>
                      <div className="text-[11px] text-slate-400">ID Server để tự động vào Voice</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('DISCORD_GUILD_ID', 'env-guild')}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
                    >
                      {copiedVar === 'env-guild' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-semibold text-indigo-300">DISCORD_VOICE_CHANNEL_ID</div>
                      <div className="text-[11px] text-slate-400">ID Kênh Voice để tự động treo 24/7</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('DISCORD_VOICE_CHANNEL_ID', 'env-chan')}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
                    >
                      {copiedVar === 'env-chan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunFromEnv}
                  disabled={isRunning}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer flex items-center gap-2"
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Khởi Chạy / Kiểm Tra Lại Token Server
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
