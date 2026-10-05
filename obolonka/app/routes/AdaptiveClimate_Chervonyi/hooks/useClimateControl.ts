import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getStatus,
  getTemperatureHistory,
  getControlHistory,
  getMpcForecast,
  updateSettings,
} from "../api";

import type {
  ClimateStatus,
  TemperatureHistoryPoint,
  ControlHistoryPoint,
  MpcForecastPoint,
  SystemSettings,
} from "../types";


const STATUS_UPDATE_INTERVAL = 5000;
const HISTORY_UPDATE_INTERVAL = 10000;
const FORECAST_UPDATE_INTERVAL = 10000;

const DEFAULT_HISTORY_HOURS = 1;


// Максимальна кількість локальних точок OFF.
// Потрібна тільки для того, щоб локальний масив не зростав безмежно.
const MAX_LOCAL_OFF_POINTS = 1000;


export function useClimateControl() {
  // Поточний стан системи
  const [status, setStatus] = useState<ClimateStatus | null>(null);

  // Історія температури
  const [temperatureHistory, setTemperatureHistory] = useState<
    TemperatureHistoryPoint[]
  >([]);

  // Історія керування з backend
  const [controlHistory, setControlHistory] = useState<
    ControlHistoryPoint[]
  >([]);

  // Локальні точки керування під час OFF
  const [localOffControlHistory, setLocalOffControlHistory] = useState<
    ControlHistoryPoint[]
  >([]);

  // Прогноз температури від MPC
  const [mpcForecast, setMpcForecast] = useState<
    MpcForecastPoint[]
  >([]);

  // Період історії
  const [historyHours, setHistoryHours] = useState(
    DEFAULT_HISTORY_HOURS
  );

  // Стан завантаження
  const [loading, setLoading] = useState(true);

  // Помилка API
  const [error, setError] = useState<string | null>(null);


  // Додавання локальної точки 0% при вимкненій системі
  const addLocalOffPoint = useCallback(
    (currentStatus: ClimateStatus) => {
      // Поки система увімкнена — нічого не додаємо
      if (
        currentStatus.system_enabled ||
        !currentStatus.last_update
      ) {
        return;
      }

      const newPoint: ControlHistoryPoint = {
        time: currentStatus.last_update,
        heater_power: 0,
        temperature: currentStatus.temperature ?? 0,
        target_temperature: currentStatus.target_temperature,
      };

      setLocalOffControlHistory((previous) => {
        // Не додаємо повторно ту саму часову точку
        const lastPoint = previous[previous.length - 1];

        if (lastPoint?.time === newPoint.time) {
          return previous;
        }

        const updated = [
          ...previous,
          newPoint,
        ];

        // Захист від надмірного накопичення точок
        return updated.slice(-MAX_LOCAL_OFF_POINTS);
      });
    },
    []
  );


  // Повна історія для відображення на графіку
  //
  // Об'єднуємо:
  // 1. реальні дані з backend
  // 2. локальні точки 0% під час OFF
  const displayedControlHistory = [
    ...controlHistory,
    ...localOffControlHistory,
  ]
    .sort(
      (a, b) =>
        new Date(a.time).getTime() -
        new Date(b.time).getTime()
    )
    .filter((point, index, array) => {
      // При однаковому timestamp залишаємо тільки останню точку
      return (
        index === 0 ||
        point.time !== array[index - 1].time
      );
    });


  // Оновлення поточного статусу
  const refreshStatus = useCallback(async () => {
    const data = await getStatus();

    setStatus(data);

    // Якщо система OFF — додаємо точку 0%
    addLocalOffPoint(data);
  }, [addLocalOffPoint]);


  // Оновлення історії
  const refreshHistory = useCallback(async () => {
    const [
      temperatureData,
      controlData,
    ] = await Promise.all([
      getTemperatureHistory(historyHours),
      getControlHistory(historyHours),
    ]);

    setTemperatureHistory(temperatureData);
    setControlHistory(controlData);
  }, [historyHours]);


  // Оновлення прогнозу MPC
  const refreshForecast = useCallback(async () => {
    const data = await getMpcForecast();

    setMpcForecast(data);
  }, []);


  // Повне початкове завантаження
  const loadData = useCallback(async () => {
    try {
      setError(null);

      await Promise.all([
        refreshStatus(),
        refreshHistory(),
        refreshForecast(),
      ]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Не вдалося отримати дані від сервера";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    refreshStatus,
    refreshHistory,
    refreshForecast,
  ]);


  // Початкове завантаження
  // та періодичне оновлення статусу
  useEffect(() => {
    loadData();

    const interval = window.setInterval(() => {
      refreshStatus().catch((err) => {
        console.error(
          "Status update error:",
          err
        );
      });
    }, STATUS_UPDATE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    loadData,
    refreshStatus,
  ]);


  // Періодичне оновлення історії
  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshHistory().catch((err) => {
        console.error(
          "History update error:",
          err
        );
      });
    }, HISTORY_UPDATE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshHistory]);


  // Періодичне оновлення прогнозу
  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshForecast().catch((err) => {
        console.error(
          "Forecast update error:",
          err
        );
      });
    }, FORECAST_UPDATE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshForecast]);


  // Зміна періоду історії
  const changeHistoryHours = useCallback(
    async (hours: number) => {
      try {
        setError(null);

        setHistoryHours(hours);

        const [
          temperatureData,
          controlData,
        ] = await Promise.all([
          getTemperatureHistory(hours),
          getControlHistory(hours),
        ]);

        setTemperatureHistory(
          temperatureData
        );

        setControlHistory(
          controlData
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Не вдалося отримати історію";

        setError(message);
      }
    },
    []
  );


  // Зміна налаштувань системи
  const changeSettings = useCallback(
    async (settings: SystemSettings) => {
      try {
        setError(null);

        const data =
          await updateSettings(settings);

        // Одразу оновлюємо стан у UI
        setStatus(data);

        // Якщо система вимкнена —
        // одразу додаємо точку 0%
        addLocalOffPoint(data);

        // Після зміни режиму оновлюємо прогноз
        await refreshForecast();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Не вдалося змінити налаштування";

        setError(message);

        throw err;
      }
    },
    [
      addLocalOffPoint,
      refreshForecast,
    ]
  );


  // Увімкнення / вимкнення системи
  const setSystemEnabled = useCallback(
    async (enabled: boolean) => {
      if (!status) {
        return;
      }

      await changeSettings({
        target_temperature:
          status.target_temperature,

        system_enabled: enabled,
      });
    },
    [
      status,
      changeSettings,
    ]
  );


  // Зміна уставки
  const setTargetTemperature = useCallback(
    async (temperature: number) => {
      if (!status) {
        return;
      }

      await changeSettings({
        target_temperature: temperature,

        system_enabled:
          status.system_enabled,
      });
    },
    [
      status,
      changeSettings,
    ]
  );


  return {
    status,

    temperatureHistory,

    // Видаємо вже об'єднану історію:
    // backend + локальні точки OFF
    controlHistory: displayedControlHistory,

    mpcForecast,

    historyHours,

    loading,
    error,

    refreshStatus,
    refreshHistory,
    refreshForecast,

    changeHistoryHours,
    changeSettings,

    setSystemEnabled,
    setTargetTemperature,
  };
}
