# O'Maggot API Documentation

This document outlines the API endpoints available in the O'Maggot system. 

## Base URL
All endpoints are relative to the base URL of your deployed Next.js application, e.g., `https://your-domain.com`.

## Authentication & Security

The API is secured to prevent unauthorized access to sensitive sensor data and system controls. 

- **Frontend API Routes**: Most API routes (like `GET /api/sensor`, `/api/export`, etc.) require an active user session. They are protected by `middleware.ts` which verifies Supabase authentication cookies. Unauthenticated requests will receive a `401 Unauthorized` response.
- **ESP32 Device Endpoints**: Endpoints used by hardware devices (like `POST /api/sensor`) require a secret API key passed in the request body.
- **Webhooks**: Webhook endpoints (like `/api/webhooks/telegram` and `/api/webhooks/telegram-bot`) are used by external services and have their own security validations.
- **Role-Based Access**: Certain endpoints (like `POST /api/production`) are restricted to users with an `admin` or `superadmin` role.

---

## 1. Sensor Data Endpoints

### 1.1 Submit Sensor Data (Device to Cloud)
**Endpoint:** `POST /api/sensor`

This endpoint is used by the ESP32 (or Node.js MQTT worker) to submit new temperature and humidity readings.

**Request Body (JSON):**
```json
{
  "api_key": "YOUR_ESP32_API_KEY",
  "device_id": "esp32-001",
  "temperature": 28.5,
  "humidity": 65.0
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "NORMAL",
    "heat_index": 29.3
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized: Invalid API Key"
}
```

### 1.2 Fetch Sensor Data (Frontend)
**Endpoint:** `GET /api/sensor`

Fetches historical sensor readings. This endpoint is **protected** and requires an active user session cookie.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 100).
- `from` (optional): Start date (ISO format).
- `to` (optional): End date (ISO format).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "recorded_at": "2024-03-15T10:00:00Z",
      "temperature": 28.5,
      "humidity": 65.0,
      "heat_index": 29.3,
      "status": "NORMAL",
      "device_id": "esp32-001"
    }
  ]
}
```

---

## 2. Production Data Endpoints

These endpoints manage the manual recording of feed (pakan) and harvested maggot data. Used by the **Production** tab in the dashboard.

### 2.1 Record Production Data
**Endpoint:** `POST /api/production`

Inserts a new production record. **Requires** an active session with `admin` or `superadmin` role.

**Request Body (JSON):**
```json
{
  "pakan_kg": 10.5,
  "maggot_kg": 2.3,
  "user_id": "user-uuid",
  "recorded_at": "2024-03-15T08:00:00Z"
}
```

> `recorded_at` is **optional**. If omitted, the server will default to the current timestamp. This allows retroactive entry of past data.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "pakan_kg": "10.50",
    "maggot_kg": "2.30",
    "recorded_at": "2024-03-15T08:00:00Z",
    "recorded_by": "user-uuid"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid payload: pakan_kg and maggot_kg must be numbers"
}
```

### 2.2 Fetch Production Data
**Endpoint:** `GET /api/production`

Fetches production records for a given date range. **Protected** — requires an active user session.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 100).
- `from` (optional): Start date (ISO format).
- `to` (optional): End date (ISO format).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "pakan_kg": "10.50",
      "maggot_kg": "2.30",
      "recorded_at": "2024-03-15T08:00:00Z",
      "recorded_by": "user-uuid"
    }
  ]
}
```

---

## 3. Export Endpoint

### 3.1 Export Data
**Endpoint:** `GET /api/export`

Generates a downloadable file containing sensor data and production records. **Protected** — requires an active user session.

**Query Parameters:**
- `format` (required): `csv`, `tsv`, `xlsx`, or `json`.
- `from` (optional): Start date (ISO format).
- `to` (optional): End date (ISO format).
- `status` (optional): Filter sensor data by status (`NORMAL`, `WARNING`, `DANGER`, or `all`).

**Notes on format:**
- **`xlsx`**: Returns an Excel workbook with two sheets — **"Sensor Data"** and **"Production Data"**.
- **`csv` / `tsv`**: Returns a flat file with sensor data on top, followed by a `--- PRODUCTION DATA ---` separator and the production records below.
- **`json`**: Returns a structured JSON object with separate `sensorData` and `productionData` keys.

---

## 4. Webhooks

### 4.1 Telegram Bot Commands
**Endpoint:** `POST /api/webhooks/telegram-bot`

This endpoint handles inbound messages from the Telegram Bot API (e.g., when a user types `/start`, `/subscribe`, or `/status`). The URL must be registered with Telegram using the `setWebhook` method.

**Supported Commands:**
- `/start` — Introduces the bot.
- `/subscribe` — Registers the user's chat ID to receive push alerts.
- `/unsubscribe` — Removes the user from the alert list.
- `/status` — Returns the latest sensor reading **and** the total feed/maggot production from the last 7 days.

### 4.2 Telegram Push Notifications
**Endpoint:** `POST /api/webhooks/telegram`

This endpoint is called by Supabase Database Webhooks whenever a new notification is inserted. It broadcasts the alert to all active Telegram subscribers.

---

## 5. Other Internal API Routes
These routes are typically used by the Dashboard UI and are protected by authentication:

- **`/api/simulation`**: Manages the system simulation status (used for testing alerts).
- **`/api/rules`**: Manages the CRUD operations for warning rules and thresholds.
- **`/api/users`**: User management endpoints (Superadmin only).
- **`/api/profile`**: User profile operations.

## Security Note
All sensitive endpoints are now protected against public access. Any attempt to query sensor data or system settings without a valid authentication session will be blocked automatically by the server middleware.
