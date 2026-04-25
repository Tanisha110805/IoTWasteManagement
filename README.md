# Smart Garbage Monitoring System Using IoT (Professional Upgrade)

## Overview

We are living in the era of Smart cities where everything is planned and systematic. The problem we are facing is the population, which is rising rapidly. This has resulted in the rise of garbage waste everywhere. 

This project proposes a solution to this waste problem by managing the garbage waste smartly. It provides a complete, modern IoT stack:
1. **Hardware / Firmware:** Uses an ultrasonic sensor with Arduino and NodeMCU to monitor garbage levels. The NodeMCU pushes telemetry data to a centralized backend server.
2. **Backend Server:** A Node.js / Express API backed by an SQLite database for storing historical data.
3. **Frontend Dashboard:** A professional React (Vite) application utilizing Tailwind CSS and Recharts to provide real-time updates and historical analysis of garbage levels.

## System Architecture

- **Arduino UNO R3:** Interfaces with the Ultrasonic Sensor. Calculates distance and fill level, sending this data over Serial to the NodeMCU.
- **NodeMCU (ESP8266):** Connects to Wi-Fi. Reads JSON data from the Arduino over Serial and makes an HTTP POST request to the backend server's `/api/telemetry` endpoint.
- **Node.js Backend:** Receives HTTP POST requests, saves data to SQLite, and serves this data to the web frontend via secure API endpoints.
- **React Frontend:** Authenticates users via JWT, polls the backend for new data, and visualizes the bin status.

## Directory Structure

- `/firmware`: Contains the C++ code for the Arduino and NodeMCU.
- `/backend`: Contains the Node.js/Express server and SQLite database.
- `/frontend`: Contains the modern React/Vite dashboard.

## How to Deploy

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete, step-by-step deployment guide** covering:
- ✅ Local development setup
- 🐳 Docker Compose (one-command deploy)
- ☁️ Free cloud deployment (Render + Vercel)
- 🖥️ VPS deployment (DigitalOcean / AWS)
- 🔧 Arduino & NodeMCU firmware flashing

### Quick Start (Local)

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:3001`.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. Login with:
- **Username:** `admin`
- **Password:** `vvit@123`

**Docker (one command):**
```bash
docker compose up --build -d
# Open http://localhost
```

## Hardware Requirements

1. Ultrasonic Sensor (HC-SR04)
2. Arduino UNO R3
3. NodeMCU (ESP8266)
4. Buzzer
5. Connecting Wires

## Software Requirements

- Node.js (v18+)
- Arduino IDE

## Creators
- Pavankumar Hegde [Team Leader]
- Sushil Kumar Sah
- Safina Fathima
- Santhosh Reddy
