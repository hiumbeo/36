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
  Layers,
  Timer,
  Code2,
  FileCode
} from 'lucide-react';
import type { AccountSession, DiscordStatus, ActivityType, RotatingStatusItem, DeviceType, RpcTimeMode } from '../types.js';
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
  const [activeTab, setActiveTab] = useState<'vscode' | 'presence' | 'rotating'>('vscode');
  const [deviceType, setDeviceType] = useState<DeviceType>(account.deviceType || 'desktop');

  // VS Code Python Multi-Status State
  const [pythonImage, setPythonImage] = useState(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10'
  );
  const [pythonIntervalMinutes, setPythonIntervalMinutes] = useState(2);
  const [pythonFiles, setPythonFiles] = useState<RotatingStatusItem[]>([
    {
      id: 'py-1',
      text: 'Đang code toolchui.py 🐍',
      emojiName: '🐍',
      activityName: 'Visual Studio Code',
      activityType: 0,
      status: 'online',
      details: 'Editing toolchui.py',
      state: 'Workspace: Python Tools (Line 214)',
      largeImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10',
      largeText: 'Python 3.12 (Virtual Environment)',
      smallImage: 'https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png',
      smallText: 'Visual Studio Code',
    },
    {
      id: 'py-2',
      text: 'Dev Discord Bot 24/7 💻',
      emojiName: '💻',
      activityName: 'Visual Studio Code',
      activityType: 0,
      status: 'online',
      details: 'Editing bot_discord.py',
      state: 'Workspace: Selfbot Gateway (Line 88)',
      largeImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10',
      largeText: 'Python 3.12 (Virtual Environment)',
      smallImage: 'https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png',
      smallText: 'Visual Studio Code',
    },
    {
      id: 'py-3',
      text: 'Fixing auto_react.py ⚡',
      emojiName: '⚡',
      activityName: 'Visual Studio Code',
      activityType: 0,
      status: 'idle',
      details: 'Editing auto_react.py',
      state: 'Workspace: Automation (Line 56)',
      largeImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10',
      largeText: 'Python 3.12 (Virtual Environment)',
      smallImage: 'https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png',
      smallText: 'Visual Studio Code',
    },
    {
      id: 'py-4',
      text: 'Tối ưu spam_tool.py 🔥',
      emojiName: '🔥',
      activityName: 'Visual Studio Code',
      activityType: 0,
      status: 'dnd',
      details: 'Editing spam_tool.py',
      state: 'Workspace: Auto Tools (Line 210)',
      largeImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10',
      largeText: 'Python 3.12 (Virtual Environment)',
      smallImage: 'https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png',
      smallText: 'Visual Studio Code',
    },
    {
      id: 'py-5',
      text: 'Chạy main.py 🐍',
      emojiName: '🐍',
      activityName: 'Visual Studio Code',
      activityType: 0,
      status: 'online',
      details: 'Editing main.py',
      state: 'Workspace: Core Scripts (Line 12)',
      largeImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10',
      largeText: 'Python 3.12 (Virtual Environment)',
      smallImage: 'https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png',
      smallText: 'Visual Studio Code',
    },
  ]);

  const addPythonFile = () => {
    const num = pythonFiles.length + 1;
    const newName = `tool_${num}.py`;
    const newItem: RotatingStatusItem = {
      id: 'py-' + Math.random().toString(36).substring(2, 9),
      text: `Đang code ${newName} 🐍`,
      emojiName: '🐍',
      activityName: 'Visual Studio Code',
      activityType: 0,
      status: 'online',
      details: `Editing ${newName}`,
      state: `Workspace: Python Projects (Line ${Math.floor(Math.random() * 200) + 20})`,
      largeImage: pythonImage,
      largeText: 'Python 3.12 (Virtual Environment)',
      smallImage: 'https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png',
      smallText: 'Visual Studio Code',
    };
    setPythonFiles([...pythonFiles, newItem]);
  };

  const removePythonFile = (id: string) => {
    if (pythonFiles.length <= 1) {
      alert('Cần giữ ít nhất 1 file Python!');
      return;
    }
    setPythonFiles(pythonFiles.filter(f => f.id !== id));
  };

  const updatePythonFile = (id: string, field: keyof RotatingStatusItem, value: any) => {
    setPythonFiles(pythonFiles.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [field]: value };
      if (field === 'details' && value) {
        const fileName = value.replace('Editing ', '').trim();
        updated.text = `Đang code ${fileName} ${updated.emojiName || '🐍'}`;
      }
      return updated;
    }));
  };

  const handleApplyVSCodePython = async () => {
    setIsSaving(true);
    try {
      if (onUpdateDevice) {
        await onUpdateDevice('desktop');
      }
      const syncedFiles = pythonFiles.map(file => ({
        ...file,
        largeImage: pythonImage || file.largeImage,
      }));
      const intervalSec = Math.max(10, Math.round(pythonIntervalMinutes * 60));
      await onUpdateRotatingStatus(true, intervalSec, syncedFiles);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kích hoạt VS Code Python Multi-Status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStopVSCodePython = async () => {
    setIsSaving(true);
    try {
      await onUpdateRotatingStatus(false, pythonIntervalMinutes * 60, pythonFiles);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi dừng VS Code Status');
    } finally {
      setIsSaving(false);
    }
  };

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

  // RPC Timestamps Settings
  const [timeMode, setTimeMode] = useState<RpcTimeMode>(account.activity?.timestamps?.mode || 'now');
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(account.activity?.timestamps?.customElapsedMinutes || 30);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(account.activity?.timestamps?.remainingMinutes || 15);

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
    if (account.activity?.timestamps?.mode) {
      setTimeMode(account.activity.timestamps.mode);
      if (account.activity.timestamps.customElapsedMinutes) {
        setElapsedMinutes(account.activity.timestamps.customElapsedMinutes);
      }
      if (account.activity.timestamps.remainingMinutes) {
        setRemainingMinutes(account.activity.timestamps.remainingMinutes);
      }
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
    setTimeMode('now');

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
      let timestampsConfig: any = undefined;
      if (timeMode === 'off') {
        timestampsConfig = { mode: 'off' };
      } else if (timeMode === 'now') {
        timestampsConfig = { mode: 'now', start: Date.now() };
      } else if (timeMode === 'uptime') {
        timestampsConfig = { mode: 'uptime', start: account.uptimeStart || Date.now() };
      } else if (timeMode === 'custom_elapsed') {
        const mins = Math.max(1, Number(elapsedMinutes) || 30);
        timestampsConfig = {
          mode: 'custom_elapsed',
          customElapsedMinutes: mins,
          start: Date.now() - mins * 60000,
        };
      } else if (timeMode === 'remaining') {
        const mins = Math.max(1, Number(remainingMinutes) || 15);
        timestampsConfig = {
          mode: 'remaining',
          remainingMinutes: mins,
          end: Date.now() + mins * 60000,
        };
      }

      await onUpdatePresence(
        status,
        {
          name: activityName,
          type: activityType,
          details: activityDetails,
          state: activityState,
          url: activityType === 1 ? streamingUrl : undefined,
          application_id: applicationId.trim() || undefined,
          timestamps: timestampsConfig,
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
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto">
          <button
            id="tab-vscode"
            type="button"
            onClick={() => setActiveTab('vscode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'vscode'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-indigo-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-300" />
            <span>💻 VS Code Python (Tự Đổi Status)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              MỚI
            </span>
          </button>
          <button
            id="tab-static-presence"
            type="button"
            onClick={() => setActiveTab('presence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === 'presence'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎮 Trạng thái Game & Custom RPC
          </button>
          <button
            id="tab-rotating-presence"
            type="button"
            onClick={() => setActiveTab('rotating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'rotating'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            🔄 Đổi Status Tự Do
          </button>
        </div>
      </div>

      {activeTab === 'vscode' ? (
        <div className="space-y-6">
          {/* BANNER THIẾT BỊ: KHÓA MÁY TÍNH (PC DESKTOP) */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">💻 THIẾT BỊ: MÁY TÍNH (PC DESKTOP)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ĐÃ KHÓA CỐ ĐỊNH PC
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Đã gỡ bỏ hoàn toàn icon điện thoại. Tài khoản của bạn sẽ luôn luôn hiển thị biểu tượng Máy Tính (Discord Client Windows).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDeviceSelect('desktop')}
              className="px-3.5 py-1.5 bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-400/40 text-indigo-100 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Đảm bảo PC 100%
            </button>
          </div>

          {/* VS CODE PYTHON DYNAMIC MULTI-STATUS CONFIGURATION */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-5">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐍</span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Visual Studio Code (Python Multi-Status)
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Tự Động Đổi File
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động luân phiên đổi qua lại giữa các file code (toolchui.py, bot_discord.py,...) sau mỗi vài phút
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleStopVSCodePython}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Dừng tự đổi
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleApplyVSCodePython}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      Đã Kích Hoạt!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      🚀 Kích Hoạt Ngay
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 1. Cấu hình Ảnh Hoạt Động (Python Artwork) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  Hình Ảnh Hoạt Động (Python Logo Artwork)
                </label>
                <span className="text-[11px] text-slate-400">
                  Hiển thị ảnh Python + Huy hiệu VS Code trên Profile Discord
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={pythonImage}
                  alt="Python Artwork"
                  className="w-14 h-14 rounded-xl object-cover border border-indigo-500/40 shadow-md bg-slate-950 shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="url"
                    value={pythonImage}
                    onChange={(e) => setPythonImage(e.target.value)}
                    placeholder="https://... link ảnh Python"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Đã cấu hình sẵn link ảnh Python chuẩn theo yêu cầu của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Cấu hình Thời Gian Đổi File (Phút) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Khoảng Thời Gian Đổi Qua Status Khác (Chu Kỳ)
                </label>
                <span className="text-[11px] text-slate-400">
                  Đang cài đặt: Đổi file sau mỗi <strong className="text-amber-300">{pythonIntervalMinutes} phút</strong>
                </span>
              </div>

              {/* Quick minute chips */}
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setPythonIntervalMinutes(mins)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      pythonIntervalMinutes === mins
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⏱️ {mins} phút
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-slate-400">Tự chỉnh:</span>
                  <input
                    type="number"
                    min={0.5}
                    max={60}
                    step={0.5}
                    value={pythonIntervalMinutes}
                    onChange={(e) => setPythonIntervalMinutes(Math.max(0.5, Number(e.target.value)))}
                    className="w-16 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 text-center"
                  />
                  <span className="text-xs text-slate-400">phút</span>
                </div>
              </div>
            </div>

            {/* 3. Danh Sách File Python Luân Phiên */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  Danh Sách Các File Python Luân Phiên ({pythonFiles.length} file)
                </label>
                <button
                  type="button"
                  onClick={addPythonFile}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition cursor-pointer px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Thêm File Python
                </button>
              </div>

              <div className="space-y-2.5">
                {pythonFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-xl space-y-2.5 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.emojiName || '🐍'}
                          onChange={(e) => updatePythonFile(item.id, 'emojiName', e.target.value)}
                          maxLength={4}
                          className="w-9 px-1 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center text-sm font-mono"
                          title="Emoji dòng trạng thái"
                        />
                        <input
                          type="text"
                          value={item.details || ''}
                          onChange={(e) => updatePythonFile(item.id, 'details', e.target.value)}
                          placeholder="Editing toolchui.py"
                          className="px-3 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-semibold text-indigo-300 w-44 sm:w-56"
                          title="Dòng chi tiết (Details) trong Rich Presence"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => updatePythonFile(item.id, 'status', e.target.value as DiscordStatus)}
                          className="px-2 py-1 bg-slate-950 border border-slate-700 text-[11px] rounded-lg text-slate-300"
                        >
                          <option value="online">Online</option>
                          <option value="idle">Idle</option>
                          <option value="dnd">DND</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removePythonFile(item.id)}
                          title="Xóa file này"
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* State & Custom text inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Workspace / State (Line number)</label>
                        <input
                          type="text"
                          value={item.state || ''}
                          onChange={(e) => updatePythonFile(item.id, 'state', e.target.value)}
                          placeholder="Workspace: Python Tools (Line 142)"
                          className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Dòng Status hiển thị trên Avatar</label>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updatePythonFile(item.id, 'text', e.target.value)}
                          placeholder="Đang code toolchui.py 🐍"
                          className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'presence' ? (
        <div className="space-y-6">
          {/* BANNER THIẾT BỊ: KHÓA MÁY TÍNH (PC DESKTOP) */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">💻 THIẾT BỊ: MÁY TÍNH (PC DESKTOP)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ĐÃ KHÓA CỐ ĐỊNH PC
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Đã gỡ bỏ hoàn toàn icon điện thoại. Tài khoản của bạn luôn hiển thị biểu tượng Máy Tính (PC Client).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDeviceSelect('desktop')}
              className="px-3.5 py-1.5 bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-400/40 text-indigo-100 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Đảm bảo PC 100%
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Mẫu cấu hình nhanh (1-Click Presets)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setStatus('online');
                  setCustomText('Đang code toolchui.py 🐍');
                  setEmojiName('🐍');
                  setActivityName('Visual Studio Code');
                  setActivityType(0);
                  setActivityDetails('Editing toolchui.py');
                  setActivityState('Workspace: Python Tools (Line 214)');
                  setApplicationId('383226320970055681');
                  setLargeImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPmNJMnX4lEb1GZfYgYfVTSpb2i3SMCSsPfqUDiGfd8w&s=10');
                  setLargeText('Python 3.12 (Virtual Environment)');
                  setSmallImage('https://cdn.discordapp.com/app-assets/383226320970055681/565945869639188500.png');
                  setSmallText('Visual Studio Code');
                }}
                className="px-3 py-2 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 hover:border-indigo-400 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-bold text-xs text-indigo-300 flex items-center gap-1">
                  <span>🐍 toolchui.py</span>
                </div>
                <div className="text-[10px] text-indigo-400/80 mt-0.5">VS Code Python</div>
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

              {/* CÀI ĐẶT BỘ ĐẾM THỜI GIAN RPC (RPC TIMESTAMPS) */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Cài Đặt Bộ Đếm Thời Gian RPC (RPC Timestamps)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Hiển thị dòng "01:23:45 đã trôi qua" hoặc "Còn lại 15:00"
                  </span>
                </div>

                {/* Time mode selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'now', label: 'Bắt đầu lúc này', desc: '00:00:00 (Reset)', icon: Timer },
                    { id: 'uptime', label: 'Theo Uptime bot', desc: 'Từ lúc bot online', icon: Clock },
                    { id: 'custom_elapsed', label: 'Đã chơi trước đó', desc: 'Nhập số phút', icon: Clock },
                    { id: 'remaining', label: 'Đếm ngược (Còn lại)', desc: 'Ending in...', icon: Timer },
                    { id: 'off', label: 'Tắt đếm giờ', desc: 'Không hiện timer', icon: Layers },
                  ].map((item) => {
                    const isCurrent = timeMode === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTimeMode(item.id as RpcTimeMode)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className="w-3.5 h-3.5" />
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                        <span className="text-xs font-semibold leading-tight">{item.label}</span>
                        <span className="text-[10px] text-slate-500">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input for custom elapsed minutes */}
                {timeMode === 'custom_elapsed' && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-amber-300">Giả lập đã chơi từ trước:</span>
                      <p className="text-[11px] text-slate-400">Ví dụ: 45 phút trước, 120 phút trước</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={elapsedMinutes}
                        onChange={(e) => setElapsedMinutes(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300 text-right"
                      />
                      <span className="text-xs text-slate-400">phút trước</span>
                    </div>
                  </div>
                )}

                {/* Input for remaining minutes (countdown) */}
                {timeMode === 'remaining' && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-amber-300">Thời gian còn lại (Đếm ngược):</span>
                      <p className="text-[11px] text-slate-400">Ví dụ: còn 15 phút, còn 3 phút bài hát</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={remainingMinutes}
                        onChange={(e) => setRemainingMinutes(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300 text-right"
                      />
                      <span className="text-xs text-slate-400">phút nữa</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bộ đếm: </span>
              <strong className="text-slate-200">
                {timeMode === 'off'
                  ? 'Đã tắt timer'
                  : timeMode === 'now'
                  ? 'Bắt đầu từ 00:00:00'
                  : timeMode === 'uptime'
                  ? 'Theo Uptime bot'
                  : timeMode === 'custom_elapsed'
                  ? `Đã chơi ${elapsedMinutes} phút trước`
                  : `Đếm ngược ${remainingMinutes} phút`}
              </strong>
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
