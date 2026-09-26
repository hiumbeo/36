import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  Video, 
  Headphones, 
  Eye, 
  Trophy, 
  Repeat, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Save, 
  Radio,
  Smile,
  Smartphone,
  Monitor,
  Globe,
  Apple,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import type { AccountSession, DiscordStatus, ActivityType, RotatingStatusItem, DeviceType } from '../types.js';
import { getActivityTypeLabel } from '../utils/format.js';

interface Props {
  account: AccountSession;
  onUpdatePresence: (
    status: DiscordStatus,
    activity: any,
    customStatus: { text: string; emojiName?: string }
  ) => Promise<void>;
  onUpdateRotatingStatus: (
    enabled: boolean,
    intervalSeconds: number,
    items: RotatingStatusItem[]
  ) => Promise<void>;
  onUpdateDevice?: (deviceType: DeviceType) => Promise<void>;
  onPureMobile?: () => Promise<void>;
}

export const StatusController: React.FC<Props> = ({
  account,
  onUpdatePresence,
  onUpdateRotatingStatus,
  onUpdateDevice,
  onPureMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'presence' | 'rotating'>('presence');
  const [deviceType, setDeviceType] = useState<DeviceType>(account.deviceType || 'mobile');
  const [status, setStatus] = useState<DiscordStatus>(account.status || 'online');
  const [customText, setCustomText] = useState(account.customStatus?.text || '');
  const [emojiName, setEmojiName] = useState(account.customStatus?.emojiName || '⚡');
  
  // Activity state
  const [activityName, setActivityName] = useState(account.activity?.name || 'Visual Studio Code');
  const [activityType, setActivityType] = useState<ActivityType>(account.activity?.type ?? 0);
  const [activityDetails, setActivityDetails] = useState(account.activity?.details || 'Treo Status & Voice 24/7');
  const [activityState, setActivityState] = useState(account.activity?.state || 'Workspace Active');
  const [streamingUrl, setStreamingUrl] = useState(account.activity?.url || 'https://twitch.tv/discord');
  const [largeImage, setLargeImage] = useState(account.activity?.assets?.large_image || '');
  const [largeText, setLargeText] = useState(account.activity?.assets?.large_text || '');
  const [smallImage, setSmallImage] = useState(account.activity?.assets?.small_image || '');
  const [smallText, setSmallText] = useState(account.activity?.assets?.small_text || '');
  const [applicationId, setApplicationId] = useState(account.activity?.application_id || '');

  // Rotating Status state
  const [rotationEnabled, setRotationEnabled] = useState(account.rotatingStatus?.enabled || false);
  const [rotationInterval, setRotationInterval] = useState(account.rotatingStatus?.intervalSeconds || 15);
  const [rotationItems, setRotationItems] = useState<RotatingStatusItem[]>(
    account.rotatingStatus?.items && account.rotatingStatus.items.length > 0
      ? account.rotatingStatus.items
      : [
          {
            id: '1',
            text: 'Treo acc 24/7 online',
            activityName: 'Visual Studio Code',
            activityType: 0,
            status: 'online',
          },
          {
            id: '2',
            text: 'Đang phát sóng trực tiếp',
            activityName: 'Twitch Live Stream',
            activityType: 1,
            status: 'online',
          },
          {
            id: '3',
            text: 'Chilling in voice room ☕',
            activityName: 'Spotify',
            activityType: 2,
            status: 'idle',
          },
        ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when selected account changes
  useEffect(() => {
    setDeviceType(account.deviceType || 'mobile');
    setStatus(account.status || 'online');
    setCustomText(account.customStatus?.text || '');
    setEmojiName(account.customStatus?.emojiName || '⚡');
    setActivityName(account.activity?.name || '');
    setActivityType(account.activity?.type ?? 0);
    setActivityDetails(account.activity?.details || '');
    setActivityState(account.activity?.state || '');
    setStreamingUrl(account.activity?.url || 'https://twitch.tv/discord');
    setLargeImage(account.activity?.assets?.large_image || '');
    setLargeText(account.activity?.assets?.large_text || '');
    setSmallImage(account.activity?.assets?.small_image || '');
    setSmallText(account.activity?.assets?.small_text || '');
    setApplicationId(account.activity?.application_id || '');
    setRotationEnabled(account.rotatingStatus?.enabled || false);
    setRotationInterval(account.rotatingStatus?.intervalSeconds || 15);
    if (account.rotatingStatus?.items && account.rotatingStatus.items.length > 0) {
      setRotationItems(account.rotatingStatus.items);
    }
  }, [account.id, account.deviceType, account.activity]);

  const handleDeviceSelect = async (type: DeviceType) => {
    setDeviceType(type);
    if (onUpdateDevice) {
      try {
        await onUpdateDevice(type);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi cập nhật thiết bị');
      }
    }
  };

  const handlePureMobileMode = async () => {
    setStatus('online');
    setDeviceType('mobile');
    setCustomText('');
    setEmojiName('');
    setActivityName('');
    setActivityType(0);
    setActivityDetails('');
    setActivityState('');
    setStreamingUrl('');
    setLargeImage('');
    setLargeText('');
    setSmallImage('');
    setSmallText('');
    setApplicationId('');
    setRotationEnabled(false);

    if (onPureMobile) {
      setIsSaving(true);
      try {
        await onPureMobile();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi kích hoạt chế độ treo điện thoại');
      } finally {
        setIsSaving(false);
      }
    } else {
      await handleApplyPresence();
    }
  };

  const handleApplyPresence = async () => {
    setIsSaving(true);
    try {
      await onUpdatePresence(
        status,
        {
          name: activityName,
          type: activityType,
          details: activityDetails,
          state: activityState,
          url: activityType === 1 ? streamingUrl : undefined,
          application_id: applicationId.trim() || undefined,
          assets: (largeImage.trim() || smallImage.trim()) ? {
            large_image: largeImage.trim() || undefined,
            large_text: largeText.trim() || undefined,
            small_image: smallImage.trim() || undefined,
            small_text: smallText.trim() || undefined,
          } : undefined,
        },
        {
          text: customText,
          emojiName,
        }
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyRotation = async () => {
    setIsSaving(true);
    try {
      await onUpdateRotatingStatus(rotationEnabled, rotationInterval, rotationItems);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu cài đặt đổi trạng thái');
    } finally {
      setIsSaving(false);
    }
  };

  const addRotationItem = () => {
    const newItem: RotatingStatusItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: 'Trạng thái mới ' + (rotationItems.length + 1),
      activityName: 'Discord Selfbot',
      activityType: 0,
      status: 'online',
    };
    setRotationItems([...rotationItems, newItem]);
  };

  const removeRotationItem = (id: string) => {
    setRotationItems(rotationItems.filter((i) => i.id !== id));
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'pure_mobile' | 'vscode' | 'streaming' | 'spotify' | 'soundcloud' | 'gaming') => {
    if (preset === 'pure_mobile') {
      handlePureMobileMode();
      return;
    }
    if (preset === 'vscode') {
      setStatus('online');
      setCustomText('Coding mode on 💻');
      setEmojiName('💻');
      setActivityName('Visual Studio Code');
      setActivityType(0);
      setActivityDetails('Writing TypeScript & React');
      setActivityState('Workspace: Selfbot');
    } else if (preset === 'streaming') {
      setStatus('online');
      setCustomText('🔴 Live on Twitch');
      setEmojiName('🔴');
      setActivityName('Twitch');
      setActivityType(1);
      setActivityDetails('🔴 STREAMING LIVE 24/7');
      setActivityState('Playing with viewers');
      setStreamingUrl('https://twitch.tv/discord');
    } else if (preset === 'spotify') {
      setStatus('idle');
      setCustomText('Listening to Chill Lofi 🎧');
      setEmojiName('🎧');
      setActivityName('Spotify');
      setActivityType(2);
      setActivityDetails('Lofi Beats - Sleep / Chill');
      setActivityState('Various Artists');
    } else if (preset === 'soundcloud') {
      setStatus('idle');
      setCustomText('Nghe nhạc SoundCloud 🎧');
      setEmojiName('🟠');
      setActivityName('SoundCloud');
      setActivityType(2);
      setActivityDetails('Top Trending Tracks');
      setActivityState('SoundCloud 24/7 Music Stream');
    } else if (preset === 'gaming') {
      setStatus('dnd');
      setCustomText('Do Not Disturb - In Match 🔥');
      setEmojiName('🎮');
      setActivityName('VALORANT');
      setActivityType(0);
      setActivityDetails('Competitive - Ascent');
      setActivityState('Score 11 - 9 (Ascendant 3)');
      setApplicationId('700136079562375218');
      setLargeImage('https://images.contentstack.io/v3/assets/blt3706121367b58f95/blt0ebffbc004c00030/644a86b1f24d1a49ab500e52/VALORANT_Jett_Red.jpg');
      setLargeText('VALORANT');
      setSmallImage('https://cdn.discordapp.com/app-assets/700136079562375218/700140810141696071.png');
      setSmallText('Ascendant 3');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Cài Đặt Trạng Thái & Rich Presence
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tùy biến Online, Icon Điện Thoại (📱), Hoạt động chơi game, Stream Twitch hoặc đổi Status tự động
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-static-presence"
            type="button"
            onClick={() => setActiveTab('presence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'presence'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trạng thái cố định
          </button>
          <button
            id="tab-rotating-presence"
            type="button"
            onClick={() => setActiveTab('rotating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rotating'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Đổi Status tự động
          </button>
        </div>
      </div>

      {activeTab === 'presence' ? (
        <div className="space-y-6">
          {/* BANNER ĐẶC BIỆT: CHỌN BIỂU TƯỢNG THIẾT BỊ DISCORD (DEVICE BADGE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Biểu Tượng Thiết Bị Hiển Thị Trên Discord (Device Badge)
                  </label>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Đang chọn: <b className="text-emerald-400 font-semibold">{deviceType === 'mobile' ? '📱 Điện Thoại (Discord Android)' : deviceType === 'ios' ? '🍏 iPhone (Discord iOS)' : deviceType === 'desktop' ? '💻 Máy Tính (PC)' : '🌐 Trình Duyệt Web'}</b>
                  <span className="text-slate-400 text-[11px] block sm:inline sm:ml-2">
                    {deviceType === 'mobile' || deviceType === 'ios' ? '• Bạn bè sẽ thấy icon Cái Điện Thoại 📱 cạnh Avatar!' : '• Bạn bè sẽ thấy chấm tròn máy tính thông thường.'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={handlePureMobileMode}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto border border-emerald-400/30"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
                ⚡ 1-Click Treo Điện Thoại Tinh Khiết
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleDeviceSelect('mobile')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'mobile'
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40 text-white shadow-lg'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Điện thoại 📱
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">Discord Android (Chuẩn)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDeviceSelect('ios')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'ios'
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40 text-white shadow-lg'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                  <Apple className="w-4 h-4 text-slate-300" />
                  iPhone iOS 🍏
                </div>
                <div className="text-[10px] text-slate-400">Discord iOS Badge</div>
              </button>

              <button
                type="button"
                onClick={() => handleDeviceSelect('desktop')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'desktop'
                    ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/40 text-white shadow-lg'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                  <Monitor className="w-4 h-4 text-slate-300" />
                  Máy tính PC 💻
                </div>
                <div className="text-[10px] text-slate-400">Desktop Client</div>
              </button>

              <button
                type="button"
                onClick={() => handleDeviceSelect('web')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'web'
                    ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/40 text-white shadow-lg'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                  <Globe className="w-4 h-4 text-slate-300" />
                  Trình duyệt 🌐
                </div>
                <div className="text-[10px] text-slate-400">Web Chrome</div>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Mẫu cấu hình nhanh (1-Click Presets)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset('pure_mobile')}
                className="px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-bold text-xs text-emerald-300 flex items-center gap-1">
                  <span>📱 ĐT Tinh Khiết</span>
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">Không status / game</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('vscode')}
                className="px-3 py-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300">💻 VS Code Coder</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Lập trình viên AFK</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('streaming')}
                className="px-3 py-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-semibold text-xs text-purple-300">🟣 Streamer 24/7</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Badge tím Twitch</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('spotify')}
                className="px-3 py-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-semibold text-xs text-emerald-300">🎧 Spotify Chill</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Nghe nhạc Lofi</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('soundcloud')}
                className="px-3 py-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-semibold text-xs text-amber-400">🟠 SoundCloud 24/7</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Phát nhạc trực tuyến</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gaming')}
                className="px-3 py-2 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-semibold text-xs text-rose-300">🔥 Valorant Gaming</div>
                <div className="text-[10px] text-slate-500 mt-0.5">DND Đang thi đấu</div>
              </button>
            </div>
          </div>

          {/* Discord Online Status Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Chế độ hiển thị trực tuyến
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'online', name: 'Trực tuyến', desc: 'Online xanh lá', dot: 'bg-emerald-500' },
                { id: 'idle', name: 'Chờ vắng mặt', desc: 'Idle mặt trăng vàng', dot: 'bg-amber-500' },
                { id: 'dnd', name: 'Không làm phiền', desc: 'DND đỏ tròn', dot: 'bg-rose-500' },
                { id: 'invisible', name: 'Ẩn danh', desc: 'Offline vô hình', dot: 'bg-slate-500' },
              ].map((item) => {
                const isCurrent = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id as DiscordStatus)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${item.dot}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-indigo-400" />
                Emoji biểu cảm
              </label>
              <input
                id="input-status-emoji"
                type="text"
                value={emojiName}
                onChange={(e) => setEmojiName(e.target.value)}
                placeholder="⚡"
                maxLength={4}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-center text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Dòng trạng thái tùy chỉnh (Custom Status Text)
              </label>
              <input
                id="input-status-text"
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Ví dụ: Treo Voice 24/7 | Đang code bot..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Rich Presence Activity Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                Hoạt Động Chi Tiết (Rich Activity)
              </label>
              <span className="text-[10px] text-slate-500">Hiển thị trong hồ sơ Discord</span>
            </div>

            {/* Activity Type Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: 0, label: 'Đang chơi', icon: Gamepad2 },
                { type: 1, label: 'Đang phát sóng', icon: Video, color: 'text-purple-400' },
                { type: 2, label: 'Đang nghe', icon: Headphones },
                { type: 3, label: 'Đang xem', icon: Eye },
                { type: 5, label: 'Đang thi đấu', icon: Trophy },
              ].map((act) => {
                const Icon = act.icon;
                const isCurrent = activityType === act.type;
                return (
                  <button
                    key={act.type}
                    type="button"
                    onClick={() => setActivityType(act.type as ActivityType)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${act.color || ''}`} />
                    <span className="truncate">{act.label}</span>
                  </button>
                );
              })}
            </div>

            {/* If streaming selected, show URL input */}
            {activityType === 1 && (
              <div>
                <label className="text-xs font-medium text-purple-300 block mb-1">
                  Twitch / YouTube Stream URL (Bắt buộc để kích hoạt Badge tím)
                </label>
                <input
                  id="input-stream-url"
                  type="url"
                  value={streamingUrl}
                  onChange={(e) => setStreamingUrl(e.target.value)}
                  placeholder="https://www.twitch.tv/discord"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-purple-500/40 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Activity Name & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tên hoạt động / Ứng dụng
                </label>
                <input
                  id="input-activity-name"
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Ví dụ: Visual Studio Code, Valorant..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Chi tiết (Details)
                </label>
                <input
                  id="input-activity-details"
                  type="text"
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  placeholder="Ví dụ: Editing server.ts..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Trạng thái hoạt động (State)
              </label>
              <input
                id="input-activity-state"
                type="text"
                value={activityState}
                onChange={(e) => setActivityState(e.target.value)}
                placeholder="Ví dụ: Workspace: Discord Selfbot (Line 42)"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* HÌNH ẢNH CHƠI GAME & RICH PRESENCE ASSETS */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  Hình Ảnh Chơi Game (Game Artwork & Rich Presence Image)
                </label>
                <span className="text-[11px] text-slate-400">
                  Hiển thị ảnh bìa game thật + Huy hiệu rank trên Profile
                </span>
              </div>

              {/* Quick Game Artwork Presets */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  Chọn nhanh ảnh bìa game nổi tiếng:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    {
                      name: 'Valorant',
                      img: 'https://images.contentstack.io/v3/assets/blt3706121367b58f95/blt0ebffbc004c00030/644a86b1f24d1a49ab500e52/VALORANT_Jett_Red.jpg',
                      small: 'https://cdn.discordapp.com/app-assets/700136079562375218/700140810141696071.png',
                      appId: '700136079562375218',
                      details: 'Competitive - Ascent',
                      state: 'Score 11 - 9 (Ascendant 3)',
                      emoji: '🎯',
                      custom: 'Đang leo rank Valorant 🔥',
                    },
                    {
                      name: 'League of Legends',
                      img: 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt1259b14b3d1b1f38/5db05fa80cdae30bb7375d34/RiotX_Spellteller_Disclaimer_1920x1080.jpg',
                      small: 'https://cdn.discordapp.com/app-assets/356869127241072640/731174987624349767.png',
                      appId: '356869127241072640',
                      details: 'Ranked Solo/Duo',
                      state: 'Summoner\'s Rift (24:12)',
                      emoji: '⚔️',
                      custom: 'Leo rank Thách Đấu LMHT ⚔️',
                    },
                    {
                      name: 'Counter-Strike 2',
                      img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
                      small: 'https://cdn.discordapp.com/app-assets/1016765793448378418/1156994784406208573.png',
                      appId: '1016765793448378418',
                      details: 'Premier Match - Mirage',
                      state: 'Competitive (Score 12 - 8)',
                      emoji: '💣',
                      custom: 'CS2 Premier Clutch 🔥',
                    },
                    {
                      name: 'Minecraft',
                      img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg',
                      small: '',
                      appId: '432980957394370572',
                      details: 'Hardcore Survival World',
                      state: 'Building Mega Base (Day 342)',
                      emoji: '⛏️',
                      custom: 'Minecraft Hardcore ⛏️',
                    },
                    {
                      name: 'Grand Theft Auto V',
                      img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
                      small: '',
                      appId: '356875221078245376',
                      details: 'FiveM Vietnam Roleplay',
                      state: 'Los Santos City (Online)',
                      emoji: '🚗',
                      custom: 'GTA V Roleplay 🚗',
                    },
                    {
                      name: 'Genshin Impact',
                      img: 'https://fastcdn.hoyoverse.com/content-v2/hk4e/122049/236166ec7135e5a2db12be21711fbab7_8368565127021482937.png',
                      small: '',
                      appId: '762434991303950386',
                      details: 'AR 60 - Spiral Abyss',
                      state: 'Floor 12-3 (Full 36 Stars)',
                      emoji: '🌠',
                      custom: 'Genshin Impact 🌠',
                    },
                  ].map((game) => (
                    <button
                      key={game.name}
                      type="button"
                      onClick={() => {
                        setActivityName(game.name);
                        setActivityType(0);
                        setActivityDetails(game.details);
                        setActivityState(game.state);
                        setLargeImage(game.img);
                        setLargeText(game.name);
                        setSmallImage(game.small);
                        setSmallText(game.small ? 'Rank Badge' : '');
                        setApplicationId(game.appId);
                        setCustomText(game.custom);
                        setEmojiName(game.emoji);
                      }}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition flex items-center gap-2 group cursor-pointer"
                    >
                      <img
                        src={game.img}
                        alt={game.name}
                        className="w-7 h-7 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white truncate">
                        {game.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Image & Small Image Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Large Image URL & Tooltip */}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center justify-between">
                      <span>URL Ảnh bìa chính (Large Image URL)</span>
                      {largeImage && (
                        <span className="text-[10px] text-emerald-400 font-normal">Đã có ảnh bìa</span>
                      )}
                    </label>
                    <div className="flex gap-2 items-center">
                      {largeImage ? (
                        <img
                          src={largeImage}
                          alt="Large preview"
                          className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-900"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <input
                        type="url"
                        value={largeImage}
                        onChange={(e) => setLargeImage(e.target.value)}
                        placeholder="https://... ảnh bìa game (JPG/PNG)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Chú thích ảnh chính (Tooltip hover)
                    </label>
                    <input
                      type="text"
                      value={largeText}
                      onChange={(e) => setLargeText(e.target.value)}
                      placeholder="Ví dụ: VALORANT (Episode 8)"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Small Image & Application ID */}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center justify-between">
                      <span>URL Huy hiệu góc (Small Image / Rank Badge)</span>
                      {smallImage && (
                        <span className="text-[10px] text-indigo-400 font-normal">Đã có badge</span>
                      )}
                    </label>
                    <div className="flex gap-2 items-center">
                      {smallImage ? (
                        <img
                          src={smallImage}
                          alt="Small preview"
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 bg-slate-900"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                          <Trophy className="w-4 h-4" />
                        </div>
                      )}
                      <input
                        type="url"
                        value={smallImage}
                        onChange={(e) => setSmallImage(e.target.value)}
                        placeholder="https://... icon rank / badge nhỏ"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Application ID Discord (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      placeholder="Ví dụ: 700136079562375218"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Tự động gắn bộ đếm thời gian (Elapsed Timer) trên Discord profile
            </div>

            <button
              id="btn-apply-presence"
              type="button"
              disabled={isSaving}
              onClick={handleApplyPresence}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Đã cập nhật trạng thái!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Áp Dụng Trạng Thái Ngay
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Rotating Status Tab */
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-400" />
                Tự động đổi trạng thái (Rotating Status)
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Discord bot sẽ tự động tuần tự chuyển đổi danh sách status theo khoảng thời gian cài đặt
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-rotating-switch"
                type="checkbox"
                checked={rotationEnabled}
                onChange={(e) => setRotationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Khoảng thời gian chuyển đổi (Giây)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="input-rotation-interval"
                type="number"
                min="5"
                max="3600"
                value={rotationInterval}
                onChange={(e) => setRotationInterval(Math.max(5, parseInt(e.target.value) || 10))}
                className="w-32 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-400">giây (Khuyến nghị từ 10s đến 60s để tránh rate-limit)</span>
            </div>
          </div>

          {/* List of items */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Danh sách trạng thái luân phiên ({rotationItems.length})
              </label>
              <button
                id="btn-add-rotation-item"
                type="button"
                onClick={addRotationItem}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm trạng thái
              </button>
            </div>

            {rotationItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                  #{index + 1}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updated = [...rotationItems];
                      updated[index].text = e.target.value;
                      setRotationItems(updated);
                    }}
                    placeholder="Dòng Custom Status..."
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200"
                  />

                  <input
                    type="text"
                    value={item.activityName}
                    onChange={(e) => {
                      const updated = [...rotationItems];
                      updated[index].activityName = e.target.value;
                      setRotationItems(updated);
                    }}
                    placeholder="Tên hoạt động (e.g. Spotify)..."
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200"
                  />

                  <select
                    value={item.status}
                    onChange={(e) => {
                      const updated = [...rotationItems];
                      updated[index].status = e.target.value as DiscordStatus;
                      setRotationItems(updated);
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200"
                  >
                    <option value="online">Trực tuyến (Online)</option>
                    <option value="idle">Chờ (Idle)</option>
                    <option value="dnd">Không làm phiền (DND)</option>
                    <option value="invisible">Ẩn danh</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeRotationItem(item.id)}
                  disabled={rotationItems.length <= 1}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <button
              id="btn-save-rotation"
              type="button"
              disabled={isSaving}
              onClick={handleApplyRotation}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Đã lưu cài đặt xoay vòng!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu & Kích Hoạt Đổi Trạng Thái
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
