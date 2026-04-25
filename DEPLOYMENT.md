# 🚀 Deployment Guide — Smart Garbage Monitoring System

This guide covers **every step** to get the system running. Pick the method that suits your needs.

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js v18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend runs at **http://localhost:3001**. You should see:
```
Connected to the SQLite database.
Seeded database with sample data.
Server running → http://localhost:3001
```

### 2. Start the Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at **http://localhost:5173**.

### 3. Login

Open **http://localhost:5173** in your browser:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `vvit@123` |

---

## Docker Deployment (One Command)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Deploy

```bash
# From the project root
docker compose up --build -d
```

Open **http://localhost** and login with `admin` / `vvit@123`.

### Manage

```bash
# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and clear all data
docker compose down -v

# Rebuild after code changes
docker compose up --build -d
```

---

## Cloud Deployment (Free — Render + Vercel)

### Step 1: Deploy Backend to Render.com

1. Sign up at [render.com](https://render.com) with GitHub
2. Create **New → Web Service** → connect your repo
3. Settings:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

4. Environment Variables:

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `DB_PATH` | `/app/data/garbage_system.db` |

5. After deployment, copy your backend URL (e.g., `https://smartbin-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import your repo → set **Root Directory** to `frontend`
3. Framework: `Vite`, Output: `dist`
4. Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://smartbin-backend.onrender.com` |

5. Deploy

---

## Firmware Setup (Hardware)

### Hardware

| Component | Purpose |
|-----------|---------|
| Arduino UNO R3 | Reads ultrasonic sensor |
| NodeMCU (ESP8266) | Sends data over Wi-Fi |
| HC-SR04 Sensor | Measures bin fill level |
| 16x2 LCD | Displays level locally |
| Buzzer | Full-bin alert |

### Wiring

```
HC-SR04:  Trig→A4, Echo→A5, VCC→5V, GND→GND
LCD:      RS→8, EN→9, D4→10, D5→11, D6→12, D7→13
Buzzer:   Signal→Pin 4
Arduino TX → NodeMCU RX (use voltage divider: 5V→3.3V)
```

### Flash Arduino

1. Open `firmware/arduino/arduino.ino` in Arduino IDE
2. Board: **Arduino Uno**
3. Upload

### Flash NodeMCU

1. Open `firmware/nodemcu/nodemcu.ino`
2. **Edit these values:**

```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverName = "http://YOUR_COMPUTER_IP:3001/api/telemetry";
```

3. Board: **NodeMCU 1.0 (ESP-12E Module)**
4. Upload

> **Note:** Find your IP with `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows). Don't use `localhost`.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/login` | No | Get JWT token |
| POST | `/api/telemetry` | No | Receive sensor data from NodeMCU |
| GET | `/api/dashboard` | JWT | Get all bins + stats |
| GET | `/api/bins/:id/history` | JWT | Get bin telemetry history |
| GET | `/api/analytics` | JWT | Get analytics data |
| GET | `/api/notifications` | JWT | Get notifications |
| PUT | `/api/notifications/read-all` | JWT | Mark all notifications read |
| GET | `/api/collections` | JWT | Get collection logs |
| POST | `/api/collections` | JWT | Record a new collection |
| POST | `/api/simulator/tick` | JWT | Generate simulated data |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Run `npm cache clean --force`, delete `node_modules` & `package-lock.json`, retry |
| Node version too old | Install Node 20 via [nvm](https://github.com/nvm-sh/nvm): `nvm install 20` |
| Frontend shows "Network Error" | Ensure backend is running first on port 3001 |
| Docker build fails | Run `docker compose build --no-cache` |
| Port already in use | Run `lsof -i :3001` then `kill -9 <PID>` |
| NodeMCU won't connect | Ensure 2.4 GHz Wi-Fi (ESP8266 doesn't support 5 GHz) |
| CORS error in browser | Backend has `cors()` enabled; check the API URL configuration |
