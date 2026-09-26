import React, { useState, useMemo } from 'react';
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
  Clock,
  Search,
  RefreshCw,
  Gamepad2,
  Cpu,
  Type,
  Smile,
  Calculator
} from 'lucide-react';
import type { AccountSession } from '../types.js';
import { getCommandsList, SelfbotCommandInfo } from '../data/commandsData.js';

interface Props {
  account: AccountSession;
  onUpdatePrefix: (prefix: string) => Promise<void>;
  onUpdateAFK: (enabled: boolean, message: string) => Promise<void>;
  onReconnect?: () => Promise<void> | void;
}

export const PrefixCommandsController: React.FC<Props> = ({
  account,
  onUpdatePrefix,
  onUpdateAFK,
  onReconnect,
}) => {
  const [prefixInput, setPrefixInput] = useState(account.prefix || '!');
  const [afkEnabled, setAfkEnabled] = useState(account.afk?.enabled || false);
  const [afkMessage, setAfkMessage] = useState(account.afk?.message || 'Hiện tại tôi đang AFK / bận, tôi sẽ phản hồi sau!');
  const [isSavingPrefix, setIsSavingPrefix] = useState(false);
  const [isSavingAFK, setIsSavingAFK] = useState(false);
  const [prefixSaved, setPrefixSaved] = useState(false);
  const [afkSaved, setAfkSaved] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectSuccess, setReconnectSuccess] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'games' | 'system' | 'voice' | 'text' | 'fun' | 'tools'>('all');

  const activePrefix = account.prefix || '!';

  const allCommands = useMemo(() => {
    return getCommandsList(activePrefix);
  }, [activePrefix]);

  const filteredCommands = useMemo(() => {
    return allCommands.filter((cmd) => {
      const matchCat = selectedCategory === 'all' || cmd.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        cmd.name.toLowerCase().includes(q) || 
        cmd.syntax.toLowerCase().includes(q) || 
        cmd.desc.toLowerCase().includes(q) ||
        cmd.example.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [allCommands, selectedCategory, searchQuery]);

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

  const handleTriggerReconnect = async () => {
    if (!onReconnect || isReconnecting) return;
    setIsReconnecting(true);
    try {
      await onReconnect();
      setReconnectSuccess(true);
      setTimeout(() => setReconnectSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReconnecting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Tất cả lệnh', icon: Terminal, count: allCommands.length },
    { id: 'owo', label: 'Tool Cày OwO', icon: Sparkles, count: allCommands.filter(c => c.category === 'owo').length },
    { id: 'games', label: 'Gaming & RPC', icon: Gamepad2, count: allCommands.filter(c => c.category === 'games').length },
    { id: 'system', label: 'Hệ thống & Info', icon: Cpu, count: allCommands.filter(c => c.category === 'system').length },
    { id: 'voice', label: 'Treo Voice AFK', icon: Mic, count: allCommands.filter(c => c.category === 'voice').length },
    { id: 'text', label: 'Chữ & Mã hóa', icon: Type, count: allCommands.filter(c => c.category === 'text').length },
    { id: 'fun', label: 'Minigame', icon: Smile, count: allCommands.filter(c => c.category === 'fun').length },
    { id: 'tools', label: 'Toán & Tiện ích', icon: Calculator, count: allCommands.filter(c => c.category === 'tools').length },
  ];

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
              Hệ Thống 100+ Lệnh Prefix & AFK Discord 24/7
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Prefix: {activePrefix}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gõ lệnh trực tiếp trong Discord từ tài khoản của bạn để điều khiển trạng thái, game Rich Presence, voice 24/7, minigame mà không cần mở web.
          </p>
        </div>

        {/* Status indicator & Anti-Zombie Reconnect button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTriggerReconnect}
            disabled={isReconnecting}
            title="Làm mới socket nếu kết nối bị đơ (Anti-Zombie)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{reconnectSuccess ? 'Đã Tái Lập!' : 'Làm Mới Gateway'}</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-medium">
              {account.isConnected ? 'Gateway Trực Tuyến' : 'Chưa Kết Nối'}
            </span>
          </div>
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
            <span className="text-[10px] text-slate-400 font-mono">Hiện tại: {activePrefix}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ký tự mở đầu khi gõ câu lệnh trong Discord (Ví dụ: <code className="text-indigo-300 font-mono">{activePrefix}help</code>, <code className="text-indigo-300 font-mono">{activePrefix}ping</code>, <code className="text-indigo-300 font-mono">{activePrefix}val</code>).
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

      {/* Security & Anti-Zombie Guarantee Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 space-y-0.5">
            <span className="font-semibold text-indigo-300">Bảo mật tự động: </span>
            Chỉ lệnh do chính tài khoản của bạn gõ mới thực thi. Người khác trên server hoàn toàn không thể điều khiển bot.
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3.5 flex items-start gap-3">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 space-y-0.5">
            <span className="font-semibold text-emerald-300">Tự Phục Hồi 24/7 (Anti-Zombie): </span>
            Hệ thống tự gửi WebSocket Ping mỗi 15s và tự khởi động lại socket ngay khi phát hiện Discord không trả lời ACK.
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Kho Danh Sách Lệnh ({filteredCommands.length} / {allCommands.length} lệnh)
            </h4>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm lệnh (vd: val, ping, rps, calc)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap text-xs border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Command Cheat Sheet Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredCommands.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            Không tìm thấy lệnh nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredCommands.map((cmd) => (
            <div
              key={cmd.name}
              className="bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-3 flex flex-col justify-between gap-2 transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-300 group-hover:text-indigo-200">
                    {cmd.syntax}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-medium">
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
          ))
        )}
      </div>
    </div>
  );
};
