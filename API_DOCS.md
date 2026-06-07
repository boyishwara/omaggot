# O'Maggot API Documentation

This document outlines the API endpoints available in the O'Maggot system. 

## Base URL
All endpoints are relative to the base URL of your deployed Next.js application, e.g., `https://your-domain.com`.

## Authentication & Security

The API is secured to prevent unauthorized access to sensitive sensor data and system controls. 

- **Frontend API Routes**: Most API routes (like `GET /api/sensor`, `/api/export`, etc.) require an active user session. They are protected by `middleware.ts` which verifies Supabase authentication cookies. Unauthenticated requests will receive a `401 Unauthorized` response.
- **ESP32 Device Endpoints**: Endpoints used by hardware devices (like `POST /api/sensor`) require a secret API key passed in the request body.
- **Webhooks**: Webhook endpoints (like `/api/webhooks/telegram` and `/api/webhooks/telegram-bot`) are used by external services and have their own security validations.

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

## 2. Webhooks

### 2.1 Telegram Bot Commands
**Endpoint:** `POST /api/webhooks/telegram-bot`

This endpoint handles inbound messages from the Telegram Bot API (e.g., when a user types `/start`, `/subscribe`, or `/status`). The URL must be registered with Telegram using the `setWebhook` method.

### 2.2 Telegram Push Notifications
**Endpoint:** `POST /api/webhooks/telegram`

This endpoint is called by Supabase Database Webhooks whenever a new notification is inserted. It broadcasts the alert to all active Telegram subscribers.

---

## 3. Other Internal API Routes
These routes are typically used by the Dashboard UI and are protected by authentication:

- **`/api/export`**: Generates CSV/PDF exports of sensor data.
- **`/api/simulation`**: Manages the system simulation status (used for testing alerts).
- **`/api/rules`**: Manages the CRUD operations for warning rules and thresholds.
- **`/api/users`**: User management endpoints (Admin/Superadmin only).
- **`/api/profile`**: User profile operations.

## Security Note
All sensitive endpoints are now protected against public access. Any attempt to query sensor data or system settings without a valid authentication session will be blocked automatically by the server middleware.
