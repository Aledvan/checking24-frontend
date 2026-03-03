import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

const Recover = () => {
  usePageTitle("Восстановление пароля");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await api.forgotPassword(email);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || "Ошибка отправки");
      }
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.forgotPassword(email);
      if (!result.success) {
        setError(result.error || "Ошибка отправки");
      }
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.svg" alt="Checking24" className="w-10 h-10" />
          <span className="text-2xl font-bold text-foreground tracking-tight">Checking24</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-xl font-semibold text-foreground">Восстановление пароля</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Введите email, и мы отправим инструкцию по сбросу пароля
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Отправка..." : "Отправить инструкцию"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Письмо отправлено</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Мы отправили инструкцию по сбросу пароля на{" "}
                <span className="text-foreground font-medium">{email}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Не получили письмо?{" "}
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Отправка..." : "Отправить повторно"}
                </button>
              </p>
            </div>
          )}

          {/* Back to login link */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к входу
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Checking24. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default Recover;
