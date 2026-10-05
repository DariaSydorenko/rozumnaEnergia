import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { NavLink, Outlet } from "react-router";

const LINKS = [
  { to: "/energy-balance-hoichuk", label: "Головна панель", end: true },
  { to: "/energy-balance-hoichuk/current", label: "Поточні дані" },
  { to: "/energy-balance-hoichuk/history", label: "Історія" },
  { to: "/energy-balance-hoichuk/analytics", label: "Аналітика" },
  { to: "/energy-balance-hoichuk/settings", label: "Налаштування" },
];

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="rgba(255,255,255,0.2)" />
      <path d="M17.5 4 8 18h6.5L13 28l11-15h-7z" fill="#fff" />
    </svg>
  );
}

export default function EnergyBalanceApp() {
  return (
    <div className="eb-app">
      <header className="eb-header">
        <div className="container py-3 d-flex flex-wrap align-items-center gap-3">
          <div className="eb-brand">
            <Logo />
            EnergyBalance
            <span className="eb-live">Онлайн</span>
          </div>
          <nav className="eb-tabs me-auto" aria-label="Розділи EnergyBalance">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `eb-tab ${isActive ? "active" : ""}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <NavLink to="/" className="eb-back">← До головного меню</NavLink>
        </div>
      </header>
      <main className="container py-4 pb-5">
        <Outlet />
      </main>
    </div>
  );
}
