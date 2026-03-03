import { Activity, AlertTriangle, Clock, Globe, Plus, X, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { api, Site, DashboardStats, CreateSiteData } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

const Overview = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sitesRes, statsRes] = await Promise.all([
        api.getSites(),
        api.getDashboardStats()
      ]);

      if (sitesRes.success && sitesRes.data) {
        setSites(sitesRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (data: CreateSiteData) => {
    const response = await api.addSite(data);

    if (response.success && response.data) {
      setSites([response.data, ...sites]);
      setShowAddModal(false);
      loadData();
    }

    return response;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalSites = stats?.totalSites ?? sites.length;
  const activeSites = stats?.activeSites ?? sites.filter(s => s.status === 'up').length;
  const avgUptime = stats?.averageUptime ?? '100.00';
  const activeIncidents = stats?.activeIncidents ?? 0;
  const avgResponseTime = stats?.avgResponseTime;

  const uptimeChartData = stats?.uptimeChart ?? [];
  const responseTimeChartData = stats?.responseTimeChart ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Обзор</h1>
          <p className="text-muted-foreground text-sm mt-1">Общая статистика мониторинга</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Добавить сайт
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Всего сайтов"
          value={totalSites}
          subtitle={`${activeSites} активных`}
          icon={Globe}
        />
        <StatCard
          title="Средний Uptime"
          value={`${avgUptime}%`}
          subtitle="За 30 дней"
          icon={Activity}
          variant="success"
        />
        <StatCard
          title="Активные инциденты"
          value={activeIncidents}
          subtitle={activeIncidents > 0 ? "Требуют внимания" : "Всё стабильно"}
          icon={AlertTriangle}
          variant={activeIncidents > 0 ? "destructive" : "success"}
        />
        <StatCard
          title="Среднее время отклика"
          value={`${avgResponseTime ?? 0}ms`}
          subtitle="За последний час"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">Uptime за сегодня</h3>
          {uptimeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={uptimeChartData}>
                <defs>
                  <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: "hsl(213, 15%, 60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[97, 100]} tick={{ fill: "hsl(213, 15%, 60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(213, 24%, 19%)", border: "1px solid hsl(213, 20%, 25%)", borderRadius: 8, color: "#fff" }} />
                <Area type="monotone" dataKey="uptime" stroke="hsl(142, 71%, 45%)" fill="url(#uptimeGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Нет данных за сегодня
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">Время отклика (мс)</h3>
          {responseTimeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={responseTimeChartData}>
                <defs>
                  <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(238, 90%, 72%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(238, 90%, 72%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: "hsl(213, 15%, 60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(213, 15%, 60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(213, 24%, 19%)", border: "1px solid hsl(213, 20%, 25%)", borderRadius: 8, color: "#fff" }} />
                <Area type="monotone" dataKey="ms" stroke="hsl(238, 90%, 72%)" fill="url(#respGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Нет данных за сегодня
            </div>
          )}
        </div>
      </div>

      {/* Recent sites */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Статус сайтов</h3>
        </div>
        <div className="divide-y divide-border">
          {sites.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              Нет добавленных сайтов
            </div>
          ) : (
            sites.map(site => (
              <div key={site.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground">{site.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{site.url}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-muted-foreground">{site.responseTime > 0 ? `${site.responseTime}ms` : "—"}</span>
                  </div>
                  <div className="text-right hidden md:block">
                    <span className="text-xs text-muted-foreground">{site.uptime}%</span>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <AddSiteModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSite}
        />
      )}
    </div>
  );
};

interface AddSiteModalProps {
  onClose: () => void;
  onSubmit: (data: CreateSiteData) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
}

const AddSiteModal = ({ onClose, onSubmit }: AddSiteModalProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: CreateSiteData = { name, url };
    const response = await onSubmit(data);

    if (!response.success) {
      setError(response.error || "Произошла ошибка");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Добавить сайт</h2>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Название</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Мой сайт"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://example.com"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Добавить"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Overview;
