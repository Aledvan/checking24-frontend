import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "up" | "down" | "warning" | "resolved" | "active";
}

const config = {
  up: { label: "Работает", className: "bg-success/15 text-success" },
  down: { label: "Не работает", className: "bg-destructive/15 text-destructive" },
  warning: { label: "Предупреждение", className: "bg-warning/15 text-warning" },
  resolved: { label: "Решён", className: "bg-success/15 text-success" },
  active: { label: "Активен", className: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "up" || status === "resolved" ? "bg-success" : status === "down" || status === "active" ? "bg-destructive animate-pulse-dot" : "bg-warning")} />
      {label}
    </span>
  );
}
