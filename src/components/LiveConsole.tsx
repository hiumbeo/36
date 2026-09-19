import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  Pause, 
  Play, 
  Filter, 
  ChevronDown 
} from 'lucide-react';
import type { LogMessage } from '../types.js';

interface Props {
  logs: LogMessage[];
  onClearLogs: () => Promise<void>;
  selectedAccountId: string | null;
}

export const LiveConsole: React.FC<Props> = ({ logs, onClearLogs, selectedAccountId }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'current_account' && selectedAccountId) {
      return log.accountId === selectedAccountId || !log.accountId;
    }
    return log.level === filterLevel;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: LogMessage['level']) => {
    switch (level) {
      case 'ws':
        return <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px]">GATEWAY</span>;
      case 'voice':
        return <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">VOICE</span>;
      case 'success':
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">SUCCESS</span>;
      case 'warn':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">WARN</span>;
      case 'error':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px]">ERROR</span>;
      case 'info':
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 font-mono text-[10px]">INFO</span>;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Console Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">
            Nhật Ký Gateway & Kết Nối Trực Tiếp (Live Console)
          </span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
            {logs.length} dòng
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả nhật ký</option>
              <option value="ws">Chỉ Gateway WS</option>
              <option value="voice">Chỉ Voice</option>
              <option value="success">Thành công</option>
              <option value="warn">Cảnh báo</option>
              <option value="error">Lỗi</option>
              {selectedAccountId && <option value="current_account">Tài khoản hiện tại</option>}
            </select>
          </div>

          {/* Auto scroll toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Tạm dừng cuộn tự động' : 'Bật cuộn tự động'}
            className={`p-1.5 rounded-lg border text-xs transition ${
              autoScroll
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Copy logs */}
          <button
            type="button"
            onClick={handleCopyLogs}
            title="Sao chép nhật ký"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear logs */}
          <button
            type="button"
            onClick={onClearLogs}
            title="Xóa nhật ký"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Output Box */}
      <div
        ref={logsContainerRef}
        className="h-64 sm:h-72 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 space-y-1.5 scrollbar-thin select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Chưa có sự kiện nào được ghi nhận
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 py-0.5 px-1 rounded transition">
              <span className="text-slate-500 text-[11px] shrink-0 select-none">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="shrink-0 select-none">{getLevelBadge(log.level)}</span>
              <span className="break-all text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
