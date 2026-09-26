import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Tv, 
  Headphones, 
  Gamepad2, 
  Video, 
  MicOff, 
  VolumeX, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Radio, 
  Play, 
  CheckCircle2, 
  Clock,
  Music,
  Share2,
  Smile
} from 'lucide-react';
import type { AccountSession, DiscordStatus, ActivityConfig } from '../types.js';

interface Props {
  account?: AccountSession;
  onUpdatePresence?: (
    status: DiscordStatus, 
    activity: ActivityConfig, 
    customStatus: { text: string; emojiName?: string }
  ) => Promise<void>;
  onUpdateDevice?: (deviceType: 'mobile' | 'ios' | 'desktop' | 'web') => Promise<void>;
  onPureMobile?: () => Promise<void>;
}

export const DiscordProfilePreview: React.FC<Props> = ({ 
  account, 
  onUpdatePresence,
  onUpdateDevice,
  onPureMobile 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');
  const [simulatedTime, setSimulatedTime] = useState('02:14:35');

  // Elapsed timer ticker for game/streaming
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setSimulatedTime(`${hrs}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Default fallback if no account
  const currentStatus = account?.status || 'online';
  const activity = account?.activity;
  const customStatus = account?.customStatus;
  const isStreaming = activity?.type === 1 || (activity?.name?.toLowerCase().includes('twitch') || !!activity?.url);
  const isListening = activity?.type === 2;
  const isPlaying = activity?.type === 0;
  const isVoiceActive = account?.isVoiceConnected;

  // Preset 1-click preview testing
  const handleQuickStatus = async (status: DiscordStatus) => {
    if (!account || !onUpdatePresence) return;
    try {
      await onUpdatePresence(
        status, 
        account.activity || { name: 'Visual Studio Code', type: 0 }, 
        account.customStatus || { text: 'Treo 24/7 trên Render' }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickValorant = async () => {
    if (!account || !onUpdatePresence) return;
    try {
      await onUpdatePresence(
        'dnd',
        {
          name: 'VALORANT',
          type: 0,
          details: 'Competitive (Ascendant 3)',
          state: 'In Match (Ascent - Score 11 - 9)',
        },
        { text: 'Đang leo rank Valorant 🔥', emojiName: '🎯' }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickStreaming = async () => {
    if (!account || !onUpdatePresence) return;
    try {
      await onUpdatePresence(
        'online',
        {
          name: 'Twitch',
          type: 1,
          details: 'Live Coding Discord Selfbot 24/7',
          state: 'Hosting trên Render Free Cloud',
          url: 'https://twitch.tv/discord_live_stream',
        },
        { text: 'Streaming 24/7 on Twitch 🟣', emojiName: '🎮' }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickSpotify = async () => {
    if (!account || !onUpdatePresence) return;
    try {
      await onUpdatePresence(
        'online',
        {
          name: 'Spotify',
          type: 2,
          details: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
          state: 'Lofi Girl',
          assets: {
            large_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=128&h=128&fit=crop',
            large_text: 'Lofi Beats 24/7',
          }
        },
        { text: 'Vibe lofi cả ngày 🎧', emojiName: '🎧' }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickCoding = async () => {
    if (!account || !onUpdatePresence) return;
    try {
      await onUpdatePresence(
        'idle',
        {
          name: 'Visual Studio Code',
          type: 0,
          details: 'Selfbot Discord Node.js 24/7',
          state: 'Workspace: production-v2',
        },
        { text: 'Coding non-stop 💻', emojiName: '💻' }
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              Xem Trước Hồ Sơ Discord (Live Discord Preview)
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Thời Gian Thực
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Mô phỏng chính xác giao diện profile Discord của bạn hiển thị với bạn bè
            </p>
          </div>
        </div>

        {/* Quick Testing Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Thử nhanh:</span>
          <button
            type="button"
            onClick={async () => {
              if (onPureMobile) {
                await onPureMobile();
              } else if (onUpdatePresence) {
                await onUpdatePresence('online', { name: '', type: 0 }, { text: '' });
              }
            }}
            title="Kích hoạt Treo Điện Thoại Tinh Khiết 24/7 (Không status, không game, icon điện thoại)"
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <span>📱 Treo Phone (Pure)</span>
          </button>

          <button
            type="button"
            onClick={handleQuickValorant}
            title="Kích hoạt trạng thái đang chơi VALORANT trên Discord"
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            🎯 Chơi VALORANT
          </button>

          <button
            type="button"
            onClick={handleQuickStreaming}
            title="Kích hoạt trạng thái Streaming viền tím trên Discord"
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition flex items-center gap-1 cursor-pointer"
          >
            <Tv className="w-3 h-3 text-purple-400" />
            Stream Twitch
          </button>

          <button
            type="button"
            onClick={handleQuickSpotify}
            title="Kích hoạt trạng thái Đang nghe nhạc Spotify"
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
          >
            <Music className="w-3 h-3 text-emerald-400" />
            Spotify
          </button>

          <button
            type="button"
            onClick={handleQuickCoding}
            title="Kích hoạt trạng thái Coding VS Code"
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition flex items-center gap-1 cursor-pointer"
          >
            <Gamepad2 className="w-3 h-3 text-blue-400" />
            VS Code
          </button>
        </div>
      </div>

      {/* DISCORD CARD WRAPPER */}
      <div className="max-w-md mx-auto w-full bg-[#111214] text-slate-200 rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden font-sans select-none">
        {/* Discord Profile Banner */}
        <div className="h-28 w-full bg-gradient-to-r from-[#5865F2] via-[#7958f2] to-[#eb459e] relative">
          {/* Discord Badges Top Right */}
          <div className="absolute top-3 right-3 bg-[#111214]/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
            {/* Nitro badge */}
            <span title="Discord Nitro Subscriber" className="text-pink-400 font-bold text-xs cursor-pointer">
              💎
            </span>
            {/* HypeSquad badge */}
            <span title="HypeSquad Bravery" className="text-purple-400 font-bold text-xs cursor-pointer">
              🛡️
            </span>
            {/* Active Dev badge */}
            <span title="Active Developer" className="text-emerald-400 font-bold text-xs cursor-pointer">
              ⚡
            </span>
          </div>
        </div>

        {/* Discord Avatar & Status Indicator */}
        <div className="px-4 relative pb-4">
          <div className="relative -mt-12 mb-3 inline-block">
            <div className="w-20 h-20 rounded-full border-4 border-[#111214] bg-[#2b2d31] overflow-hidden shadow-lg">
              {account?.avatar ? (
                <img 
                  src={account.avatar} 
                  alt={account.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-slate-200 bg-[#5865F2]">
                  {account?.name ? account.name[0]?.toUpperCase() : 'D'}
                </div>
              )}
            </div>

            {/* Live Discord Status Indicator Dot or Mobile Phone Icon */}
            <div className="absolute -bottom-1 -right-1">
              {isStreaming ? (
                <div 
                  title="Streaming trên Twitch"
                  className="w-5 h-5 rounded-full bg-[#593695] border-2 border-[#111214] flex items-center justify-center shadow-md animate-pulse"
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (account?.deviceType === 'mobile' || account?.deviceType === 'ios') ? (
                /* Authentic Discord Mobile Phone Indicator Badge */
                <div
                  title={`Đang Online bằng ${account?.deviceType === 'ios' ? 'iPhone (iOS)' : 'Điện thoại (Android)'} - Biểu tượng Điện Thoại Discord`}
                  className="w-7 h-7 rounded-full bg-[#111214] flex items-center justify-center shadow-lg border border-emerald-500/40"
                >
                  <div className={`w-3.5 h-[19px] rounded-[3.5px] flex flex-col items-center justify-between p-[1.5px] shadow-sm ${
                    currentStatus === 'online' ? 'bg-[#23a55a]' :
                    currentStatus === 'idle' ? 'bg-[#f0b232]' :
                    currentStatus === 'dnd' ? 'bg-[#f23f43]' : 'bg-[#80848e]'
                  }`}>
                    {/* Top speaker slit */}
                    <div className="w-1.5 h-[1px] bg-[#111214] rounded-full" />
                    {/* Screen cutout */}
                    <div className="w-2.5 h-2.5 bg-[#111214] rounded-[1.5px]" />
                    {/* Home button dot */}
                    <div className="w-1 h-1 rounded-full bg-[#111214]" />
                  </div>
                </div>
              ) : currentStatus === 'online' ? (
                <div 
                  title="Trực tuyến trên Máy tính (PC / Desktop)"
                  className="w-5 h-5 rounded-full bg-[#23a55a] border-2 border-[#111214] shadow-md" 
                />
              ) : currentStatus === 'idle' ? (
                <div 
                  title="Chờ (Idle)"
                  className="w-5 h-5 rounded-full bg-[#f0b232] border-2 border-[#111214] relative shadow-md"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111214] absolute -top-0.5 -left-0.5" />
                </div>
              ) : currentStatus === 'dnd' ? (
                <div 
                  title="Không làm phiền (Do Not Disturb)"
                  className="w-5 h-5 rounded-full bg-[#f23f43] border-2 border-[#111214] flex items-center justify-center shadow-md"
                >
                  <div className="w-2.5 h-0.5 bg-[#111214] rounded-full" />
                </div>
              ) : (
                <div 
                  title="Ẩn danh / Offline"
                  className="w-5 h-5 rounded-full bg-[#80848e] border-2 border-[#111214] flex items-center justify-center shadow-md"
                >
                  <div className="w-2 h-2 rounded-full bg-[#111214]" />
                </div>
              )}
            </div>
          </div>

          {/* User Display Name & Handle */}
          <div className="bg-[#232428] p-4 rounded-xl space-y-3.5 border border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white tracking-wide">
                  {account?.name || 'Tên Người Dùng'}
                </h4>
                {(account?.deviceType === 'mobile' || account?.deviceType === 'ios') && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                    📱 {account.deviceType === 'ios' ? 'iPhone' : 'Điện Thoại 24/7'}
                  </span>
                )}
                {isStreaming && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#593695] text-white uppercase tracking-wider">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#b5bac1] font-mono">
                {account?.username || 'user'}#{account?.discriminator || '0000'}
              </p>
            </div>

            {/* Custom Status with Emoji */}
            {customStatus?.text && (
              <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[#1e1f22] border border-white/5 text-xs text-slate-200">
                <span className="text-sm">{customStatus.emojiName || '💬'}</span>
                <span className="truncate font-medium">{customStatus.text}</span>
              </div>
            )}

            {/* Separator */}
            <div className="h-[1px] bg-white/5" />

            {/* ACTIVITY SECTION (RICH PRESENCE) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] block">
                {isStreaming 
                  ? 'ĐANG PHÁT TRỰC TIẾP TRÊN TWITCH' 
                  : isListening 
                  ? 'ĐANG NGHE SPOTIFY' 
                  : isPlaying 
                  ? 'ĐANG CHƠI TRÒ CHƠI' 
                  : 'HOẠT ĐỘNG (RICH PRESENCE)'}
              </span>

              {/* Streaming View */}
              {isStreaming && (
                <div className="p-3.5 rounded-xl bg-[#593695]/15 border border-[#593695]/30 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#593695] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">
                        {activity?.details || activity?.name || 'Twitch Stream'}
                      </h5>
                      <p className="text-[11px] text-purple-200/90 truncate">
                        {activity?.state || 'Streaming on Twitch'}
                      </p>
                      <p className="text-[10px] text-purple-300/70 font-mono">
                        Thời lượng: {simulatedTime}
                      </p>
                    </div>
                  </div>

                  <a
                    href={activity?.url || 'https://twitch.tv'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 bg-[#593695] hover:bg-[#6c42b5] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Xem Trực Tiếp (Watch Stream)</span>
                  </a>
                </div>
              )}

              {/* Spotify View */}
              {isListening && (
                <div className="p-3.5 rounded-xl bg-[#1db954]/15 border border-[#1db954]/30 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1db954] text-black flex items-center justify-center shrink-0 shadow-md">
                      <Music className="w-5 h-5 font-bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">
                        {activity?.details || 'Bài Hát Yêu Thích'}
                      </h5>
                      <p className="text-[11px] text-emerald-200/90 truncate">
                        bởi {activity?.state || 'Nghệ Sĩ Nổi Tiếng'}
                      </p>
                      {/* Fake Progress Bar */}
                      <div className="pt-1.5 space-y-1">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-[#1db954] rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-emerald-300/70 font-mono">
                          <span>1:42</span>
                          <span>3:28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Playing / Game View */}
              {!isStreaming && !isListening && activity?.name && (
                <div className="p-3.5 rounded-xl bg-[#2b2d31] border border-white/5 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">
                        {activity.name}
                      </h5>
                      {activity.details && (
                        <p className="text-[11px] text-[#b5bac1] truncate">
                          {activity.details}
                        </p>
                      )}
                      {activity.state && (
                        <p className="text-[10px] text-[#80848e] truncate">
                          {activity.state}
                        </p>
                      )}
                      <p className="text-[10px] text-indigo-400 font-mono pt-0.5">
                        Đã chơi: {simulatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VOICE AFK STATUS BOX */}
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] block mb-1.5">
                KÊNH THOẠI DISCORD (VOICE STATUS)
              </span>

              {isVoiceActive ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <h6 className="text-xs font-bold text-emerald-300 truncate">
                          {account?.voice?.channelName || 'Phòng Voice AFK'}
                        </h6>
                      </div>
                      <p className="text-[10px] text-emerald-400/70 truncate">
                        {account?.voice?.guildName || 'Máy Chủ Discord'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    {account?.voice?.selfMute && (
                      <span title="Đang tắt Mic" className="p-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <MicOff className="w-3 h-3" />
                      </span>
                    )}
                    {account?.voice?.selfDeaf && (
                      <span title="Đang tắt Tai Nghe" className="p-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <VolumeX className="w-3 h-3" />
                      </span>
                    )}
                    {account?.voice?.selfVideo && (
                      <span title="Đang bật Camera" className="p-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Video className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5 text-center text-xs text-[#80848e]">
                  Chưa tham gia phòng Voice nào
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
