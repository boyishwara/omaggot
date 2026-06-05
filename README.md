# Smart Maggot Box 🪰

An IoT-based environmental monitoring system for Black Soldier Fly (BSF) Maggot cultivation. Built with ESP32/ESP8266, Next.js, and Supabase.

## Features ✨
- **Real-time Monitoring**: Track Temperature & Humidity using a DHT sensor.
- **Automated Alerts**: Real-time notifications and hardware alerts (LEDs, Buzzer) when parameters reach Warning or Danger levels.
- **Hardware Testing**: Directly trigger 'Warning' or 'Danger' states from the dashboard to test the physical LED/Buzzer indicators.
- **Data Visualization**: Beautiful interactive charts to monitor historical trends.
- **Heat Index Calculation**: Automatically computes the perceived heat index for better environmental tracking.

## Technology Stack 🛠️
- **Hardware**: ESP32 / ESP8266, DHT11/DHT22 Sensor, LEDs, Active Buzzer.
- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts, Lucide Icons.
- **Backend/Database**: Supabase (PostgreSQL with Realtime WebSockets enabled).

---

## 🚀 Quick Start Guide

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Run the SQL script located in `supabase/schema.sql` in your Supabase SQL Editor.
3. Make sure to run the `ALTER PUBLICATION` block at the bottom of the SQL script to enable Realtime WebSockets for live alerts.

### 2. Web Dashboard Setup
1. Open the `/web` folder in your terminal.
2. Copy `.env.example` to `.env.local` and fill in your Supabase URL, Anon Key, and Service Role Key.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Access the dashboard at `http://localhost:3000/admin/dashboard`.

### 3. Hardware Setup (ESP32/ESP8266)
1. Open `esp32/smart_maggot_box/config.h` in the Arduino IDE.
2. Update the `WIFI_SSID` and `WIFI_PASSWORD`.
3. Update the `API_URL` to point to your Next.js server's local IP address (e.g., `http://192.168.1.10:3000/api/sensor`).
4. Select your board and flash the code.

## 🔌 Wiring Guide

| Component | ESP32 Pin | ESP8266 (NodeMCU) Pin |
|-----------|-----------|-----------------------|
| DHT Sensor Data | GPIO 4 | D2 (GPIO 4) |
| Green LED | GPIO 18 | D1 (GPIO 5) |
| Red LED | GPIO 19 | D5 (GPIO 14) |
| Buzzer | GPIO 21 | D6 (GPIO 12) |

> Make sure to connect GND and VCC appropriately.

## 🧹 Code Quality & Optimization
- **Memory Safe**: The dashboard uses proper React `useEffect` cleanup functions to remove WebSocket channels and polling intervals, preventing memory leaks.
- **Optimized Networking**: Supabase Realtime is utilized to instantly push data to the frontend, eliminating the need for heavy API polling intervals.
- **Clean Architecture**: Sensor processing logic is abstracted into `lib/utils/sensor.ts`.

---
*Developed for efficient and modern maggot cultivation management.*
