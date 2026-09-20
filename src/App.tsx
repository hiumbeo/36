import React, { useState, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Plus, 
  Server, 
  Wifi, 
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Cloud,
  Zap
} from 'lucide-react';
import type { 
  AccountSession, 
  DiscordStatus, 
  ActivityConfig, 
  VoiceConfig, 
  RotatingStatusItem, 
  LogMessage 
} from './types.js';
import { Navbar } from './components/Navbar.tsx';
import { AccountSelector } from './components/AccountSelector.tsx';
import { StatusController } from './components/StatusController.tsx';
import { VoiceAFKController } from './components/VoiceAFKController.tsx';
import { LiveConsole } from './components/LiveConsole.tsx';
import { AddAccountModal } from './components/AddAccountModal.tsx';
import { GuideModal } from './components/GuideModal.tsx';
import { RenderGuideModal } from './components/RenderGuideModal.tsx';
import { DiscordProfilePreview } from './components/DiscordProfilePreview.tsx';
import { AutoRunModal } from './components/AutoRunModal.tsx';
import { PrefixCommandsController } from './components/PrefixCommandsController.tsx';

export default function App() {
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isAutoRunModalOpen, setIsAutoRunModalOpen] = useState(false);

  // Active view tab for the selected account: Status vs Voice vs Preview vs Prefix vs All
  const [activeTab, setActiveTab] = useState<'all' | 'preview' | 'status' | 'voice' | 'prefix'>('all');

  // Helper to filter out demo accounts if any real account exists
  const processSessions = (raw: AccountSession[]) => {
    const hasReal = raw.some((s) => !s.id.startsWith('demo-'));
    return hasReal ? raw.filter((s) => !s.id.startsWith('demo-')) : raw;
  };

  // Load initial sessions and logs
  const fetchSessions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/selfbot/sessions');
      if (res.ok) {
        const data = await res.json();
        const validSessions = processSessions(data.sessions || []);
        setSessions(validSessions);
        if (validSessions.length > 0) {
          const realAccount = validSessions.find((s) => !s.id.startsWith('demo-'));
          if (realAccount) {
            setSelectedAccountId((prev) => (!prev || prev.startsWith('demo-') ? realAccount.id : prev));
          } else if (!selectedAccountId) {
            setSelectedAccountId(validSessions[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedAccountId]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/selfbot/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  }, []);

  // Tự động khôi phục và chạy tài khoản thật nếu người dùng đã lưu token trong trình duyệt
  useEffect(() => {
    const savedToken = localStorage.getItem('discord_selfbot_token');
    if (savedToken && savedToken.trim().length > 10) {
      fetch('/api/selfbot/auto-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: savedToken.trim(),
          autoConnect: true,
        }),
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.session) {
          setSelectedAccountId(data.session.id);
          fetchSessions();
        }
      })
      .catch((err) => console.error('Auto-start saved token error:', err));
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
    fetchLogs();
  }, []);

  // Connect to SSE stream for live telemetry and logs
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/selfbot/events');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'init' || payload.type === 'sessions') {
            const validSessions = processSessions(payload.sessions || []);
            setSessions(validSessions);
            setSelectedAccountId((prev) => {
              const realAccount = validSessions.find((s) => !s.id.startsWith('demo-'));
              if (realAccount && (!prev || prev.startsWith('demo-'))) {
                return realAccount.id;
              }
              if (!prev && validSessions.length > 0) {
                return validSessions[0].id;
              }
              // If previously selected account was deleted, fallback to first
              if (prev && !validSessions.some((s: AccountSession) => s.id === prev)) {
                return validSessions[0]?.id || null;
              }
              return prev;
            });
          } else if (payload.type === 'log') {
            setLogs((prev) => {
              const next = [...prev, payload.log];
              return next.slice(-400); // keep last 400
            });
          }
        } catch (err) {
          console.error('Error parsing SSE payload:', err);
        }
      };

      eventSource.onerror = () => {
        // SSE auto-retries in browser
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleAddAccount = async (token: string, autoConnect: boolean) => {
    const res = await fetch('/api/selfbot/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể lưu tài khoản');
    }

    const data = await res.json();
    const newSession = data.session;
    setSelectedAccountId(newSession.id);
    await fetchSessions();

    if (autoConnect) {
      await fetch(`/api/selfbot/accounts/${newSession.id}/connect`, { method: 'POST' });
      await fetchSessions();
    }
  };

  const handleToggleConnect = async (id: string, isConnected: boolean) => {
    const endpoint = isConnected ? 'disconnect' : 'connect';
    try {
      const res = await fetch(`/api/selfbot/accounts/${id}/${endpoint}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Lỗi thao tác kết nối');
      }
      await fetchSessions();
    } catch (e) {
      console.error('Connection toggle failed:', e);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await fetch(`/api/selfbot/accounts/${id}`, { method: 'DELETE' });
      await fetchSessions();
      if (selectedAccountId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        setSelectedAccountId(remaining[0]?.id || null);
      }
    } catch (e) {
      console.error('Delete account failed:', e);
    }
  };

  const handleUpdatePresence = async (
    status: DiscordStatus,
    activity: ActivityConfig,
    customStatus: { text: string; emojiName?: string }
  ) => {
    if (!selectedAccountId) return;
    const res = await fetch(`/api/selfbot/accounts/${selectedAccountId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, activity, customStatus }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể cập nhật trạng thái');
    }
    await fetchSessions();
  };

  const handleUpdateVoice = async (voiceConfig: Partial<VoiceConfig>) => {
    if (!selectedAccountId) return;
    const res = await fetch(`/api/selfbot/accounts/${selectedAccountId}/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voiceConfig),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể cập nhật kênh thoại');
    }
    await fetchSessions();
  };

  const handleUpdateRotatingStatus = async (
    enabled: boolean,
    intervalSeconds: number,
    items: RotatingStatusItem[]
  ) => {
    if (!selectedAccountId) return;
    const res = await fetch(`/api/selfbot/accounts/${selectedAccountId}/rotating-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, intervalSeconds, items }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể lưu danh sách đổi trạng thái');
    }
    await fetchSessions();
  };

  const handleUpdatePrefix = async (prefix: string) => {
    if (!selectedAccountId) return;
    const res = await fetch(`/api/selfbot/accounts/${selectedAccountId}/prefix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể cập nhật tiền tố lệnh');
    }
    await fetchSessions();
  };

  const handleUpdateAFK = async (enabled: boolean, message: string) => {
    if (!selectedAccountId) return;
    const res = await fetch(`/api/selfbot/accounts/${selectedAccountId}/afk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, message }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể cập nhật chế độ AFK');
    }
    await fetchSessions();
  };

  const handleReconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/selfbot/accounts/${id}/reconnect`, { method: 'POST' });
      if (res.ok) {
        await fetchSessions();
      }
    } catch (e) {
      console.error('Reconnect failed:', e);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/selfbot/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/selfbot/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSelectedAccountId(data.session.id);
          fetchSessions();
        }
      }
    } catch (e) {
      console.error('Failed to reset demo:', e);
    }
  };

  const handleQuickRunToken = async (token: string) => {
    const res = await fetch('/api/selfbot/auto-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.trim(),
        autoConnect: true,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Token không hợp lệ hoặc không thể kết nối');
    }
    const data = await res.json();
    localStorage.setItem('discord_selfbot_token', token.trim());
    if (data.session) {
      setSelectedAccountId(data.session.id);
    }
    await fetchSessions();
  };

  const currentAccount = sessions.find((s) => s.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        sessions={sessions}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenRenderModal={() => setIsRenderModalOpen(true)}
        onOpenAutoRunModal={() => setIsAutoRunModalOpen(true)}
        onRefresh={fetchSessions}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Account List & Switcher */}
        <section>
          <AccountSelector
            sessions={sessions}
            selectedAccountId={selectedAccountId}
            onSelectAccount={(id) => setSelectedAccountId(id)}
            onToggleConnect={handleToggleConnect}
            onDeleteAccount={handleDeleteAccount}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onLoadDemo={handleResetDemo}
            onOpenAutoRunModal={() => setIsAutoRunModalOpen(true)}
            onQuickRunToken={handleQuickRunToken}
          />
        </section>

        {/* Selected Account Control Area */}
        {currentAccount ? (
          <section className="space-y-6">
            {/* Account Selected Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {currentAccount.avatar ? (
                    <img
                      src={currentAccount.avatar}
                      alt={currentAccount.name}
                      className="w-12 h-12 rounded-full border border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                      {currentAccount.name[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 ${
                      currentAccount.isConnected ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100 truncate">
                      {currentAccount.name}
                    </h2>
                    {currentAccount.id.startsWith('demo-') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Demo Preview
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        currentAccount.isConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {currentAccount.isConnected ? 'Gateway Đang Chạy' : 'Chưa Kết Nối'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {currentAccount.id} • Status: {currentAccount.status}
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex flex-wrap items-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tổng quan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-300" />
                    Xem Trước Discord
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'status'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Treo Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('voice')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'voice'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Treo Voice 24/7
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('prefix')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'prefix'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-indigo-300" />
                    Lệnh Prefix & AFK
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleConnect(currentAccount.id, currentAccount.isConnected)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                    currentAccount.isConnected
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  {currentAccount.isConnected ? 'Ngắt Kết Nối' : 'Kết Nối Gateway'}
                </button>
              </div>
            </div>

            {/* View Tab: Dedicated Discord Preview */}
            {activeTab === 'preview' && (
              <DiscordProfilePreview
                account={currentAccount}
                onUpdatePresence={handleUpdatePresence}
              />
            )}

            {/* View Tab: Prefix Commands Controller */}
            {activeTab === 'prefix' && (
              <PrefixCommandsController
                account={currentAccount}
                onUpdatePrefix={handleUpdatePrefix}
                onUpdateAFK={handleUpdateAFK}
                onReconnect={() => handleReconnect(currentAccount.id)}
              />
            )}

            {/* View Tab: All or Split Controllers Grid */}
            {activeTab !== 'preview' && activeTab !== 'prefix' && (
              <div className="space-y-6">
                {activeTab === 'all' && (
                  <DiscordProfilePreview
                    account={currentAccount}
                    onUpdatePresence={handleUpdatePresence}
                  />
                )}

                <div className={`grid grid-cols-1 ${activeTab === 'all' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                  {(activeTab === 'all' || activeTab === 'status') && (
                    <StatusController
                      account={currentAccount}
                      onUpdatePresence={handleUpdatePresence}
                      onUpdateRotatingStatus={handleUpdateRotatingStatus}
                    />
                  )}

                  {(activeTab === 'all' || activeTab === 'voice') && (
                    <VoiceAFKController
                      account={currentAccount}
                      onUpdateVoice={handleUpdateVoice}
                    />
                  )}
                </div>

                {activeTab === 'all' && (
                  <PrefixCommandsController
                    account={currentAccount}
                    onUpdatePrefix={handleUpdatePrefix}
                    onUpdateAFK={handleUpdateAFK}
                    onReconnect={() => handleReconnect(currentAccount.id)}
                  />
                )}
              </div>
            )}
          </section>
        ) : (
          /* Empty State Guide Banner */
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                <Radio className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                Sẵn sàng Treo Trạng Thái & Kênh Thoại Discord 24/7
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tự động kết nối trực tiếp đến Discord Gateway với độ trễ thấp, hỗ trợ Rich Presence giả lập đang stream Twitch tím, nghe Spotify, coding VS Code và duy trì kênh Voice AFK 24/7 trên Render Cloud.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAutoRunModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  ⚡ Tự Lắp Token & Chạy Bot Ngay
                </button>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="px-5 py-3 bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 border border-indigo-500/30 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Mở Xem Trước Mẫu (Demo)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Nhập Token Thủ Công
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenderModalOpen(true)}
                  className="px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-2"
                >
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  Hướng Dẫn Host Render 24/7
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Terminal Console */}
        <section>
          <LiveConsole
            logs={logs}
            onClearLogs={handleClearLogs}
            selectedAccountId={selectedAccountId}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-medium">Discord Selfbot AFK Hub</span>
            <span>•</span>
            <span>Gateway Opcode 2 / Opcode 4 Keep-Alive</span>
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <span>Sẵn sàng deploy Render.com</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsRenderModalOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Xem cấu hình Host 24/7
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAccountAdded={handleAddAccount}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <RenderGuideModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
      />

      <AutoRunModal
        isOpen={isAutoRunModalOpen}
        onClose={() => setIsAutoRunModalOpen(false)}
        onAutoRunSuccess={fetchSessions}
      />
    </div>
  );
}
