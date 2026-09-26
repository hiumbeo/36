import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Play, 
  Square, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Coins, 
  Swords, 
  Target, 
  Coffee, 
  RefreshCw, 
  ExternalLink, 
  Terminal, 
  Sliders, 
  Hash, 
  Server, 
  Check, 
  Info,
  RotateCcw
} from 'lucide-react';
import type { AccountSession, DiscordGuild, DiscordChannel, OwOConfig, OwOStats } from '../types.js';

interface Props {
  account: AccountSession;
  onRefresh?: () => void;
}

export const OwOController: React.FC<Props> = ({ account, onRefresh }) => {
  const owoConfig = account.owoConfig;
  const owoStats = account.owoStats;

  // Server & Channel selection
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState(owoConfig?.guildId || '');
  const [selectedChannelId, setSelectedChannelId] = useState(owoConfig?.channelId || '');
  const [channelInput, setChannelInput] = useState(owoConfig?.channelId || '');
  const [manualMode, setManualMode] = useState(false);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // Farm features toggles & inputs
  const [autoHunt, setAutoHunt] = useState(owoConfig?.autoHunt ?? true);
  const [autoBattle, setAutoBattle] = useState(owoConfig?.autoBattle ?? true);
  const [autoPray, setAutoPray] = useState(owoConfig?.autoPray ?? true);
  const [prayUser, setPrayUser] = useState(owoConfig?.prayUser || '');
  const [autoDaily, setAutoDaily] = useState(owoConfig?.autoDaily ?? true);
  const [autoCoinflip, setAutoCoinflip] = useState(owoConfig?.autoCoinflip ?? false);
  const [coinflipAmount, setCoinflipAmount] = useState(owoConfig?.coinflipAmount ?? 5);
  const [autoSlots, setAutoSlots] = useState(owoConfig?.autoSlots ?? false);
  const [slotsAmount, setSlotsAmount] = useState(owoConfig?.slotsAmount ?? 5);

  // Anti-ban settings
  const [minDelay, setMinDelay] = useState(owoConfig?.minDelay ?? 15);
  const [maxDelay, setMaxDelay] = useState(owoConfig?.maxDelay ?? 19);
  const [autoSleep, setAutoSleep] = useState(owoConfig?.autoSleep ?? true);
  const [sleepAfterMinutes, setSleepAfterMinutes] = useState(owoConfig?.sleepAfterMinutes ?? 35);
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState(owoConfig?.sleepDurationMinutes ?? 5);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when account updates
  useEffect(() => {
    if (owoConfig) {
      if (owoConfig.guildId) setSelectedGuildId(owoConfig.guildId);
      if (owoConfig.channelId) {
        setSelectedChannelId(owoConfig.channelId);
        setChannelInput(owoConfig.channelId);
      }
      setAutoHunt(owoConfig.autoHunt ?? true);
      setAutoBattle(owoConfig.autoBattle ?? true);
      setAutoPray(owoConfig.autoPray ?? true);
      setPrayUser(owoConfig.prayUser || '');
      setAutoDaily(owoConfig.autoDaily ?? true);
      setAutoCoinflip(owoConfig.autoCoinflip ?? false);
      setCoinflipAmount(owoConfig.coinflipAmount ?? 5);
      setAutoSlots(owoConfig.autoSlots ?? false);
      setSlotsAmount(owoConfig.slotsAmount ?? 5);
      setMinDelay(owoConfig.minDelay ?? 15);
      setMaxDelay(owoConfig.maxDelay ?? 19);
      setAutoSleep(owoConfig.autoSleep ?? true);
      setSleepAfterMinutes(owoConfig.sleepAfterMinutes ?? 35);
      setSleepDurationMinutes(owoConfig.sleepDurationMinutes ?? 5);
    }
  }, [owoConfig]);

  // Load guilds
  useEffect(() => {
    if (account.token && !manualMode) {
      loadGuilds();
    }
  }, [account.id, manualMode]);

  // Load channels when guild changes
  useEffect(() => {
    if (selectedGuildId && !manualMode) {
      loadChannels(selectedGuildId);
    }
  }, [selectedGuildId, manualMode]);

  const loadGuilds = async () => {
    setIsLoadingGuilds(true);
    try {
      const res = await fetch(`/api/selfbot/accounts/${account.id}/guilds`);
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds || []);
      }
    } catch (e) {
      console.error('Failed to load guilds:', e);
    } finally {
      setIsLoadingGuilds(false);
    }
  };

  const loadChannels = async (guildId: string) => {
    setIsLoadingChannels(true);
    try {
      const res = await fetch(`/api/selfbot/accounts/${account.id}/guilds/${guildId}/channels?type=text`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (e) {
      console.error('Failed to load channels:', e);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const handleSaveConfig = async (overrideStart?: boolean) => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const cleanChannelId = channelInput.trim();
      const payload: Partial<OwOConfig> = {
        channelId: cleanChannelId,
        guildId: selectedGuildId || undefined,
        autoHunt,
        autoBattle,
        autoPray,
        prayUser: prayUser.trim(),
        autoDaily,
        autoCoinflip,
        coinflipAmount: Math.max(1, Number(coinflipAmount) || 5),
        autoSlots,
        slotsAmount: Math.max(1, Number(slotsAmount) || 5),
        minDelay: Math.max(13, Number(minDelay) || 15),
        maxDelay: Math.max(Number(minDelay) || 15, Number(maxDelay) || 19),
        autoSleep,
        sleepAfterMinutes: Math.max(5, Number(sleepAfterMinutes) || 35),
        sleepDurationMinutes: Math.max(1, Number(sleepDurationMinutes) || 5),
      };

      const res = await fetch(`/api/selfbot/accounts/${account.id}/owo/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Không thể lưu cấu hình OwO');

      if (overrideStart === true) {
        await handleStartFarm();
      } else {
        setStatusMessage({ type: 'success', text: 'Đã lưu cấu hình cày OwO thành công!' });
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi khi lưu cấu hình' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartFarm = async () => {
    setStatusMessage(null);
    const targetChannel = channelInput.trim();
    if (!targetChannel) {
      setStatusMessage({ type: 'error', text: 'Vui lòng chọn hoặc nhập Kênh Discord để cày OwO trước khi bắt đầu!' });
      return;
    }

    try {
      // First save the channel
      await fetch(`/api/selfbot/accounts/${account.id}/owo/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: targetChannel }),
      });

      const res = await fetch(`/api/selfbot/accounts/${account.id}/owo/start`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: '🚀 Đã kích hoạt Tool cày OwO Bot tự động 24/7!' });
        if (onRefresh) onRefresh();
      } else {
        setStatusMessage({ type: 'error', text: 'Không thể bắt đầu. Vui lòng kiểm tra kênh hoặc giải Captcha nếu có cảnh báo!' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleStopFarm = async () => {
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/selfbot/accounts/${account.id}/owo/stop`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: '⏹️ Đã tạm dừng cày OwO Bot.' });
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleResumeAfterCaptcha = async () => {
    try {
      const res = await fetch(`/api/selfbot/accounts/${account.id}/owo/resume`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: '✅ Đã mở khóa Captcha và tiếp tục chu trình cày OwO an toàn!' });
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleResetStats = async () => {
    if (confirm('Bạn có chắc muốn đặt lại bảng thống kê cày OwO về 0?')) {
      try {
        await fetch(`/api/selfbot/accounts/${account.id}/owo/reset-stats`, { method: 'POST' });
        setStatusMessage({ type: 'success', text: 'Đã đặt lại thống kê về 0.' });
        if (onRefresh) onRefresh();
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message });
      }
    }
  };

  // Quick manual triggers
  const handleQuickCommand = async (cmd: string) => {
    if (!channelInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Chưa có ID kênh để gửi lệnh.' });
      return;
    }
    try {
      const res = await fetch(`/api/selfbot/accounts/${account.id}/owo/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelInput.trim() }),
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Đã gửi lệnh "${cmd}" vào kênh!` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const isRunning = Boolean(owoConfig?.enabled);
  const isCaptcha = Boolean(owoConfig?.captchaDetected);

  return (
    <div className="space-y-6">
      {/* CAPTCHA ALARM BANNER (CRITICAL WARNING) */}
      {isCaptcha && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-100 shadow-xl shadow-rose-950/50 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-200 flex items-center gap-2">
                  <span>🚨 PHÁT HIỆN OWO BOT GỬI CAPTCHA XÁC MINH!</span>
                </h3>
                <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
                  Hệ thống bảo vệ đã <strong>LẬP TỨC DỪNG MỌI LỆNH CÀY</strong> để bảo vệ tài khoản khỏi bị OwO ban. 
                  Vui lòng mở ứng dụng Discord, kiểm tra tin nhắn bot OwO trong server hoặc DM để hoàn thành mã xác minh.
                </p>
                {owoConfig?.captchaMessage && (
                  <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-rose-500/30 font-mono text-xs text-rose-300 break-words">
                    💬 Tin nhắn từ OwO: "{owoConfig.captchaMessage.substring(0, 180)}..."
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResumeAfterCaptcha}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Đã Giải Xong - Tiếp Tục Cày
            </button>
          </div>
        </div>
      )}

      {/* Main Header Card with Status and Quick Toggle */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-100">
                  Tool Chơi & Cày OwO Bot 24/7
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Auto-Farmer v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tự động cày Hunt, Battle, Pray, Daily, Minigame với công nghệ chống ban và phát hiện Captcha an toàn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCaptcha
                    ? 'bg-rose-500 animate-ping'
                    : isRunning
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className="font-medium text-slate-300">
                {isCaptcha
                  ? 'Bị Dừng (Gặp Captcha)'
                  : isRunning
                  ? 'Đang Cày Tự Động'
                  : 'Đang Tạm Dừng'}
              </span>
            </div>

            {isRunning ? (
              <button
                type="button"
                onClick={handleStopFarm}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Dừng Cày
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveConfig(true)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isSaving ? 'Đang Khởi Chạy...' : 'Bắt Đầu Cày OwO'}
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hunts (owoh)</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {owoStats?.huntsCount || 0}
          </div>
          <span className="text-[10px] text-slate-500">Lần săn thú</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Battles (owob)</span>
            <Swords className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {owoStats?.battlesCount || 0}
          </div>
          <span className="text-[10px] text-slate-500">Trận chiến quái</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Prays (owo pray)</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {owoStats?.praysCount || 0}
          </div>
          <span className="text-[10px] text-slate-500">Lần cầu nguyện</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Nhận Daily</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {owoStats?.dailiesCount || 0}
          </div>
          <span className="text-[10px] text-slate-500">Quà hàng ngày</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cờ Bạc (CF/Slot)</span>
            <Coins className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {(owoStats?.coinflipsCount || 0) + (owoStats?.slotsCount || 0)}
          </div>
          <span className="text-[10px] text-slate-500">Lần cược tiền</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cowoncy Nhận</span>
            <button
              type="button"
              onClick={handleResetStats}
              title="Đặt lại bảng thống kê"
              className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <div className="text-lg font-bold text-amber-400 truncate">
            {owoStats?.cowoncyEarned ? owoStats.cowoncyEarned.toLocaleString() : 'Tự cập nhật'}
          </div>
          <span className="text-[10px] text-slate-500">Số dư ước tính</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Channel & General Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Channel Picker */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Kênh Discord Cày OwO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualMode(!manualMode)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                {manualMode ? 'Chọn từ danh sách Server' : 'Nhập ID Kênh Thủ Công'}
              </button>
            </div>

            {!manualMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Guild selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 flex items-center justify-between">
                    <span>1. Chọn Máy Chủ (Server)</span>
                    {isLoadingGuilds && <span className="text-[10px] text-slate-500">Đang tải...</span>}
                  </label>
                  <select
                    value={selectedGuildId}
                    onChange={(e) => {
                      setSelectedGuildId(e.target.value);
                      setSelectedChannelId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Chọn Server chứa Bot OwO --</option>
                    {guilds.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channel selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 flex items-center justify-between">
                    <span>2. Chọn Kênh Text (Channel)</span>
                    {isLoadingChannels && <span className="text-[10px] text-slate-500">Đang tải...</span>}
                  </label>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => {
                      setSelectedChannelId(e.target.value);
                      setChannelInput(e.target.value);
                    }}
                    disabled={!selectedGuildId || isLoadingChannels}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="">-- Chọn kênh để cày --</option>
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">
                  Dán Channel ID hoặc Link Kênh Discord:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={channelInput}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      const match = val.match(/channels\/[0-9]+\/([0-9]+)/);
                      if (match) val = match[1];
                      setChannelInput(val);
                    }}
                    placeholder="Ví dụ: 112233445566778899 hoặc dán link https://discord.com/channels/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {channelInput && (
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Kênh đã chọn: </span>
                  <strong className="text-indigo-300 font-mono">
                    {owoConfig?.channelName ? `#${owoConfig.channelName}` : channelInput}
                  </strong>
                  <span className="text-slate-500 font-mono text-[11px]">({channelInput})</span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Đã cấu hình
                </span>
              </div>
            )}
          </div>

          {/* Farm Modules & Feature Toggles */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Các Tính Năng Cày Tự Động
                </h3>
              </div>
              <span className="text-xs text-slate-500">Chu kỳ an toàn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto Hunt */}
              <label className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    Auto Hunt (owoh)
                  </div>
                  <p className="text-[11px] text-slate-400">Săn thú và động vật kiếm xp</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoHunt}
                  onChange={(e) => setAutoHunt(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              {/* Auto Battle */}
              <label className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-indigo-400" />
                    Auto Battle (owob)
                  </div>
                  <p className="text-[11px] text-slate-400">Chiến đấu quái vật có độ trễ ngẫu nhiên</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoBattle}
                  onChange={(e) => setAutoBattle(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              {/* Auto Pray */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Auto Pray (owo pray)
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPray}
                    onChange={(e) => setAutoPray(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Cầu may mắn mỗi 5 phút một lần</p>
                {autoPray && (
                  <input
                    type="text"
                    value={prayUser}
                    onChange={(e) => setPrayUser(e.target.value)}
                    placeholder="Pray cho ai? (Trống = pray bản thân)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 placeholder:text-slate-600"
                  />
                )}
              </div>

              {/* Auto Daily */}
              <label className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    Auto Daily (owo daily)
                  </div>
                  <p className="text-[11px] text-slate-400">Tự nhận điểm danh mỗi ngày giữ streak</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoDaily}
                  onChange={(e) => setAutoDaily(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              {/* Auto Coinflip */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    Auto Coinflip (owo cf)
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCoinflip}
                    onChange={(e) => setAutoCoinflip(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Tiền cược:</span>
                  <input
                    type="number"
                    min={1}
                    max={50000}
                    value={coinflipAmount}
                    onChange={(e) => setCoinflipAmount(Number(e.target.value))}
                    disabled={!autoCoinflip}
                    className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono disabled:opacity-40"
                  />
                  <span className="text-[11px] text-slate-500">cowoncy</span>
                </div>
              </div>

              {/* Auto Slots */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-pink-500" />
                    Auto Slots (owo s)
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSlots}
                    onChange={(e) => setAutoSlots(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Tiền cược:</span>
                  <input
                    type="number"
                    min={1}
                    max={50000}
                    value={slotsAmount}
                    onChange={(e) => setSlotsAmount(Number(e.target.value))}
                    disabled={!autoSlots}
                    className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono disabled:opacity-40"
                  />
                  <span className="text-[11px] text-slate-500">cowoncy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Anti-Ban, Safety & Quick Manual Actions */}
        <div className="space-y-6">
          {/* Anti-Ban & Human Emulation Settings */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Chống Ban & Giả Lập Người Thật
              </h3>
            </div>

            {/* Delay Range */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex items-center justify-between">
                <span>Khoảng Delay Cooldown:</span>
                <span className="font-mono text-emerald-400 text-xs font-semibold">
                  {minDelay}s - {maxDelay}s (+ Random)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Tối thiểu (giây):</span>
                  <input
                    type="number"
                    min={13}
                    max={30}
                    value={minDelay}
                    onChange={(e) => setMinDelay(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Tối đa (giây):</span>
                  <input
                    type="number"
                    min={minDelay}
                    max={60}
                    value={maxDelay}
                    onChange={(e) => setMaxDelay(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Khuyên dùng 15s - 19s để vừa tối ưu tốc độ vừa không bị OwO rate-limit.
              </p>
            </div>

            {/* Smart Sleep Mode */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">
                  Nghỉ Giải Lao Định Kỳ (Smart Sleep)
                </span>
                <input
                  type="checkbox"
                  checked={autoSleep}
                  onChange={(e) => setAutoSleep(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Tự động dừng nghỉ vài phút sau một khoảng thời gian cày để giả lập người thật rời bàn phím.
              </p>

              {autoSleep && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Cày liên tục (phút):</span>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={sleepAfterMinutes}
                      onChange={(e) => setSleepAfterMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Thời gian nghỉ (phút):</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={sleepDurationMinutes}
                      onChange={(e) => setSleepDurationMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Captcha auto-protection badge */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Bộ Lọc Captcha Khẩn Cấp Luôn BẬT
              </div>
              <p className="text-[11px] text-slate-400">
                Tự động lắng nghe tin nhắn "beep boop", "verify", "captcha", dừng ngay lập tức khi phát hiện.
              </p>
            </div>

            {/* Save Config Button */}
            <button
              type="button"
              onClick={() => handleSaveConfig(false)}
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Cấu Hình'}
            </button>
          </div>

          {/* Quick Manual Actions */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Gửi Lệnh Thủ Công Ngay
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickCommand('owoh')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition font-mono cursor-pointer"
              >
                🏹 owo hunt
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand('owob')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition font-mono cursor-pointer"
              >
                ⚔️ owo battle
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand('owo pray')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition font-mono cursor-pointer"
              >
                🙏 owo pray
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand('owo daily')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition font-mono cursor-pointer"
              >
                🎁 owo daily
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discord Prefix Commands Cheatsheet */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          Điều Khiển Qua Lệnh Chat Discord (Prefix Commands)
        </h4>
        <p className="text-xs text-slate-400">
          Bạn có thể gõ trực tiếp các lệnh này trong Discord để điều khiển tool cày OwO từ xa mà không cần mở web:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-amber-400 font-bold">!owo on</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Bắt đầu cày tự động tại kênh hiện tại</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-rose-400 font-bold">!owo off</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Dừng cày OwO ngay lập tức</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-emerald-400 font-bold">!owo resume</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Mở khóa cày tiếp sau khi giải Captcha</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-indigo-400 font-bold">!owo stats</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Xem chi tiết bảng thống kê cày OwO</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-purple-400 font-bold">!owo delay 15 20</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Chỉnh thời gian cách quãng lệnh</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-amber-400 font-bold">!owo cf 10</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Bật cược Coinflip tự động (cf off để tắt)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
