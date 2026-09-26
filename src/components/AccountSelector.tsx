import React, { useState } from 'react';
import { 
  User, 
  Power, 
  Trash2, 
  Mic, 
  Volume2, 
  Wifi, 
  Clock, 
  Radio, 
  Plus, 
  ShieldCheck,
  Zap,
  Key,
  ArrowRight
} from 'lucide-react';
import type { AccountSession } from '../types.js';
import { formatDuration, getStatusColor } from '../utils/format.js';

interface Props {
  sessions: AccountSession[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
  onToggleConnect: (id: string, isConnected: boolean) => void;
  onDeleteAccount: (id: string) => void;
  onOpenAddModal: () => void;
  onLoadDemo?: () => void;
  onOpenAutoRunModal?: () => void;
  onQuickRunToken?: (token: string) => Promise<void>;
}

export const AccountSelector: React.FC<Props> = ({
  sessions,
  selectedAccountId,
  onSelectAccount,
  onToggleConnect,
  onDeleteAccount,
  onOpenAddModal,
  onLoadDemo,
  onOpenAutoRunModal,
  onQuickRunToken,
}) => {
  const [inlineToken, setInlineToken] = useState('');
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineToken.trim()) return;
    if (!onQuickRunToken) return;
    setIsSubmittingInline(true);
    setInlineError(null);
    try {
      await onQuickRunToken(inlineToken.trim());
      setInlineToken('');
    } catch (err: any) {
      setInlineError(err.message || 'Không thể kích hoạt tài khoản');
    } finally {
      setIsSubmittingInline(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Zap className="w-7 h-7 text-indigo-400 fill-indigo-400/30" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            Tự Động Chạy Tài Khoản Discord Thật 24/7
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Chỉ cần dán Token tài khoản Discord của bạn vào bên dưới. Hệ thống sẽ tự động xác thực tên, avatar, kết nối Gateway và giữ trạng thái Stream/Treo Voice 24/7 (hoàn toàn không dùng demo).
          </p>
        </div>

        {/* Fast Inline Token Activator Form */}
        {onQuickRunToken && (
          <form onSubmit={handleInlineSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="inline-token-input"
                  type="password"
                  value={inlineToken}
                  onChange={(e) => setInlineToken(e.target.value)}
                  placeholder="Dán Discord Token của bạn tại đây (m|N...)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
              <button
                id="btn-inline-quick-run"
                type="submit"
                disabled={isSubmittingInline || !inlineToken.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isSubmittingInline ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>⚡ Chạy Tài Khoản Thật</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {inlineError && (
              <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-xl p-2.5 text-center">
                {inlineError}
              </p>
            )}

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Token được gửi trực tiếp tới Discord Gateway bảo mật và chỉ lưu an toàn trên máy bạn.
            </p>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-800/60 max-w-lg mx-auto">
          {onOpenAutoRunModal && (
            <button
              id="btn-autorun-empty"
              onClick={onOpenAutoRunModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Cài đặt nâng cao (Voice, Prefix)
            </button>
          )}
          <button
            id="btn-add-first-account"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            Nhập nhiều tài khoản
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          Danh sách tài khoản ({sessions.length})
        </h2>
        <div className="flex items-center gap-3">
          {onOpenAutoRunModal && (
            <button
              type="button"
              onClick={onOpenAutoRunModal}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold transition cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Tự Chạy Bot (Auto)
            </button>
          )}
          <button
            id="btn-add-another-account"
            onClick={onOpenAddModal}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm tài khoản khác
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.map((account) => {
          const isSelected = account.id === selectedAccountId;
          const statusStyle = getStatusColor(account.status);

          return (
            <div
              key={account.id}
              id={`account-card-${account.id}`}
              onClick={() => onSelectAccount(account.id)}
              className={`relative rounded-2xl p-4 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                  : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Avatar & Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {account.avatar ? (
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
                        {account.name[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {/* Status Badge Dot or Mobile Badge */}
                    {account.isConnected && (account.deviceType === 'mobile' || account.deviceType === 'ios') ? (
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center border border-emerald-500/50 text-[11px] shadow"
                        title={`Đang Online bằng ${account.deviceType === 'ios' ? 'iPhone' : 'Điện thoại'} (Discord Mobile Badge)`}
                      >
                        📱
                      </span>
                    ) : (
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 ${
                          account.isConnected ? statusStyle.dot : 'bg-slate-600'
                        }`}
                        title={account.isConnected ? account.status : 'Chưa kết nối'}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-100 truncate flex items-center gap-1.5">
                      <span className="truncate">{account.name}</span>
                      {account.id.startsWith('demo-') && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold shrink-0">
                          Demo
                        </span>
                      )}
                      {account.deviceType === 'mobile' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                          📱 Mobile
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      @{account.username}
                    </div>
                  </div>
                </div>

                {/* Connect / Disconnect button */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    id={`toggle-connect-${account.id}`}
                    onClick={() => onToggleConnect(account.id, account.isConnected)}
                    title={account.isConnected ? 'Ngắt kết nối' : 'Kết nối Gateway'}
                    className={`p-2 rounded-xl transition ${
                      account.isConnected
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    id={`delete-acc-${account.id}`}
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa tài khoản ${account.name}?`)) {
                        onDeleteAccount(account.id);
                      }
                    }}
                    title="Xóa tài khoản"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status / Activity Preview */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                {/* Gateway Status Badge */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Radio className={`w-3.5 h-3.5 ${account.isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Gateway:</span>
                  </span>
                  <span className={`font-medium ${account.isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {account.isConnected ? 'Đang online' : 'Ngoại tuyến'}
                  </span>
                </div>

                {/* Voice Status Badge */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className={`w-3.5 h-3.5 ${account.isVoiceConnected ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                    <span>Voice AFK:</span>
                  </span>
                  <span className={`font-medium truncate max-w-[140px] ${account.isVoiceConnected ? 'text-indigo-300' : 'text-slate-500'}`}>
                    {account.isVoiceConnected ? (account.voice.channelName || 'Đang trong Voice') : 'Chưa vào'}
                  </span>
                </div>

                {/* Telemetry: Uptime & Ping */}
                {account.isConnected && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDuration(account.uptimeStart)}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-emerald-400">
                      <Wifi className="w-3 h-3" />
                      {account.ping || 25}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
