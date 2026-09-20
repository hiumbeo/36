import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Cloud, 
  Terminal, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Server, 
  Flame, 
  Sparkles,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'render' | 'git' | 'keepalive'>('render');

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const buildCmd = 'npm install --legacy-peer-deps && npm run build';
  const startCmd = 'npm run start';
  const gitCommands = `# 1. Khởi tạo Git & thêm tất cả file
git init
git add .
git commit -m "Deploy Discord Selfbot to Render"

# 2. Đổi nhánh chính sang main
git branch -M main

# 3. Kết nối với repo GitHub của bạn
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git

# 4. Đẩy code lên GitHub
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                  Chỉ Dẫn & Câu Lệnh Host Render.com 24/7
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Miễn Phí 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Treo tài khoản Discord liên tục 24/7 không cần bật máy tính
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('render')}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'render'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Server className="w-4 h-4" />
            1. Cấu Hình Render
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'git'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            2. Câu Lệnh Git Đẩy Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keepalive')}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'keepalive'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            3. Giữ 24/7 Không Bị Sleep
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'render' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200 leading-relaxed flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Render.com</strong> là nền tảng điện toán đám mây cho phép bạn chạy ứng dụng Node.js hoàn toàn miễn phí. Dự án này đã có sẵn file <code className="text-indigo-300 font-mono bg-indigo-950 px-1 py-0.5 rounded">render.yaml</code>, bạn chỉ cần tạo Web Service theo các thông số dưới đây:
                </div>
              </div>

              {/* Form specs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông Số Cài Đặt Khi Tạo Web Service Trên Render
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Mục Runtime</span>
                    <span className="text-sm font-semibold text-slate-200">Node</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Khu Vực (Region) Khuyên Dùng</span>
                    <span className="text-sm font-semibold text-emerald-400">Singapore (Southeast Asia)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Ping Discord cực thấp ~15-30ms</span>
                  </div>
                </div>

                {/* Build Command Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300">
                      Build Command (Lệnh Biên Dịch):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('build', buildCmd)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'build' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép lệnh</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-xl text-xs sm:text-sm font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                    {buildCmd}
                  </pre>
                </div>

                {/* Start Command Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300">
                      Start Command (Lệnh Khởi Chạy):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('start', startCmd)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'start' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép lệnh</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-xl text-xs sm:text-sm font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                    {startCmd}
                  </pre>
                </div>

                {/* Environment Variables */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Biến Môi Trường (Environment Variables):
                  </span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-300">NODE_ENV</span>
                      <span className="text-indigo-400 font-semibold">production</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-300">PORT</span>
                      <span className="text-indigo-400 font-semibold">10000 (Render tự cấp)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://dashboard.render.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>Mở Render.com Dashboard</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'git' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Để triển khai lên Render, bạn hãy tạo một kho lưu trữ mới trên <strong className="text-white">GitHub</strong> (chọn chế độ Private hoặc Public đều được), sau đó mở Terminal tại thư mục này và chạy các lệnh:
              </p>

              <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <span className="text-xs font-medium text-slate-400">Terminal Bash Commands</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('git', gitCommands)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'git' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Đã sao chép tất cả!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép tất cả lệnh</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs sm:text-sm font-mono text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {gitCommands}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                💡 Sau khi push code lên GitHub, trên Render bạn chỉ việc kết nối repo này, Render sẽ tự động build và deploy mỗi khi bạn có bản commit mới!
              </div>
            </div>
          )}

          {activeTab === 'keepalive' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Lưu ý quan trọng của Render Free:</strong> Dịch vụ miễn phí của Render sẽ tạm dừng (Sleep) sau 15 phút nếu không có lượt truy cập HTTP nào. Để giữ bot chạy 24/7 không bao giờ ngủ, hãy làm theo 2 cách đơn giản sau:
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[11px]">1</span>
                    Dùng UptimeRobot (Khuyên dùng - 100% Miễn phí)
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Truy cập <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">uptimerobot.com</a>, tạo 1 Monitor loại <strong>HTTP(s)</strong> ping đến endpoint giữ sống của bạn mỗi 5 phút:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <code className="text-xs font-mono text-emerald-400 truncate">
                      https://&lt;ten-app-render&gt;.onrender.com/ping
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy('pingurl', 'https://<ten-app-render>.onrender.com/ping')}
                      className="ml-2 px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'pingurl' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[11px]">2</span>
                    Cơ chế Tự Ping (Self-Ping Keep-Alive) Tích Hợp Sẵn
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Trong phần <strong>Environment Variables</strong> trên Render, bạn chỉ cần thêm biến:
                  </p>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                    <span className="text-indigo-300 font-semibold">RENDER_EXTERNAL_URL</span> = <span className="text-emerald-400">https://&lt;ten-app-cua-ban&gt;.onrender.com</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Máy chủ Node.js của bot sẽ tự động định kỳ ping lại chính nó mỗi 10 phút, ngăn chặn máy chủ ngủ đông!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            File chi tiết: RENDER_DEPLOY.md • render.yaml
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
