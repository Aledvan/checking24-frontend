import { useEffect, useState } from "react";
import { Plus, ExternalLink, RotateCw, Pencil, Trash2, Loader2, X } from "lucide-react";
import { api, Site, CreateSiteData, UpdateSiteData } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

const Monitoring = () => {
  usePageTitle("Мониторинг");
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSiteId, setDeletingSiteId] = useState<number | null>(null);

  const fetchSites = async () => {
    setLoading(true);
    setError(null);

    const response = await api.getSites();

    if (response.success && response.data) {
      setSites(response.data);
    } else {
      setError(response.error || "Не удалось загрузить сайты");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleAddSite = async (data: CreateSiteData) => {
    const response = await api.addSite(data);

    if (response.success && response.data) {
      setSites([response.data, ...sites]);
      setShowAddModal(false);
    }

    return response;
  };

  const handleUpdateSite = async (id: number, data: UpdateSiteData) => {
    const response = await api.updateSite(id, data);

    if (response.success && response.data) {
      setSites(sites.map(s => s.id === id ? response.data! : s));
      setEditingSite(null);
    }

    return response;
  };

  const handleDeleteSite = async (id: number) => {
    const response = await api.deleteSite(id);

    if (response.success) {
      setSites(sites.filter(s => s.id !== id));
      setDeletingSiteId(null);
    }

    return response;
  };

  const formatLastCheck = (lastCheckAt: string | null) => {
    if (!lastCheckAt) return "Не проверялся";

    const date = new Date(lastCheckAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Только что";
    if (diffMins < 60) return `${diffMins} мин назад`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;

    return date.toLocaleDateString('ru-RU');
  };

  const formatExpiryDate = (dateStr: string | null) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const formattedDate = date.toLocaleDateString('ru-RU');

    if (diffDays < 0) {
      return { text: `${formattedDate} (истёк)`, isExpired: true, isWarning: false };
    } else if (diffDays <= 30) {
      return { text: `${formattedDate} (${diffDays} дн.)`, isExpired: false, isWarning: true };
    } else {
      return { text: `${formattedDate} (${diffDays} дн.)`, isExpired: false, isWarning: false };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 text-center">
        <p className="text-destructive">{error}</p>
        <button onClick={fetchSites} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мониторинг</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление отслеживаемыми сайтами</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSites}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Обновить
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Добавить сайт
          </button>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Нет добавленных сайтов</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Добавить первый сайт
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map(site => (
            <div key={site.id} className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    site.status === "up" ? "bg-success" : site.status === "down" ? "bg-destructive animate-pulse" : "bg-warning"
                  )} />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{site.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{site.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-muted-foreground">Время отклика</p>
                    <p className="text-sm font-medium text-foreground">{site.responseTime > 0 ? `${site.responseTime}ms` : "—"}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Uptime</p>
                    <p className="text-sm font-medium text-foreground">{site.uptime}%</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Проверен</p>
                    <p className="text-sm font-medium text-foreground">{formatLastCheck(site.lastCheckAt)}</p>
                  </div>
                  <StatusBadge status={site.status} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSite(site)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSiteId(site.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Открыть сайт"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional info */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                {(() => {
                  const ssl = formatExpiryDate(site.sslExpiresAt);
                  return (
                    <span className={cn(ssl?.isExpired && "text-destructive", ssl?.isWarning && "text-warning")}>
                      SSL: {ssl ? ssl.text : "—"}
                    </span>
                  );
                })()}
                {(() => {
                  const domain = formatExpiryDate(site.domainExpiresAt);
                  return (
                    <span className={cn(domain?.isExpired && "text-destructive", domain?.isWarning && "text-warning")}>
                      Домен: {domain ? domain.text : "—"}
                    </span>
                  );
                })()}
                {site.httpStatusCode && (
                  <span>HTTP: {site.httpStatusCode}</span>
                )}
                {!site.isActive && (
                  <span className="text-warning">Мониторинг отключен</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <SiteModal
          title="Добавить мониторинг сайта"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSite}
        />
      )}

      {/* Edit Modal */}
      {editingSite && (
        <SiteModal
          title="Редактировать сайт"
          site={editingSite}
          onClose={() => setEditingSite(null)}
          onSubmit={(data) => handleUpdateSite(editingSite.id, data as UpdateSiteData)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingSiteId && (
        <DeleteConfirmModal
          onClose={() => setDeletingSiteId(null)}
          onConfirm={() => handleDeleteSite(deletingSiteId)}
        />
      )}
    </div>
  );
};

interface SiteModalProps {
  title: string;
  site?: Site;
  onClose: () => void;
  onSubmit: (data: CreateSiteData | UpdateSiteData) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
}

const SiteModal = ({ title, site, onClose, onSubmit }: SiteModalProps) => {
  const [name, setName] = useState(site?.name || "");
  const [url, setUrl] = useState(site?.url || "");
  const [isActive, setIsActive] = useState(site?.isActive ?? true);
  const [checkSsl, setCheckSsl] = useState(site?.checkSsl ?? true);
  const [checkDomain, setCheckDomain] = useState(site?.checkDomain ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: CreateSiteData | UpdateSiteData = {
      name,
      url,
      checkSsl,
      checkDomain,
      ...(site && { isActive }),
    };

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
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
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

            <div className="py-5 space-y-4">
              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checkSsl}
                    onChange={e => setCheckSsl(e.target.checked)}
                  />
                  <div className="w-10 h-5 rounded-full bg-secondary peer-checked:bg-primary transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-5"></div>
                </label>
                <span className="text-sm text-muted-foreground">Проверка SSL-сертификата</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checkDomain}
                    onChange={e => setCheckDomain(e.target.checked)}
                  />
                  <div className="w-10 h-5 rounded-full bg-secondary peer-checked:bg-primary transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-5"></div>
                </label>
                <span className="text-sm text-muted-foreground">Проверка домена</span>
              </div>
            </div>

            {site && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm text-foreground">
                  Мониторинг активен
                </label>
              </div>
            )}

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
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (site ? "Сохранить" : "Добавить")}
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

interface DeleteConfirmModalProps {
  onClose: () => void;
  onConfirm: () => Promise<{ success: boolean }>;
}

const DeleteConfirmModal = ({ onClose, onConfirm }: DeleteConfirmModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Удалить сайт?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Это действие нельзя отменить. Все данные мониторинга будут удалены.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Удалить"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
