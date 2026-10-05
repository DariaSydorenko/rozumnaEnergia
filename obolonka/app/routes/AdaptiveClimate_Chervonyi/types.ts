export interface ClimateStatus {
  temperature: number | null;
  outdoor_temperature: number | null;
  target_temperature: number;
  heater_power: number;
  system_enabled: boolean;
  mqtt_connected: boolean;
  last_update: string | null;
}

export interface TemperatureHistoryPoint {
  time: string;
  temperature: number;
}

export interface ControlHistoryPoint {
  time: string;
  heater_power: number;
  temperature: number;
  target_temperature: number;
}

export interface MpcForecastPoint {
  step: number;
  temperature: number;
}

export interface SystemSettings {
  target_temperature: number;
  system_enabled: boolean;
}