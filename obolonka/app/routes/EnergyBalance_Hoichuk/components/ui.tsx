import type { CSSProperties, ReactNode } from "react";

export const ACCENT = {
  solar: "#f59f00",
  wind: "#1c7ed6",
  load: "#e03131",
  grid: "#2f9e44",
  battery: "#7048e8",
  neutral: "#1f9d63",
} as const;

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="eb-page-title">{title}</h1>
      {subtitle && <p className="eb-page-sub">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  tone,
  accent = ACCENT.neutral,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "positive" | "negative";
  accent?: string;
  icon?: string;
}) {
  return (
    <div className="eb-card eb-stat" style={{ "--eb-accent": accent } as CSSProperties}>
      <div className="eb-stat-top">
        <span className="eb-stat-label">{label}</span>
        {icon && <span className="eb-stat-icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className={`eb-stat-value ${tone ?? ""}`}>
        {value}
        {unit && <span className="eb-stat-unit">{unit}</span>}
      </div>
    </div>
  );
}

export function BatteryGauge({ percent, threshold, alertsEnabled }: { percent: number; threshold: number; alertsEnabled: boolean }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const level = clamped < threshold ? "low" : clamped < 50 ? "mid" : "ok";
  return (
    <div className="eb-card eb-battery">
      <div className="d-flex justify-content-between align-items-start">
        <span className="eb-stat-label">Заряд акумулятора</span>
        <span className="eb-stat-icon" style={{ "--eb-accent": ACCENT.battery } as CSSProperties} aria-hidden="true">🔋</span>
      </div>
      <div className="eb-battery-percent">{clamped.toLocaleString("uk-UA", { maximumFractionDigits: 1 })}%</div>
      <div
        className="eb-battery-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label="Заряд акумулятора"
      >
        <div className={`eb-battery-fill ${level}`} style={{ width: `${clamped}%` }} />
        {alertsEnabled && <div className="eb-battery-mark" style={{ left: `${threshold}%` }} title={`Поріг попередження: ${threshold}%`} />}
      </div>
      <div className="eb-battery-note">
        {alertsEnabled ? `Чорна позначка — поріг попередження (${threshold}%)` : "Попередження про низький заряд вимкнено"}
      </div>
    </div>
  );
}

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger" role="alert">
      {message}
    </div>
  );
}

export function Spinner({ text = "Завантаження…" }: { text?: string }) {
  return (
    <div className="text-muted py-3">
      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
      {text}
    </div>
  );
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="eb-card h-100 p-3 p-md-4">
      <h2 className="eb-chart-title">{title}</h2>
      <div style={{ height: 260 }}>{children}</div>
    </div>
  );
}
