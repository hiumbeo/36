export function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '00:00:00';
  const totalSeconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `00:${pad(minutes)}:${pad(seconds)}`;
}

export function getStatusColor(status: string): { bg: string; border: string; text: string; dot: string } {
  switch (status) {
    case 'online':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'idle':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'dnd':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
      };
    case 'invisible':
    default:
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        dot: 'bg-slate-400',
      };
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'online':
      return 'Trực tuyến (Online)';
    case 'idle':
      return 'Chờ (Idle)';
    case 'dnd':
      return 'Không làm phiền (DND)';
    case 'invisible':
      return 'Ẩn danh (Offline)';
    default:
      return status;
  }
}

export function getActivityTypeLabel(type: number): string {
  switch (type) {
    case 0:
      return 'Đang chơi (Playing)';
    case 1:
      return 'Đang phát trực tiếp (Streaming)';
    case 2:
      return 'Đang nghe (Listening)';
    case 3:
      return 'Đang xem (Watching)';
    case 5:
      return 'Đang thi đấu (Competing)';
    default:
      return 'Hoạt động';
  }
}
