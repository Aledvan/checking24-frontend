import { useEffect, useState } from "react";
import { api, Incident } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Clock, AlertCircle, Loader2 } from "lucide-react";

const Incidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      setError(null);

      const response = await api.getIncidents();

      if (response.success && response.data) {
        setIncidents(response.data);
      } else {
        setError(response.error || "Не удалось загрузить инциденты");
      }

      setLoading(false);
    };

    fetchIncidents();
  }, []);

  const active = incidents.filter(i => !i.resolvedAt);
  const resolved = incidents.filter(i => i.resolvedAt);

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
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Инциденты</h1>
        <p className="text-muted-foreground text-sm mt-1">История падений и сбоев</p>
      </div>

      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Активные инциденты ({active.length})
          </h2>
          <div className="grid gap-3">
            {active.map(inc => (
              <div key={inc.id} className="bg-card rounded-xl border border-destructive/30 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{inc.siteName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.url}</p>
                    <p className="text-sm text-foreground mt-3">{inc.cause}</p>
                  </div>
                  <StatusBadge status="active" />
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Начало: {inc.startedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Решённые инциденты ({resolved.length})</h2>
        {resolved.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-5 text-center">
            <p className="text-muted-foreground text-sm">Нет решённых инцидентов</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {resolved.map(inc => (
              <div key={inc.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{inc.siteName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.url}</p>
                    <p className="text-sm text-foreground mt-3">{inc.cause}</p>
                  </div>
                  <StatusBadge status="resolved" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{inc.startedAt} — {inc.resolvedAt}</span>
                  {inc.duration && <span>Длительность: {inc.duration}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
