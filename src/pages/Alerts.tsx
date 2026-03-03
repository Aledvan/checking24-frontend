import { useEffect, useState } from "react";
import { api, Warning } from "@/lib/api";
import { ShieldAlert, Globe, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Alerts = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarnings = async () => {
      setLoading(true);
      setError(null);

      const response = await api.getWarnings();

      if (response.success && response.data) {
        setWarnings(response.data);
      } else {
        setError(response.error || "Не удалось загрузить предупреждения");
      }

      setLoading(false);
    };

    fetchWarnings();
  }, []);

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
        <h1 className="text-2xl font-bold text-foreground">Предупреждения</h1>
        <p className="text-muted-foreground text-sm mt-1">Сроки SSL-сертификатов и доменов</p>
      </div>

      {warnings.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-muted-foreground text-sm">Нет активных предупреждений</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {warnings.map(warning => (
            <div key={warning.id} className={cn(
              "bg-card rounded-xl border p-5",
              warning.daysLeft <= 7 ? "border-warning/40" : "border-border"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    warning.type === "ssl" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                  )}>
                    {warning.type === "ssl" ? <ShieldAlert className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{warning.siteName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {warning.type === "ssl" ? "SSL-сертификат" : "Домен"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    warning.daysLeft <= 7 ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                  )}>
                    {warning.daysLeft} {getDaysWord(warning.daysLeft)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Истекает: {warning.expiresAt}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getDaysWord(days: number): string {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "дней";
  }

  if (lastDigit === 1) {
    return "день";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  }

  return "дней";
}

export default Alerts;
