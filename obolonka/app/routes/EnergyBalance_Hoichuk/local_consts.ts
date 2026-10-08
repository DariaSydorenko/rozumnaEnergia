import { API_BASE_URL } from "../../../consts";

// Порт бекенду EnergyBalance (Гойчук) — виділений порт №6049. Має збігатися з портом у docker-compose.yaml
// (ліва частина мапінгу "<ПОРТ>:8000") — беріть порт за своїм номером у списку.
export const BACKEND_PORT = 6049;

// API_BASE_URL з consts.ts уже містить схему: "http://77.47.192.6"
export const ENERGY_API_URL = `${API_BASE_URL}:${BACKEND_PORT}/api`;

// Як часто оновлювати «живі» показники (мс)
export const LIVE_POLL_MS = 2000;
