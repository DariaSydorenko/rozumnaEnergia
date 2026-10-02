import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import api from "./services/api";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const METRICS = {
  U: { label: "Напруга", unit: "В", color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  I: { label: "Струм", unit: "А", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  P: { label: "Потужність", unit: "Вт", color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
  T: { label: "Температура", unit: "°C", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

const EVENT_FILTERS = [
  ["all", "Усі"],
  ["accepted", "Прийняті"],
  ["rejected", "Відхилені"],
];

function StatTile({ label, value, unit }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-800">
        {value} <span className="text-base font-normal text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

function EventRow({ event }) {
  const accepted = event.status === "accepted";
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
        accepted ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      }`}
    >
      <div>
        <span className="font-semibold">{accepted ? "ПРИЙНЯТО" : "ВІДХИЛЕНО"}</span> #{event.seq} —{" "}
        {event.device}
        {!accepted && event.detail && <div className="text-xs opacity-75">{event.detail}</div>}
      </div>
      <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
        {event.t ? new Date(event.t).toLocaleTimeString("uk-UA") : ""}
      </div>
    </div>
  );
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TelemetrySecurity() {
  const [status, setStatus] = useState({ connectedDevices: [], totalAccepted: 0, totalRejected: 0 });
  const [telemetry, setTelemetry] = useState([]);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [chartMetric, setChartMetric] = useState("P");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [s, t, e] = await Promise.all([
          api.get("/status").then((r) => r.data),
          api.get("/telemetry").then((r) => r.data),
          api.get("/events").then((r) => r.data),
        ]);
        if (cancelled) return;
        setStatus(s);
        setTelemetry(t);
        setEvents(e);
        setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    poll();
    const id = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function handleReset() {
    setResetting(true);
    try {
      await api.post("/reset");
    } catch {
      setConnected(false);
    } finally {
      setResetting(false);
    }
  }

  function handleExport(format) {
    const data = events.slice().reverse();
    if (format === "csv") {
      const header = "time,status,device,seq,detail";
      const rows = data.map((e) =>
        [
          e.t ? new Date(e.t).toISOString() : "",
          e.status,
          e.device,
          e.seq,
          `"${(e.detail || "").replace(/"/g, '""')}"`,
        ].join(",")
      );
      downloadBlob([header, ...rows].join("\n"), "text/csv;charset=utf-8", "telemetry-events.csv");
    } else {
      downloadBlob(JSON.stringify(data, null, 2), "application/json", "telemetry-events.json");
    }
  }

  const last = telemetry[telemetry.length - 1];
  const metric = METRICS[chartMetric];
  const filteredEvents = events.filter((e) => eventFilter === "all" || e.status === eventFilter);

  const chartData = {
    labels: telemetry.map((p) => new Date(p.t).toLocaleTimeString("uk-UA")),
    datasets: [
      {
        label: `${metric.label} (${metric.unit})`,
        data: telemetry.map((p) => p[chartMetric]),
        borderColor: metric.color,
        backgroundColor: metric.bg,
        tension: 0.25,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Захист телеметрії — панель моніторингу</h1>
      <p className="text-gray-500 mb-4">
        ECDH (P-256) + AES-256-GCM + ECDSA-SHA256 · криптографічний захист телеметричних даних
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-full shadow px-4 py-1.5 text-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
          {connected ? "Підключено до шлюзу" : "Немає з'єднання з шлюзом"}
        </div>
        <div className="bg-white rounded-full shadow px-4 py-1.5 text-sm">
          Пристрої: <strong>{status.connectedDevices.length}</strong>
        </div>
        <div className="bg-white rounded-full shadow px-4 py-1.5 text-sm">
          Прийнято: <strong className="text-emerald-600">{status.totalAccepted}</strong>
        </div>
        <div className="bg-white rounded-full shadow px-4 py-1.5 text-sm">
          Відхилено: <strong className="text-red-600">{status.totalRejected}</strong>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="ml-auto bg-white rounded-full shadow px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {resetting ? "Скидання..." : "Скинути лічильники"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Напруга" value={last ? last.U.toFixed(1) : "—"} unit="В" />
        <StatTile label="Струм" value={last ? last.I.toFixed(2) : "—"} unit="А" />
        <StatTile label="Потужність" value={last ? last.P.toFixed(1) : "—"} unit="Вт" />
        <StatTile label="Температура" value={last ? last.T.toFixed(1) : "—"} unit="°C" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700">{metric.label} у часі</h2>
            <div className="flex gap-1">
              {Object.entries(METRICS).map(([key, m]) => (
                <button
                  key={key}
                  onClick={() => setChartMetric(key)}
                  className={`px-2 py-1 text-xs rounded ${
                    chartMetric === key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <Line data={chartData} options={{ animation: false, responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700">Стрічка подій</h2>
            <div className="flex gap-1 items-center flex-wrap">
              {EVENT_FILTERS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setEventFilter(key)}
                  className={`px-2 py-1 text-xs rounded ${
                    eventFilter === key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="text-gray-300 mx-1">|</span>
              <button
                onClick={() => handleExport("csv")}
                className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                JSON
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <div className="text-gray-400 text-sm">
                {events.length === 0 ? "Очікування даних від пристрою..." : "Немає подій за цим фільтром"}
              </div>
            ) : (
              filteredEvents
                .slice()
                .reverse()
                .map((e, i) => <EventRow key={i} event={e} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
