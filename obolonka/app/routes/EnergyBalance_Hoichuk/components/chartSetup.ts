import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const baseLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false as const,
  interaction: { mode: "index" as const, intersect: false },
  elements: { point: { radius: 0 }, line: { tension: 0.25, borderWidth: 2 } },
  scales: { x: { ticks: { maxTicksLimit: 8, maxRotation: 0 } } },
};

export const COLORS = {
  solar: "#f59f00",
  wind: "#1c7ed6",
  consumption: "#e03131",
  grid: "#2f9e44",
  battery: "#7048e8",
};
