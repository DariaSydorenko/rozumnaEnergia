import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Thermometer,
  CloudSun,
  Snowflake,
  Flame,
  Power,
  Wifi,
  WifiOff,
  Clock3,
  RefreshCw,
} from "lucide-react";

import { useClimateControl } from "./hooks/useClimateControl";


function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


function StatusCard({
  icon,
  title,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          color: "#64748b",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}15`,
            color: accent,
          }}
        >
          {icon}
        </div>

        {title}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#0f172a",
          lineHeight: 1.1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              marginLeft: 5,
              fontSize: 16,
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}


export default function ClimateControl() {
  const {
    status,
    temperatureHistory,
    controlHistory,
    mpcForecast,
    historyHours,
    loading,
    error,
    refreshStatus,
    changeHistoryHours,
    setSystemEnabled,
    setTargetTemperature,
  } = useClimateControl();

  const [targetTemperatureInput, setTargetTemperatureInput] =
    useState<string>("");

  const [settingsLoading, setSettingsLoading] = useState(false);

  const handleTargetTemperatureChange = async () => {
    const value = Number.parseFloat(targetTemperatureInput);

    if (!Number.isFinite(value)) {
      return;
    }

    try {
      setSettingsLoading(true);

      await setTargetTemperature(value);

      setTargetTemperatureInput("");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSystemToggle = async () => {
    if (!status) {
      return;
    }

    try {
      setSettingsLoading(true);

      await setSystemEnabled(!status.system_enabled);
    } finally {
      setSettingsLoading(false);
    }
  };

  const temperatureChartData = temperatureHistory.map((point) => ({
    time: formatTime(point.time),
    temperature: point.temperature,
  }));

  const controlChartData = controlHistory.map((point) => ({
    time: formatTime(point.time),
    heater_power: point.heater_power * 100,
    temperature: point.temperature,
    target_temperature: point.target_temperature,
  }));

  const forecastChartData = mpcForecast.map((point) => ({
    time: `+${point.step} хв`,
    temperature: point.temperature,
  }));

  const currentHeaterPower = status
    ? status.heater_power * 100
    : 0;

  const systemEnabled = status?.system_enabled ?? false;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        padding: "28px 20px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              SMART ENERGY LAB
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              Адаптивний клімат-контроль
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Моніторинг приміщення та адаптивне керування температурою
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
            }}
          >
            {status?.mqtt_connected ? (
              <Wifi size={18} color="#16a34a" />
            ) : (
              <WifiOff size={18} color="#dc2626" />
            )}

            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: status?.mqtt_connected
                  ? "#166534"
                  : "#991b1b",
              }}
            >
              {status?.mqtt_connected
                ? "MQTT підключено"
                : "MQTT недоступний"}
            </span>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              color: "#991b1b",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !status ? (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 16,
            }}
          >
            Завантаження даних системи...
          </div>
        ) : (
          <>
            {/* Status cards */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <StatusCard
                icon={<Thermometer size={20} />}
                title="Температура в приміщенні"
                value={
                  status?.temperature !== null &&
                  status?.temperature !== undefined
                    ? status.temperature.toFixed(1)
                    : "—"
                }
                unit="°C"
                accent="#2563eb"
              />

              <StatusCard
                icon={<CloudSun size={20} />}
                title="Зовнішня температура"
                value={
                  status?.outdoor_temperature !== null &&
                  status?.outdoor_temperature !== undefined
                    ? status.outdoor_temperature.toFixed(1)
                    : "—"
                }
                unit="°C"
                accent="#0891b2"
              />

              <StatusCard
                icon={<Flame size={20} />}
                title="Потужність нагрівача"
                value={currentHeaterPower.toFixed(1)}
                unit="%"
                accent="#ea580c"
              />

              <StatusCard
                icon={<Snowflake size={20} />}
                title="Уставка"
                value={
                  status
                    ? status.target_temperature.toFixed(1)
                    : "—"
                }
                unit="°C"
                accent="#7c3aed"
              />
            </section>

            {/* Control panel */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    Керування системою
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    Система{" "}
                    <span
                      style={{
                        color: systemEnabled
                          ? "#16a34a"
                          : "#dc2626",
                      }}
                    >
                      {systemEnabled ? "увімкнена" : "вимкнена"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={handleSystemToggle}
                    disabled={settingsLoading}
                    style={{
                      minWidth: 150,
                      padding: "11px 18px",
                      border: "none",
                      borderRadius: 10,
                      background: systemEnabled
                        ? "#dc2626"
                        : "#16a34a",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: settingsLoading
                        ? "not-allowed"
                        : "pointer",
                      opacity: settingsLoading ? 0.6 : 1,
                    }}
                  >
                    <Power
                      size={16}
                      style={{
                        verticalAlign: "middle",
                        marginRight: 7,
                      }}
                    />
                    {systemEnabled
                      ? "Вимкнути систему"
                      : "Увімкнути систему"}
                  </button>

                  <button
                    onClick={() => refreshStatus()}
                    disabled={loading}
                    style={{
                      width: 42,
                      height: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #dbe1e8",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                    title="Оновити статус"
                  >
                    <RefreshCw size={17} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  height: 1,
                  background: "#eef2f7",
                  margin: "20px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label
                    htmlFor="target-temperature"
                    style={{
                      display: "block",
                      marginBottom: 7,
                      fontSize: 13,
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    Нова уставка температури
                  </label>

                  <input
                    id="target-temperature"
                    type="number"
                    step="0.1"
                    value={targetTemperatureInput}
                    onChange={(event) =>
                      setTargetTemperatureInput(
                        event.target.value
                      )
                    }
                    placeholder={
                      status
                        ? status.target_temperature.toFixed(1)
                        : "22.0"
                    }
                    style={{
                      width: 180,
                      padding: "11px 12px",
                      border: "1px solid #dbe1e8",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  onClick={handleTargetTemperatureChange}
                  disabled={
                    settingsLoading ||
                    targetTemperatureInput.trim() === ""
                  }
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: 10,
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor:
                      settingsLoading ||
                      targetTemperatureInput.trim() === ""
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      settingsLoading ||
                      targetTemperatureInput.trim() === ""
                        ? 0.6
                        : 1,
                  }}
                >
                  Застосувати
                </button>
              </div>
            </section>

            {/* Temperature history */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Історія температури
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    Фактична температура приміщення
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: 4,
                    background: "#f1f5f9",
                    borderRadius: 10,
                  }}
                >
                  {[1, 6, 24].map((hours) => (
                    <button
                      key={hours}
                      onClick={() =>
                        changeHistoryHours(hours)
                      }
                      style={{
                        padding: "8px 13px",
                        border: "none",
                        borderRadius: 8,
                        background:
                          historyHours === hours
                            ? "#ffffff"
                            : "transparent",
                        color:
                          historyHours === hours
                            ? "#0f172a"
                            : "#64748b",
                        boxShadow:
                          historyHours === hours
                            ? "0 1px 4px rgba(15,23,42,0.08)"
                            : "none",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {hours} год
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                {temperatureChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={temperatureChartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="time"
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                      />

                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                        unit="°C"
                      />

                      <Tooltip />

                      {status && (
                        <ReferenceLine
                          y={status.target_temperature}
                          stroke="#7c3aed"
                          strokeDasharray="5 5"
                          label={{
                            value: "Уставка",
                            position: "insideTopRight",
                            fill: "#7c3aed",
                            fontSize: 11,
                          }}
                        />
                      )}

                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={false}
                        name="Температура"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage text="Історія температури відсутня" />
                )}
              </div>
            </section>

            {/* MPC Forecast */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Прогноз температури MPC
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  Прогнозована температура приміщення на горизонті
                  керування
                </p>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                {forecastChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastChartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="time"
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                      />

                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                        unit="°C"
                      />

                      <Tooltip />

                      {status && (
                        <ReferenceLine
                          y={status.target_temperature}
                          stroke="#7c3aed"
                          strokeDasharray="5 5"
                          label={{
                            value: "Уставка",
                            position: "insideTopRight",
                            fill: "#7c3aed",
                            fontSize: 11,
                          }}
                        />
                      )}

                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#16a34a"
                        strokeWidth={2.5}
                        dot={false}
                        name="Прогноз MPC"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage text="Прогноз MPC недоступний" />
                )}
              </div>
            </section>

            {/* Control history */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  marginBottom: 18,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Керування нагрівачем
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  Потужність нагрівача та фактична температура
                </p>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                {controlChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={controlChartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="heaterPowerGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ea580c"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="#ea580c"
                            stopOpacity={0.03}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="time"
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                      />

                      <YAxis
                        yAxisId="power"
                        domain={[0, 100]}
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                        unit="%"
                      />

                      <YAxis
                        yAxisId="temperature"
                        orientation="right"
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                        }}
                        unit="°C"
                      />

                      <Tooltip />

                      <Area
                        yAxisId="power"
                        type="monotone"
                        dataKey="heater_power"
                        stroke="#ea580c"
                        strokeWidth={2}
                        fill="url(#heaterPowerGradient)"
                        name="Нагрівач"
                      />

                      <Line
                        yAxisId="temperature"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        name="Температура"
                      />

                      <Line
                        yAxisId="temperature"
                        type="monotone"
                        dataKey="target_temperature"
                        stroke="#7c3aed"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Уставка"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage text="Історія керування відсутня" />
                )}
              </div>
            </section>

            {/* Footer information */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <InfoCard
                icon={<Power size={18} />}
                title="Стан системи"
                value={
                  systemEnabled
                    ? "Увімкнена"
                    : "Вимкнена"
                }
                valueColor={
                  systemEnabled
                    ? "#16a34a"
                    : "#dc2626"
                }
              />

              <InfoCard
                icon={<Flame size={18} />}
                title="Поточне керування"
                value={`${currentHeaterPower.toFixed(1)} %`}
                valueColor="#ea580c"
              />

              <InfoCard
                icon={<Clock3 size={18} />}
                title="Останнє оновлення"
                value={
                  status?.last_update
                    ? formatTime(status.last_update)
                    : "—"
                }
                valueColor="#2563eb"
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}


function EmptyChartMessage({ text }: { text: string }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontSize: 14,
        border: "1px dashed #cbd5e1",
        borderRadius: 12,
        background: "#f8fafc",
      }}
    >
      {text}
    </div>
  );
}


function InfoCard({
  icon,
  title,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 3px 12px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          color: valueColor,
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            marginBottom: 3,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: valueColor,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}