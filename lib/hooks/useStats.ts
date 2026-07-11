'use client';

import { useEffect, useState } from 'react';

export interface BotStats {
  guildCount: number;
  userCount: number;
  uptime: number;
  ping: number;
}

export function useStats(intervalMs = 10_000) {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) { setOnline(false); return; }
      const data: BotStats = await res.json();
      setStats(data);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch inicial + polling: os setState só correm depois do fetch resolver
    // (assíncrono), não há cascata de renders — padrão legítimo de data-fetching.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    const interval = setInterval(fetchStats, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { stats, loading, online };
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}
