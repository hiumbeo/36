import React from 'react';
import { Radio, Mic, Plus, Shield, Activity, RefreshCw, HelpCircle, Cloud, Sparkles, Zap } from 'lucide-react';
import type { AccountSession } from '../types.js';

interface Props {
  sessions: AccountSession[];
  onOpenAddModal: () => void;
  onOpenGuideModal: () => void;
  onOpenRenderModal: () => void;
  onOpenAutoRunModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<Props> = ({
  sessions,
  onOpenAddModal,
  onOpenGuideModal,
  onOpenRenderModal,
  onOpenAutoRunModal,
  onRefresh,
  isRefreshing,
}) => {
  const onlineCount = sessions.filter((s) => s.isConnected).length;
  const voiceCount = sessions.filter((s) => s.isVoiceConnected).length;
  const avgPing = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.ping || 0), 0) / (sessions.filter(s => s.isConnected).length || 1))
    : 0;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Discord Selfbot AFK
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Treo Status Acc & Kênh Thoại Voice 24/7
            </p>
          </div>
        </div>

        {/* Global Stats Summary */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/60 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${onlineCount > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-slate-400">Trực tuyến:</span>
            <span className="font-semibold text-slate-200">{onlineCount}/{sessions.length}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <Mic className={`w-3.5 h-3.5 ${voiceCount > 0 ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span className="text-slate-400">Treo Voice:</span>
            <span className="font-semibold text-slate-200">{voiceCount} acc</span>
          </div>
          {onlineCount > 0 && (
            <>
              <div className="h-4 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Ping:</span>
                <span className="font-mono font-medium text-emerald-400">{avgPing}ms</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            id="nav-autorun-btn"
            onClick={onOpenAutoRunModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer border border-amber-400/30 animate-pulse"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Tự Chạy Bot</span>
          </button>

          <button
            id="nav-render-btn"
            onClick={onOpenRenderModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer border border-emerald-400/30"
          >
            <Cloud className="w-4 h-4 text-white" />
            <span>Host Render 24/7</span>
          </button>

          <button
            id="nav-refresh-btn"
            onClick={onRefresh}
            title="Làm mới dữ liệu"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            id="nav-guide-btn"
            onClick={onOpenGuideModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Hướng dẫn
          </button>

          <button
            id="nav-add-account-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tài Khoản</span>
          </button>
        </div>
      </div>
    </header>
  );
};
