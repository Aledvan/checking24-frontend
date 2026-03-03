import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Недействительная ссылка подтверждения");
        setIsLoading(false);
        return;
      }

      try {
        const result = await api.verifyEmail(token);

        if (result.success) {
          setIsSuccess(true);
        } else {
          setError(result.error || "Ошибка подтверждения email");
        }
      } catch {
        setError("Ошибка сети. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.svg" alt="Checking24" className="w-10 h-10" />
          <span className="text-2xl font-bold text-foreground tracking-tight">Checking24</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          {isLoading ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Подтверждение email</h2>
              <p className="text-sm text-muted-foreground">
                Пожалуйста, подождите...
              </p>
            </>
          ) : isSuccess ? (
            <>
              <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Email подтверждён!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Ваш email адрес успешно подтверждён. Теперь вы можете пользоваться всеми функциями сервиса.
              </p>
              <Link
                to="/dashboard"
                className="inline-block w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Перейти в панель управления
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Ошибка подтверждения</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {error || "Ссылка недействительна или срок её действия истёк."}
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Вернуться к входу
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Checking24. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
