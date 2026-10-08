import { useState } from "react";
import { getHistory } from "../api";
import { ErrorAlert, PageHeader, Spinner } from "../components/ui";
import { formatDateTime, formatNumber } from "../format";
import { useLoad } from "../hooks";
import type { HistoryPeriod } from "../types";

const PER_PAGE = 20;

const PERIODS: { value: HistoryPeriod; label: string }[] = [
  { value: "24h", label: "Останні 24 години" },
  { value: "7d", label: "Останні 7 днів" },
  { value: "30d", label: "Останні 30 днів" },
  { value: "all", label: "Увесь час" },
];

export function meta() {
  return [{ title: "EnergyBalance — Історія" }];
}

/** Номери сторінок навколо поточної, з пропусками (null = «…»). */
function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(null);
    result.push(p);
  });
  return result;
}

export default function HistoryPage() {
  const [period, setPeriod] = useState<HistoryPeriod>("24h");
  const [page, setPage] = useState(1);
  const { data, error, loading } = useLoad(() => getHistory(page, PER_PAGE, period), [page, period]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <>
      <PageHeader title="Історичні дані" subtitle="Записи генерації, споживання та заряду акумулятора" />

      <div className="eb-card">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
            <label htmlFor="history-period" className="form-label mb-0">Період:</label>
            <select
              id="history-period"
              className="form-select w-auto"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as HistoryPeriod);
                setPage(1);
              }}
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {data && <span className="text-muted ms-auto">Записів: {data.total}</span>}
          </div>

          <ErrorAlert message={error} />
          {loading && !data && <Spinner />}

          {data && data.records.length === 0 && <p className="text-muted mb-0">Немає даних для відображення.</p>}

          {data && data.records.length > 0 && (
            <div className="table-responsive" style={{ maxHeight: 560, opacity: loading ? 0.6 : 1 }}>
              <table className="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Дата та час</th>
                    <th className="text-end">Сонячна, Вт</th>
                    <th className="text-end">Вітрова, Вт</th>
                    <th className="text-end">Споживання, Вт</th>
                    <th className="text-end">Заряд, %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((r) => (
                    <tr key={r.timestamp}>
                      <td>{formatDateTime(r.timestamp)}</td>
                      <td className="text-end">{formatNumber(r.solar_power)}</td>
                      <td className="text-end">{formatNumber(r.wind_power)}</td>
                      <td className="text-end">{formatNumber(r.consumption)}</td>
                      <td className="text-end">{formatNumber(r.battery_level)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && totalPages > 1 && (
            <nav className="mt-3" aria-label="Сторінки історії">
              <ul className="pagination justify-content-center mb-0 flex-wrap">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)} aria-label="Попередня">«</button>
                </li>
                {pageWindow(page, totalPages).map((p, i) =>
                  p === null ? (
                    <li className="page-item disabled" key={`gap-${i}`}><span className="page-link">…</span></li>
                  ) : (
                    <li className={`page-item ${p === page ? "active" : ""}`} key={p}>
                      <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                    </li>
                  ),
                )}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)} aria-label="Наступна">»</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
