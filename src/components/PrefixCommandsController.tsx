import React, { useState } from 'react';
import { 
  Terminal, 
  Hash, 
  Copy, 
  Check, 
  Zap, 
  Sparkles, 
  Radio, 
  Mic, 
  Volume2, 
  Moon, 
  ShieldCheck, 
  AlertCircle,
  Play,
  Save,
  MessageSquare,
  HelpCircle,
  Clock
} from 'lucide-react';
import type { AccountSession } from '../types.js';

interface Props {
  account: AccountSession;
  onUpdatePrefix: (prefix: string) => Promise<void>;
  onUpdateAFK: (enabled: boolean, message: string) => Promise<void>;
}

export const PrefixCommandsController: React.FC<Props> = ({
  account,
  onUpdatePrefix,
  onUpdateAFK,
}) => {
  const [prefixInput, setPrefixInput] = useState(account.prefix || '!');
  const [afkEnabled, setAfkEnabled] = useState(account.afk?.enabled || false);
  const [afkMessage, setAfkMessage] = useState(account.afk?.message || 'Hiện tại tôi đang AFK / bận, tôi sẽ phản hồi sau!');
  const [isSavingPrefix, setIsSavingPrefix] = useState(false);
  const [isSavingAFK, setIsSavingAFK] = useState(false);
  const [prefixSaved, setPrefixSaved] = useState(false);
  const [afkSaved, setAfkSaved] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Quick command simulator
  const [testCmd, setTestCmd] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const activePrefix = account.prefix || '!';

  const commands = [
    {
      name: `${activePrefix}val`,
      syntax: `${activePrefix}val [chế_độ_chơi]`,
      desc: 'Chuyển sang trạng thái đang chơi VALORANT (Competitive, Ascendant 3, Score 11-9) và trạng thái DND.',
      category: 'Trạng thái',
      example: `${activePrefix}val Competitive`,
    },
    {
      name: `${activePrefix}help`,
      syntax: `${activePrefix}help`,
      desc: 'Hiển thị menu hướng dẫn tất cả câu lệnh của Selfbot ngay trong chat Discord.',
      category: 'Thông tin',
      example: `${activePrefix}help`,
    },
    {
      name: `${activePrefix}ping`,
      syntax: `${activePrefix}ping`,
      desc: 'Kiểm tra độ trễ (latency ms) kết nối tới Gateway Discord & thời gian chạy.',
      category: 'Hệ thống',
      example: `${activePrefix}ping`,
    },
    {
      name: `${activePrefix}stream`,
      syntax: `${activePrefix}stream <tiêu_đề> [twitch_url]`,
      desc: 'Bật Rich Presence Stream Twitch viền tím 🟣 và nút "Watch Stream" 24/7.',
      category: 'Trạng thái',
      example: `${activePrefix}stream Coding Discord Selfbot 24/7`,
    },
    {
      name: `${activePrefix}play`,
      syntax: `${activePrefix}play <tên_game>`,
      desc: 'Đổi trạng thái hiển thị sang đang chơi Game (Playing...).',
      category: 'Trạng thái',
      example: `${activePrefix}play Minecraft`,
    },
    {
      name: `${activePrefix}listen`,
      syntax: `${activePrefix}listen <bài_hát>`,
      desc: 'Đổi trạng thái hiển thị sang đang nghe Spotify (Listening...).',
      category: 'Trạng thái',
      example: `${activePrefix}listen Lofi Hip Hop Beats`,
    },
    {
      name: `${activePrefix}watch`,
      syntax: `${activePrefix}watch <tên_video>`,
      desc: 'Đổi trạng thái hiển thị sang đang xem video (Watching...).',
      category: 'Trạng thái',
      example: `${activePrefix}watch Anime HD 24/7`,
    },
    {
      name: `${activePrefix}status`,
      syntax: `${activePrefix}status <online|idle|dnd|invisible> [text]`,
      desc: 'Đổi trạng thái hoạt động tài khoản và dòng trạng thái tuỳ chỉnh.',
      category: 'Trạng thái',
      example: `${activePrefix}status dnd Đang bận làm đồ án`,
    },
    {
      name: `${activePrefix}voice`,
      syntax: `${activePrefix}voice <Guild_ID> <Voice_Channel_ID>`,
      desc: 'Tự động đưa tài khoản vào phòng thoại (Voice Channel) để treo 24/7.',
      category: 'Voice AFK',
      example: `${activePrefix}voice 123456789012345678 987654321098765432`,
    },
    {
      name: `${activePrefix}leave`,
      syntax: `${activePrefix}leave`,
      desc: 'Rời khỏi phòng voice hiện tại và ngừng treo thoại.',
      category: 'Voice AFK',
      example: `${activePrefix}leave`,
    },
    {
      name: `${activePrefix}mute / ${activePrefix}unmute`,
      syntax: `${activePrefix}mute hoặc ${activePrefix}unmute`,
      desc: 'Tắt hoặc bật micro khi đang treo trong phòng voice.',
      category: 'Voice AFK',
      example: `${activePrefix}mute`,
    },
    {
      name: `${activePrefix}deaf / ${activePrefix}undeaf`,
      syntax: `${activePrefix}deaf hoặc ${activePrefix}undeaf`,
      desc: 'Tắt hoặc bật tai nghe khi đang treo trong phòng voice.',
      category: 'Voice AFK',
      example: `${activePrefix}deaf`,
    },
    {
      name: `${activePrefix}afk`,
      syntax: `${activePrefix}afk <lý_do>`,
      desc: 'Bật tự động trả lời khi có người khác tag @bạn hoặc nhắn tin trực tiếp (DM).',
      category: 'Tự động',
      example: `${activePrefix}afk Đang ngủ, có việc gì nhắn lại sau nhé`,
    },
    {
      name: `${activePrefix}noafk`,
      syntax: `${activePrefix}noafk`,
      desc: 'Tắt chế độ tự động phản hồi AFK.',
      category: 'Tự động',
      example: `${activePrefix}noafk`,
    },
    {
      name: `${activePrefix}prefix`,
      syntax: `${activePrefix}prefix <ký_tự_mới>`,
      desc: 'Đổi tiền tố lệnh trực tiếp trong Discord (Ví dụ: !prefix . hoặc !prefix ?).',
      category: 'Cài đặt',
      example: `${activePrefix}prefix .`,
    },
    {
      name: `${activePrefix}info`,
      syntax: `${activePrefix}info`,
      desc: 'Hiển thị thông tin phiên bot, ID tài khoản, trạng thái ping & uptime Render.',
      category: 'Thông tin',
      example: `${activePrefix}info`,
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSavePrefix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixInput.trim()) return;
    setIsSavingPrefix(true);
    try {
      await onUpdatePrefix(prefixInput.trim());
      setPrefixSaved(true);
      setTimeout(() => setPrefixSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đổi prefix');
    } finally {
      setIsSavingPrefix(false);
    }
  };

  const handleSaveAFK = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAFK(true);
    try {
      await onUpdateAFK(afkEnabled, afkMessage);
      setAfkSaved(true);
      setTimeout(() => setAfkSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật AFK');
    } finally {
      setIsSavingAFK(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Hệ Thống Lệnh Prefix Discord & AFK Responder
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Prefix: {activePrefix}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gõ lệnh trực tiếp trong Discord từ tài khoản của bạn để điều khiển trạng thái, stream Twitch, voice, ping mà không cần mở website.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs shrink-0">
          <span className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-300 font-medium">
            {account.isConnected ? 'Sẵn sàng nhận lệnh trong Discord' : 'Cần kết nối Gateway'}
          </span>
        </div>
      </div>

      {/* Settings Grid: Prefix & AFK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Prefix Setting Box */}
        <form onSubmit={handleSavePrefix} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              Tiền Tố Lệnh (Command Prefix)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Mặc định: !</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ký tự mở đầu khi bạn gõ câu lệnh trong Discord (Ví dụ: <code className="text-indigo-300 font-mono">!help</code>, <code className="text-indigo-300 font-mono">.ping</code>, <code className="text-indigo-300 font-mono">?stream</code>).
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="prefix-input"
                type="text"
                maxLength={4}
                value={prefixInput}
                onChange={(e) => setPrefixInput(e.target.value)}
                placeholder="!"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-center text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              id="save-prefix-btn"
              type="submit"
              disabled={isSavingPrefix || !prefixInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              {prefixSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  Đã Lưu!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Lưu Prefix
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500">Phím tắt nhanh:</span>
            {['!', '.', '?', '$', '-', ','].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrefixInput(p)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded border transition cursor-pointer ${
                  prefixInput === p 
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </form>

        {/* AFK Auto-Responder Box */}
        <form onSubmit={handleSaveAFK} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              Chế Độ Tự Động Phản Hồi Khi AFK
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={afkEnabled}
                onChange={(e) => setAfkEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
          <p className="text-[11px] text-slate-400">
            Tự động nhắn trả lời khi có người ping @bạn hoặc nhắn tin riêng (DM) lúc bạn đang AFK treo tài khoản.
          </p>
          <div className="space-y-2">
            <input
              id="afk-message-input"
              type="text"
              value={afkMessage}
              onChange={(e) => setAfkMessage(e.target.value)}
              placeholder="Nhập tin nhắn phản hồi tự động..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end">
              <button
                id="save-afk-btn"
                type="submit"
                disabled={isSavingAFK}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                {afkSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    Đã Cập Nhật!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Cập Nhật AFK
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security Note */}
      <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 space-y-1">
          <span className="font-semibold text-indigo-300">Bảo mật tuyệt đối: </span>
          Chỉ có tin nhắn do chính tài khoản của bạn gửi mới kích hoạt được các lệnh điều khiển selfbot (người lạ trên server hoàn toàn không thể ra lệnh cho bot của bạn).
        </div>
      </div>

      {/* Command Cheat Sheet Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Bảng Lệnh Selfbot Discord (Nhấp để sao chép)
          </h4>
          <span className="text-[11px] text-slate-500">15 lệnh có sẵn</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {commands.map((cmd) => (
            <div
              key={cmd.name}
              className="bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-3 flex flex-col justify-between gap-2 transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-300 group-hover:text-indigo-200">
                    {cmd.syntax}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {cmd.desc}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  {cmd.example}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cmd.example)}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-[10px] font-medium transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {copiedCmd === cmd.example ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
