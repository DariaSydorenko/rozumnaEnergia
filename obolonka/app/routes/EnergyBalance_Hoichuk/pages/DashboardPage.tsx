import { Line } from "react-chartjs-2";
import { getCurrent, getLive } from "../api";
import { baseLineOptions, COLORS } from "../components/chartSetup";
import { ACCENT, BatteryGauge, ChartCard, ErrorAlert, PageHeader, Spinner, StatCard } from "../components/ui";
import { describeBatteryAction, describeGrid, formatNumber, formatShortTime } from "../format";
import { usePolling } from "../hooks";
import { LIVE_POLL_MS } from "../local_consts";

const fetchDashboard = () => Promise.all([getLive(60), getCurrent()]);

export function meta() {
  return [{ title: "EnergyBalance — Головна панель" }];
}

export default function DashboardPage() {
  const { data, error } = usePolling(fetchDashboard, LIVE_POLL_MS);

  if (!data) return error ? <ErrorAlert message={error} /> : <Spinner />;

  const [records, current] = data;
  const labels = records.map((r) => formatShortTime(r.timestamp));
  const line = (label: string, key: keyof (typeof records)[number], color: string) => ({
    label,
    data: records.map((r) => r[key] as number),
    borderColor: color,
    backgroundColor: color,
  });

  return (
    <>
      <PageHeader title="Головна панель" subtitle="Генерація, споживання та стан акумулятора в реальному часі" />
      <ErrorAlert message={error} />
      {current.low_battery && (
        <div className="alert alert-warning" role="alert">
          Увага: заряд акумулятора ({formatNumber(current.battery_level)}%) нижчий за поріг {current.alert_threshold}%.
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-4">
          <BatteryGauge percent={current.battery_level} threshold={current.alert_threshold} alertsEnabled={current.alerts_enabled} />
        </div>
        <div className="col-12 col-lg-8">
          <ChartCard title="Заряд акумулятора, %">
            <Line
              options={{ ...baseLineOptions, scales: { ...baseLineOptions.scales, y: { min: 0, max: 100 } } }}
              data={{ labels, datasets: [{ ...line("Заряд", "battery_level", COLORS.battery), fill: true, backgroundColor: "rgba(112,72,232,0.15)" }] }}
            />
          </ChartCard>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-6">
          <ChartCard title="Генерація та споживання, Вт">
            <Line
              options={baseLineOptions}
              data={{
                labels,
                datasets: [
                  line("Сонячна генерація", "solar_power", COLORS.solar),
                  line("Вітрова генерація", "wind_power", COLORS.wind),
                  line("Споживання", "consumption", COLORS.consumption),
                ],
              }}
            />
          </ChartCard>
        </div>
        <div className="col-12 col-xl-6">
          <ChartCard title="Взаємодія з мережею та акумулятором, Вт">
            <Line
              options={baseLineOptions}
              data={{
                labels,
                datasets: [
                  line("Мережа (+ віддача / − споживання)", "grid_power", COLORS.grid),
                  line("Акумулятор (+ заряд / − розряд)", "battery_action", COLORS.battery),
                ],
              }}
            />
          </ChartCard>
        </div>
      </div>

      <h2 className="eb-section-title">Поточні показники</h2>
      <div className="row g-3">
        <div className="col-6 col-lg-3"><StatCard label="Сонячна генерація" value={formatNumber(current.solar_power)} unit="Вт" accent={ACCENT.solar} icon="☀️" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Вітрова генерація" value={formatNumber(current.wind_power)} unit="Вт" accent={ACCENT.wind} icon="💨" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Споживання" value={formatNumber(current.consumption)} unit="Вт" accent={ACCENT.load} icon="🏠" /></div>
        <div className="col-6 col-lg-3">
          <StatCard
            label="Потік у мережу"
            value={formatNumber(current.grid_power)}
            unit="Вт"
            tone={current.grid_power >= 0 ? "positive" : "negative"}
            accent={ACCENT.grid}
            icon="🔌"
          />
        </div>
      </div>
      <p className="text-muted small mt-3 mb-0">
        {describeBatteryAction(current.battery_action)} · {describeGrid(current)}
      </p>
    </>
  );
}
