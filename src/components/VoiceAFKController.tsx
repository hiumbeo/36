import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Headphones, 
  Video, 
  VideoOff, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  Hash, 
  Radio, 
  LogOut, 
  Clock, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { AccountSession, DiscordGuild, DiscordChannel, VoiceConfig } from '../types.js';
import { formatDuration } from '../utils/format.js';

interface Props {
  account: AccountSession;
  onUpdateVoice: (voiceConfig: Partial<VoiceConfig>) => Promise<void>;
}

export const VoiceAFKController: React.FC<Props> = ({ account, onUpdateVoice }) => {
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // Voice settings
  const [manualMode, setManualMode] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState(account.voice.guildId || '');
  const [selectedChannelId, setSelectedChannelId] = useState(account.voice.channelId || '');
  const [selfMute, setSelfMute] = useState(account.voice.selfMute ?? true);
  const [selfDeaf, setSelfDeaf] = useState(account.voice.selfDeaf ?? true);
  const [selfVideo, setSelfVideo] = useState(account.voice.selfVideo ?? false);
  const [autoReconnect, setAutoReconnect] = useState(account.voice.autoReconnect ?? true);

  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sync with account voice props
  useEffect(() => {
    setSelectedGuildId(account.voice.guildId || '');
    setSelectedChannelId(account.voice.channelId || '');
    setSelfMute(account.voice.selfMute ?? true);
    setSelfDeaf(account.voice.selfDeaf ?? true);
    setSelfVideo(account.voice.selfVideo ?? false);
    setAutoReconnect(account.voice.autoReconnect ?? true);
  }, [account.id, account.voice]);

  // Fetch guilds when account is active
  useEffect(() => {
    if (account.token && !manualMode) {
      loadGuilds();
    }
  }, [account.id, manualMode]);

  // Fetch channels when guild selected
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
      const res = await fetch(`/api/selfbot/accounts/${account.id}/guilds/${guildId}/channels`);
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

  const handleJoinVoice = async () => {
    if (!selectedGuildId || !selectedChannelId) {
      alert('Vui lòng chọn hoặc nhập Guild ID và Voice Channel ID');
      return;
    }

    setIsUpdating(true);
    try {
      const guildObj = guilds.find((g) => g.id === selectedGuildId);
      const chanObj = channels.find((c) => c.id === selectedChannelId);

      await onUpdateVoice({
        guildId: selectedGuildId,
        guildName: guildObj?.name || account.voice.guildName || 'Discord Server',
        channelId: selectedChannelId,
        channelName: chanObj?.name || account.voice.channelName || 'Kênh Thoại',
        selfMute,
        selfDeaf,
        selfVideo,
        autoReconnect,
      });

      setActionSuccess('Đã gửi lệnh tham gia kênh thoại!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi vào voice');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeaveVoice = async () => {
    setIsUpdating(true);
    try {
      await onUpdateVoice({
        guildId: selectedGuildId,
        channelId: '',
        channelName: '',
      });
      setSelectedChannelId('');
      setActionSuccess('Đã rời kênh thoại');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi rời voice');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickToggle = async (key: 'mute' | 'deaf' | 'video' | 'auto') => {
    let newMute = selfMute;
    let newDeaf = selfDeaf;
    let newVideo = selfVideo;
    let newAuto = autoReconnect;

    if (key === 'mute') {
      newMute = !selfMute;
      setSelfMute(newMute);
    } else if (key === 'deaf') {
      newDeaf = !selfDeaf;
      setSelfDeaf(newDeaf);
    } else if (key === 'video') {
      newVideo = !selfVideo;
      setSelfVideo(newVideo);
    } else if (key === 'auto') {
      newAuto = !autoReconnect;
      setAutoReconnect(newAuto);
    }

    if (account.isVoiceConnected) {
      await onUpdateVoice({
        selfMute: newMute,
        selfDeaf: newDeaf,
        selfVideo: newVideo,
        autoReconnect: newAuto,
      });
    }
  };

  const isConnectedToVoice = account.isVoiceConnected && Boolean(account.voice.channelId);

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            Treo Phòng Thoại Voice 24/7 AFK
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tự động giữ kết nối liên tục trong kênh thoại Discord không bị ngắt quãng, tự động vào lại khi bị kick/move
          </p>
        </div>

        {/* Manual ID mode toggle */}
        <button
          id="btn-toggle-manual-voice-mode"
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 self-start sm:self-auto"
        >
          {manualMode ? 'Dùng danh sách tự động' : 'Nhập ID thủ công'}
        </button>
      </div>

      {/* Connected Voice Banner if active */}
      {isConnectedToVoice ? (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 relative">
              <Radio className="w-6 h-6 animate-pulse text-indigo-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-100">
                  {account.voice.channelName || `Kênh ID: ${account.voice.channelId}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Đang treo AFK 24/7
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span>Máy chủ: {account.voice.guildName || account.voice.guildId}</span>
                <span className="flex items-center gap-1 font-mono text-indigo-300">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  {formatDuration(account.voiceUptimeStart)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-leave-voice"
              type="button"
              disabled={isUpdating}
              onClick={handleLeaveVoice}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Rời phòng Voice
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-slate-400 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Tài khoản hiện chưa tham gia phòng voice nào. Chọn máy chủ và kênh thoại bên dưới để bắt đầu treo.</span>
        </div>
      )}

      {/* Guild & Channel Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Guild Selection */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            Máy chủ Discord (Guild Server)
          </label>

          {manualMode ? (
            <input
              id="input-guild-id-manual"
              type="text"
              value={selectedGuildId}
              onChange={(e) => setSelectedGuildId(e.target.value.trim())}
              placeholder="Dán Server (Guild) ID (ví dụ: 123456789...)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <div className="relative">
              <select
                id="select-guild-dropdown"
                value={selectedGuildId}
                onChange={(e) => {
                  setSelectedGuildId(e.target.value);
                  setSelectedChannelId('');
                }}
                disabled={isLoadingGuilds}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">-- Chọn Server bạn đã tham gia --</option>
                {guilds.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.id})
                  </option>
                ))}
              </select>
              {isLoadingGuilds && (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3 top-3 pointer-events-none" />
              )}
            </div>
          )}
        </div>

        {/* Channel Selection */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
            Kênh Thoại (Voice Channel)
          </label>

          {manualMode ? (
            <input
              id="input-channel-id-manual"
              type="text"
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value.trim())}
              placeholder="Dán Voice Channel ID (ví dụ: 987654321...)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <div className="relative">
              <select
                id="select-channel-dropdown"
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                disabled={isLoadingChannels || !selectedGuildId}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {selectedGuildId ? '-- Chọn Kênh Thoại Voice --' : '-- Chọn Server trước --'}
                </option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    🔊 {c.name} {c.type === 13 ? '(Stage)' : ''}
                  </option>
                ))}
              </select>
              {isLoadingChannels && (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3 top-3 pointer-events-none" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Voice Options Toggles */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Tùy chọn trạng thái Microphone & Audio
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Self Mute */}
          <button
            type="button"
            onClick={() => handleQuickToggle('mute')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              selfMute
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {selfMute ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span className="text-xs font-medium">{selfMute ? 'Tắt Mic (Mute)' : 'Bật Mic'}</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${selfMute ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
              {selfMute ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Self Deaf */}
          <button
            type="button"
            onClick={() => handleQuickToggle('deaf')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              selfDeaf
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Headphones className={`w-4 h-4 ${selfDeaf ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-xs font-medium">{selfDeaf ? 'Tắt Tai Nghe (Deaf)' : 'Nghe tiếng'}</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${selfDeaf ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
              {selfDeaf ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Fake Video */}
          <button
            type="button"
            onClick={() => handleQuickToggle('video')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              selfVideo
                ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {selfVideo ? <Video className="w-4 h-4 text-indigo-400" /> : <VideoOff className="w-4 h-4 text-slate-500" />}
              <span className="text-xs font-medium">Bật Camera (Fake)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${selfVideo ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
              {selfVideo ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Auto Reconnect */}
          <button
            type="button"
            onClick={() => handleQuickToggle('auto')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              autoReconnect
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-4 h-4 ${autoReconnect ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-xs font-medium">Auto-Reconnect</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${autoReconnect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {autoReconnect ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Kênh voice được duy trì liên tục qua Gateway Heartbeat packets 24/7.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {actionSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {actionSuccess}
            </span>
          )}

          <button
            id="btn-join-voice-submit"
            type="button"
            disabled={isUpdating || !selectedGuildId || !selectedChannelId}
            onClick={handleJoinVoice}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                {isConnectedToVoice ? 'Cập Nhật Kênh Thoại' : 'Vào Kênh Thoại Treo 24/7'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
