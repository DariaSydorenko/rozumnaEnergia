import { API_BASE_URL } from "../../../consts";

import type {
  ClimateStatus,
  TemperatureHistoryPoint,
  ControlHistoryPoint,
  MpcForecastPoint,
  SystemSettings,
} from "./types";

const CLIMATE_API_URL = `${API_BASE_URL}:6016`;

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${CLIMATE_API_URL}${endpoint}`,
    options
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getStatus(): Promise<ClimateStatus> {
  return apiRequest<ClimateStatus>("/api/status");
}

export async function getTemperatureHistory(
  hours: number
): Promise<TemperatureHistoryPoint[]> {
  return apiRequest<TemperatureHistoryPoint[]>(
    `/api/history?hours=${hours}`
  );
}

export async function getControlHistory(
  hours: number
): Promise<ControlHistoryPoint[]> {
  return apiRequest<ControlHistoryPoint[]>(
    `/api/control-history?hours=${hours}`
  );
}

export async function getMpcForecast(): Promise<MpcForecastPoint[]> {
  return apiRequest<MpcForecastPoint[]>(
    "/api/mpc-forecast"
  );
}

export async function updateSettings(
  settings: SystemSettings
): Promise<ClimateStatus> {
  return apiRequest<ClimateStatus>(
    "/api/settings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    }
  );
}