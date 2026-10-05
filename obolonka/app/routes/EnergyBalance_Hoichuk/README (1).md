# EnergyBalance (Гойчук О.В.)

Балансування генерації (сонце, вітер), споживання та акумулятора з історією й прогнозом.
Бекенд — Flask API у Docker, інтерфейс — React-сторінки спільного проєкту. Порт бекенду: **6049**.

## Структура

```
backend/      Flask API + Dockerfile + тести
frontend/     React-сторінки (obolonka/app/routes/EnergyBalance_Hoichuk)
```

## Запуск бекенду

**Docker** (потрібен запущений Docker Desktop):
```bash
cd backend
docker build -t energybalance-hoichuk .
docker run --rm -p 6049:8000 -v energybalance_data:/data energybalance-hoichuk
```

**Python 3.10+** (без Docker):
```bash
cd backend
pip install -r requirements.txt
PORT=6049 python main.py          # PowerShell: $env:PORT=6049; python main.py
```

Перевірка: http://localhost:6049/api/health → `{"status":"ok", ...}`

## Запуск інтерфейсу (потрібен Node.js 20+)

```bash
cd standalone
npm install
npm run dev
```

Відкрити: http://localhost:5173/energy-balance-hoichuk (бекенд має працювати).
У PowerShell, якщо `npm` заблоковано: `npm.cmd install` та `npm.cmd run dev`.


## API

| Метод | Шлях | Опис |
|---|---|---|
| GET | `/api/health` | перевірка стану |
| GET | `/api/current` | поточні показники |
| GET | `/api/live?limit=60` | останні точки симуляції |
| GET | `/api/history?page&per_page&period` | історія (`24h`, `7d`, `30d`, `all`) |
| GET | `/api/analytics?period` | підсумки та агрегати |
| GET | `/api/forecast?period` | прогноз (`day`, `week`, `month`) |
| GET | `/api/accuracy` | точність моделей, % |
| GET/POST | `/api/settings` | налаштування |
