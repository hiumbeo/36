import React, { useState } from 'react';
import { X, HelpCircle, Copy, Check, ShieldCheck, Key, Volume2, Sparkles, Server } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const scriptCode = `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`;

  const copyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Hướng Dẫn Sử Dụng Selfbot Discord</h2>
              <p className="text-xs text-slate-400">Cách lấy Token, ID Kênh thoại và các mẹo tối ưu 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Step 1: Get Token */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="font-semibold text-indigo-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Bước 1: Lấy Discord User Token
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mỗi tài khoản Discord có 1 chuỗi Token duy nhất dùng để chứng thực Gateway kết nối trực tiếp.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
              <li>Mở Discord trên trình duyệt web (như Chrome, Edge, Brave) hoặc Discord Client.</li>
              <li>Nhấn phím tắt <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-indigo-300">Ctrl + Shift + I</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-indigo-300">F12</kbd>.</li>
              <li>Chuyển đến tab <strong>Console</strong>, dán đoạn mã bên dưới và nhấn Enter:</li>
            </ol>

            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400">
              <code className="truncate mr-2">{scriptCode}</code>
              <button
                type="button"
                onClick={copyCode}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-sans transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Token sẽ hiển thị trong ngoặc kép <code>"OTk2..."</code>. Hãy copy toàn bộ chuỗi này để thêm vào app.
            </p>
          </div>

          {/* Step 2: Get Channel ID */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="font-semibold text-indigo-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Bước 2: Lấy ID Server & Kênh Thoại (Voice Channel)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống có tính năng <strong>tự động liệt kê danh sách server và phòng voice</strong> khi bạn thêm tài khoản. Nếu muốn nhập ID thủ công:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>Vào Discord &gt; <strong>Cài đặt người dùng (User Settings)</strong> &gt; <strong>Nâng cao (Advanced)</strong>.</li>
              <li>Bật tính năng <strong>Chế độ nhà phát triển (Developer Mode)</strong>.</li>
              <li>Chuột phải vào tên Server &gt; chọn <strong>Sao chép ID (Copy ID)</strong> để lấy Guild ID.</li>
              <li>Chuột phải vào Kênh thoại cần treo &gt; chọn <strong>Sao chép ID (Copy ID)</strong> để lấy Channel ID.</li>
            </ol>
          </div>

          {/* Step 3: Features summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Các tính năng vượt trội
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Treo Voice 24/7:</strong> Duy trì phiên kết nối Gateway op 4 không lo bị Discord ngắt vì AFK.</li>
              <li><strong>Auto-reconnect:</strong> Tự động nhảy lại vào phòng thoại nếu bị kick hoặc server reload.</li>
              <li><strong>Rich Presence & Badge Tím:</strong> Đặt trạng thái Streaming kèm link Twitch để profile nhận viền tím nổi bật.</li>
              <li><strong>Đổi status tự động:</strong> Luân phiên xoay vòng các dòng status quote yêu thích theo chu kỳ.</li>
            </ul>
          </div>

          {/* Security note */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300/90 leading-relaxed">
              <strong className="text-emerald-200">Bảo mật riêng tư:</strong> Ứng dụng chạy trực tiếp trên backend container an toàn của bạn. Token không được chia sẻ cho bất kỳ bên thứ ba nào.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
