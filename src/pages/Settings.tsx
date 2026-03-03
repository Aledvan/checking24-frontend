import { useState, useEffect } from "react";
import { User, Bell, Shield, Loader2, Check } from "lucide-react";
import { api, User as UserType } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

const SettingsPage = () => {
  usePageTitle("Настройки");
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const response = await api.getMe();
    if (response.success && response.data) {
      setUser(response.data);
      setName(response.data.name || "");
      setEmail(response.data.email);
    }
    setLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    const response = await api.updateProfile({ name, email });

    if (response.success && response.data) {
      setUser(response.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      setProfileError(response.error || "Не удалось сохранить профиль");
    }

    setProfileSaving(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
      setPasswordSaving(false);
      return;
    }

    const response = await api.changePassword(currentPassword, newPassword);

    if (response.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(response.error || "Не удалось изменить пароль");
    }

    setPasswordSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground text-sm mt-1">Управление профилем и уведомлениями</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Профиль</h2>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="text-sm text-success flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Профиль сохранён
                </p>
              )}
              <button
                type="submit"
                disabled={profileSaving}
                className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Сохранить
              </button>
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Уведомления</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Email-уведомления при падении", defaultChecked: true },
              { label: "Уведомления об истечении SSL", defaultChecked: true },
              { label: "Еженедельный отчёт", defaultChecked: false },
            ].map(item => (
              <label key={item.label} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">{item.label}</span>
                <div className="relative">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full bg-secondary peer-checked:bg-primary transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Безопасность</h2>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Текущий пароль</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  minLength={6}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-success flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Пароль изменён
                </p>
              )}
              <button
                type="submit"
                disabled={passwordSaving}
                className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Обновить пароль
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
