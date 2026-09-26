import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertTriangle, HelpCircle, Copy, Check, ShieldAlert, Sparkles, Loader2, Smartphone, Monitor, Globe, Apple } from 'lucide-react';
import type { DeviceType } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: (
    token: string, 
    autoConnect: boolean, 
    deviceType?: DeviceType, 
    pureOnline?: boolean
  ) => Promise<void>;
}

export const AddAccountModal: React.FC<Props> = ({ isOpen, onClose, onAccountAdded }) => {
  const [token, setToken] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [pureOnline, setPureOnline] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    user?: { id: string; username: string; discriminator: string; avatar: string | null; global_name?: string };
    error?: string;
  } | null>(null);
  const [autoConnect, setAutoConnect] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleValidate = async () => {
    if (!token.trim()) return;
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/selfbot/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err: any) {
      setValidationResult({ valid: false, error: 'Không thể kết nối máy chủ để kiểm tra token' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsSubmitting(true);
    try {
      await onAccountAdded(token.trim(), autoConnect, deviceType, pureOnline);
      setToken('');
      setValidationResult(null);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyScript = () => {
    const code = `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`;
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Thêm Tài Khoản Discord</h2>
              <p className="text-xs text-slate-400">Nhập Token tài khoản người dùng để bắt đầu treo status & voice</p>
            </div>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Quick Auto-Start Hint */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Muốn tự lắp token, chọn stream Twitch và tự chạy ngay 1-Click?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const saved = localStorage.getItem('discord_selfbot_saved_token');
                if (saved) {
                  setToken(saved);
                  setValidationResult(null);
                }
              }}
              className="text-xs text-amber-300 hover:text-amber-200 font-semibold underline shrink-0 cursor-pointer ml-2"
            >
              {localStorage.getItem('discord_selfbot_saved_token') ? '⚡ Lắp Token Đã Lưu' : ''}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                Discord User Token
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showGuide ? 'Ẩn hướng dẫn lấy Token' : 'Cách lấy Token?'}
              </button>
            </div>

            <div className="relative">
              <input
                id="input-discord-token"
                type="password"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="Ví dụ: OTk2Mjk5... (Token bí mật của bạn)"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Guide Dropdown */}
          {showGuide && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs text-slate-300 space-y-3">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Hướng dẫn lấy Token tài khoản Discord:
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>Mở Discord trên trình duyệt (Web) hoặc Discord Desktop app.</li>
                <li>Nhấn phím <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-indigo-300">Ctrl + Shift + I</kbd> (hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-indigo-300">F12</kbd>) để mở Developer Tools.</li>
                <li>Chuyển qua tab <strong>Console</strong>, dán đoạn mã bên dưới và nhấn Enter:</li>
              </ol>

              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                <code className="truncate mr-2">
                  (webpackChunkdiscord_app.push([[''],&#123;&#125;,e=&gt;...]).exports.default.getToken()
                </code>
                <button
                  type="button"
                  onClick={copyScript}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-sans transition"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSnippet ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>

              <p className="text-slate-400">
                Hoặc ở tab <strong>Network</strong>, lọc <code>/api</code>, bấm vào một request bất kỳ và tìm mục <code>authorization:</code> trong Request Headers.
              </p>
            </div>
          )}

          {/* Check Token Button */}
          <div className="flex gap-2">
            <button
              id="btn-verify-token"
              type="button"
              disabled={!token.trim() || isValidating}
              onClick={handleValidate}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium border border-slate-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Kiểm tra Token
                </>
              )}
            </button>
          </div>

          {/* Validation Result Box */}
          {validationResult && (
            <div className={`p-4 rounded-xl border ${
              validationResult.valid 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}>
              {validationResult.valid && validationResult.user ? (
                <div className="flex items-center gap-3">
                  {validationResult.user.avatar ? (
                    <img
                      src={validationResult.user.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
                      {validationResult.user.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      {validationResult.user.global_name || validationResult.user.username}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                        Hợp lệ
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      ID: {validationResult.user.id} • @{validationResult.user.username}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-rose-300">Token không hợp lệ</p>
                    <p className="text-slate-400 mt-0.5">{validationResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chọn Loại Thiết Bị (Device Type) */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Biểu Tượng Thiết Bị Hiển Thị Trên Discord:
              </label>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {deviceType === 'mobile' ? '📱 Điện Thoại (Android)' : deviceType === 'ios' ? '🍏 iPhone (iOS)' : deviceType === 'desktop' ? '💻 Máy Tính' : '🌐 Trình Duyệt'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setDeviceType('mobile')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'mobile'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Điện thoại 📱
                </div>
                <div className="text-[10px] text-emerald-400/80 font-medium">Khuyên dùng (Đúng brief)</div>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('ios')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'ios'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                  <Apple className="w-4 h-4 text-slate-300" />
                  iPhone iOS 🍏
                </div>
                <div className="text-[10px] text-slate-500">Icon điện thoại</div>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('desktop')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'desktop'
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                  <Monitor className="w-4 h-4 text-slate-300" />
                  Máy tính PC 💻
                </div>
                <div className="text-[10px] text-slate-500">Chấm tròn xanh</div>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('web')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  deviceType === 'web'
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                  <Globe className="w-4 h-4 text-slate-300" />
                  Trình duyệt 🌐
                </div>
                <div className="text-[10px] text-slate-500">Web Chrome</div>
              </button>
            </div>
          </div>

          {/* Chế độ Treo Tinh Khiết Checkbox */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                id="pure-online-check"
                type="checkbox"
                checked={pureOnline}
                onChange={(e) => setPureOnline(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="pure-online-check" className="text-xs text-slate-200 cursor-pointer">
                <span className="font-bold text-emerald-300">Treo Điện Thoại 24/7 Tinh Khiết (Theo Yêu Cầu Của Bạn):</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  Chỉ treo Online liên tục với icon Điện Thoại (📱). Hoàn toàn <b>không</b> status, <b>không</b> chơi game hay stream.
                </span>
              </label>
            </div>
          </div>

          {/* Auto-connect checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="auto-connect-check"
              type="checkbox"
              checked={autoConnect}
              onChange={(e) => setAutoConnect(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
            <label htmlFor="auto-connect-check" className="text-xs text-slate-300 cursor-pointer">
              Tự động kết nối Gateway ngay sau khi lưu
            </label>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300/90">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-300">Lưu ý bảo mật & Điều khoản Discord:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                Token chỉ chạy trực tiếp trên backend cô lập của bạn và không gửi ra ngoài. Sử dụng selfbot có thể vi phạm Điều khoản Dịch vụ Discord nếu lạm dụng spam. Khuyến nghị chỉ dùng để treo status, nghe nhạc hoặc treo phòng voice.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              id="cancel-add-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              id="submit-add-account-btn"
              type="submit"
              disabled={!token.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Thêm Tài Khoản'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
