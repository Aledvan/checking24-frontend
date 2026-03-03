export interface Site {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "warning";
  uptime: number;
  responseTime: number;
  lastCheck: string;
  sslExpiry?: string;
  domainExpiry?: string;
}

export interface Incident {
  id: string;
  siteId: string;
  siteName: string;
  url: string;
  startedAt: string;
  resolvedAt?: string;
  duration?: string;
  cause: string;
}

export interface Alert {
  id: string;
  siteId: string;
  siteName: string;
  type: "ssl" | "domain";
  expiryDate: string;
  daysLeft: number;
}

export const sites: Site[] = [
  { id: "1", name: "Production API", url: "https://api.example.com", status: "up", uptime: 99.98, responseTime: 142, lastCheck: "2 мин назад" },
  { id: "2", name: "Web App", url: "https://app.example.com", status: "up", uptime: 99.95, responseTime: 203, lastCheck: "1 мин назад" },
  { id: "3", name: "Landing Page", url: "https://example.com", status: "down", uptime: 98.5, responseTime: 0, lastCheck: "30 сек назад" },
  { id: "4", name: "CDN", url: "https://cdn.example.com", status: "up", uptime: 100, responseTime: 45, lastCheck: "1 мин назад" },
  { id: "5", name: "Blog", url: "https://blog.example.com", status: "warning", uptime: 99.8, responseTime: 890, lastCheck: "3 мин назад" },
  { id: "6", name: "Auth Service", url: "https://auth.example.com", status: "up", uptime: 99.99, responseTime: 98, lastCheck: "1 мин назад" },
];

export const incidents: Incident[] = [
  { id: "1", siteId: "3", siteName: "Landing Page", url: "https://example.com", startedAt: "2026-02-27 14:23", cause: "Сервер не отвечает (HTTP 503)" },
  { id: "2", siteId: "2", siteName: "Web App", url: "https://app.example.com", startedAt: "2026-02-26 09:15", resolvedAt: "2026-02-26 09:42", duration: "27 мин", cause: "Таймаут соединения" },
  { id: "3", siteId: "5", siteName: "Blog", url: "https://blog.example.com", startedAt: "2026-02-25 18:00", resolvedAt: "2026-02-25 18:15", duration: "15 мин", cause: "Высокое время отклика (>2000ms)" },
  { id: "4", siteId: "1", siteName: "Production API", url: "https://api.example.com", startedAt: "2026-02-20 03:10", resolvedAt: "2026-02-20 03:22", duration: "12 мин", cause: "SSL handshake error" },
];

export const alerts: Alert[] = [
  { id: "1", siteId: "3", siteName: "Landing Page", type: "ssl", expiryDate: "2026-03-15", daysLeft: 16 },
  { id: "2", siteId: "5", siteName: "Blog", type: "domain", expiryDate: "2026-04-01", daysLeft: 33 },
  { id: "3", siteId: "2", siteName: "Web App", type: "ssl", expiryDate: "2026-03-28", daysLeft: 29 },
];
