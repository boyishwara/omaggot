# O'Maggot Box V2
An enterprise-grade Internet of Things (IoT) environmental monitoring system specifically designed for Black Soldier Fly (BSF) Maggot cultivation.

BSF maggots require precise temperature and humidity ranges to thrive. This system provides real-time monitoring, automated alerts, and comprehensive historical data analysis to ensure optimal breeding conditions and maximize yield.

---

## 🏗️ System Architecture

To help developers and stakeholders understand the system at a glance, here is the breakdown of physical hardware, cloud services, and the database.

### 1. Component Architecture
This diagram outlines the physical and cloud boundaries of the system.

```mermaid
graph LR
    subgraph "Local Environment"
        DHT[DHT21 Sensor] -->|Reads| ESP32[ESP32 Microcontroller]
        ESP32 -->|Triggers| HW[LEDs & Buzzer]
    end

    subgraph "Cloud Infrastructure"
        HiveMQ[HiveMQ Cloud MQTT]
        Worker["Node.js MQTT Worker<br/>(Bridge)"]
        NextJS["Next.js App & API<br/>(Vercel)"]
        Supabase[(Supabase Postgres)]
    end

    subgraph "External"
        Telegram[Telegram API]
        User[Admin / User]
    end

    ESP32 <-->|MQTT via Wi-Fi| HiveMQ
    HiveMQ <-->|MQTT Subscribe| Worker
    Worker -->|HTTP POST| NextJS
    NextJS <-->|Read/Write Data| Supabase
    Supabase -->|Webhooks| Telegram
    Telegram -->|Push Alerts| User
    User -->|Views Dashboard| NextJS
```

### 2. Data Flow (Sequence)
This diagram illustrates the chronological step-by-step flow when a sensor reading occurs.

```mermaid
sequenceDiagram
    participant ESP32 as ESP32 (Hardware)
    participant HiveMQ as HiveMQ Cloud (MQTT)
    participant Worker as Node.js MQTT Worker
    participant NextJS as Next.js API & UI
    participant Supabase as Supabase (Postgres)
    participant Telegram as Telegram Bot
    
    ESP32->>HiveMQ: 1. Publish Temp/Humid via MQTT
    HiveMQ->>Worker: 2. Forward message to Worker
    Worker->>NextJS: 3. HTTP POST to /api/sensor
    
    NextJS->>Supabase: 4. Check rules & Calculate Heat Index
    NextJS->>Supabase: 5. Insert to sensor_readings
    
    alt Status is DANGER / WARNING
        NextJS->>Supabase: 6a. Insert to notifications
        Supabase-->>Telegram: 6b. Webhook calls /api/webhooks/telegram
        Telegram-->>Subscribers: 6c. Send Push Notification
    end
    
    Supabase-->>NextJS: 7. Realtime WebSockets sync UI dashboard
    NextJS-->>Worker: 8. Return HTTP Response with status
    Worker->>HiveMQ: 9. Publish Status via MQTT
    HiveMQ->>ESP32: 10. Trigger LED & Buzzer state
```

### 3. Database Schema (ERD)
This Entity-Relationship Diagram details the relational PostgreSQL database structure hosted on Supabase.

```mermaid
erDiagram
    sensor_readings ||--o{ notifications : triggers
    warning_rules ||--o{ notifications : generates
    
    sensor_readings {
        BIGINT id PK
        DECIMAL temperature
        DECIMAL humidity
        DECIMAL heat_index
        TEXT status
        TEXT device_id
        TIMESTAMPTZ recorded_at
    }
    
    warning_rules {
        BIGINT id PK
        TEXT name
        TEXT parameter
        TEXT condition
        DECIMAL threshold
        TEXT severity
        BOOLEAN is_active
    }
    
    notifications {
        BIGINT id PK
        BIGINT rule_id FK
        BIGINT reading_id FK
        TEXT severity
        TEXT message
        BOOLEAN is_read
        TIMESTAMPTZ created_at
    }
    
    user_profiles {
        UUID id PK
        TEXT name
        TEXT role
        BOOLEAN is_approved
    }
    
    telegram_subscribers {
        UUID id PK
        TEXT chat_id
        BOOLEAN is_active
    }
```

---

## 🧠 Critical Analysis: Why These Technologies?

Building a reliable IoT system requires bridging the gap between embedded hardware (C++), continuous data streams, and modern web applications. Here is the critical reasoning behind our technology stack choices:

### 1. Supabase (PostgreSQL) vs Traditional Databases
- **What we needed:** A secure database that can handle rapid time-series inserts from IoT devices, while instantly updating the frontend dashboard without heavy polling.
- **Why we chose it:** Supabase provides **PostgreSQL** out of the box with built-in **Row Level Security (RLS)** and **Realtime WebSockets**. 
- **The Benefit:** Instead of writing complex WebSocket servers (Socket.io) to push new temperature readings to the browser, Supabase Realtime allows the Next.js frontend to simply subscribe to database changes. RLS ensures that public users cannot write or delete data directly from the browser, pushing all write-privileges to secure backend API routes.

### 2. Next.js App Router vs Express.js
- **What we needed:** A robust administrative dashboard and secure API endpoints to process rules.
- **Why we chose it:** Next.js provides Server-Side Rendering (SSR) and seamless API routes in a single repository.
- **The Benefit:** Deploying to Vercel is trivial, SEO is perfect (if the landing page scales), and UI components (Tailwind, Framer Motion) integrate seamlessly. However, because Vercel API routes are *serverless* (they shut down when not in use), they cannot hold open continuous MQTT connections. This limitation led directly to the next architectural decision:

### 3. MQTT (HiveMQ) + Node.js Worker Bridge
- **What we needed:** A reliable way for the ESP32 to stream data 24/7 without draining battery or dropping packets due to HTTP overhead.
- **Why we chose it:** MQTT is the industry standard for IoT—it is lightweight, requires minimal bandwidth, and maintains persistent connections. Since Next.js serverless functions cannot subscribe to MQTT continuously, we introduced a standalone **Node.js MQTT Worker**.
- **The Benefit:** The Worker acts as a translator. It holds the persistent MQTT connection open, receives the ultra-lightweight payload from the ESP32, and fires a standard HTTP POST request to the Next.js API. This gives us the best of both worlds: efficient IoT hardware communication and scalable serverless backend APIs.

### 4. Telegram Bot over Custom Push Notifications
- **What we needed:** Immediate alerts to farmers when the maggot box temperature reaches DANGER levels.
- **Why we chose it:** Building a custom mobile app strictly for push notifications is expensive, hard to maintain, and causes friction (users don't want to download another app). 
- **The Benefit:** Telegram offers a free, highly reliable Bot API. Farmers simply send `/subscribe` to the bot, and Supabase Database Webhooks automatically POST to our API which pushes the alert to Telegram. Zero app installations required, instant delivery.

---

## 👥 Pembagian Roles (Role Distribution & Access Control)

To maintain strict security—especially concerning hardware simulation and alert rule modifications—the system implements a robust Role-Based Access Control (RBAC) mechanism. 

There are three distinct roles in the system. Here is exactly what they can and cannot do:

| Feature / Capability | User (Normal) | Admin (Pending) | Admin (Approved) | Superadmin |
| :--- | :---: | :---: | :---: | :---: |
| **View Live Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **View Reports & Export Data**| ✅ | ✅ | ✅ | ✅ |
| **View Warning Rules** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit / Delete Rules**| ❌ | ❌ | ✅ | ✅ |
| **Toggle Rules On/Off** | ❌ | ❌ | ✅ | ✅ |
| **Delete Sensor Data (Reports)**| ❌ | ❌ | ✅ | ✅ |
| **Trigger Test Notifications** | ❌ | ❌ | ✅ | ✅ |
| **Trigger Hardware Simulation**| ❌ | ❌ | ✅ | ✅ |
| **Manage / Remove Subscribers**| ❌ | ❌ | ✅ | ✅ |
| **Approve / Reject Admins** | ❌ | ❌ | ❌ | ✅ |

### The "Pending Admin" Workflow (State Diagram)

To prevent anyone from registering as an Admin and immediately messing with critical temperature thresholds, we introduced an `is_approved` flag.

```mermaid
stateDiagram-v2
    [*] --> Registration
    Registration --> User : Selects "User"
    Registration --> Admin_Pending : Selects "Admin"
    
    Admin_Pending --> Dashboard : Read-only access
    Admin_Pending --> Admin_Approved : Superadmin clicks "Approve"
    Admin_Approved --> FullAccess : Can edit rules & hardware
    
    Superadmin --> UserManagement : Has exclusive access to tab
```

> [!IMPORTANT]  
> **Creating the First Superadmin:**  
> For maximum security, the "Superadmin" role cannot be selected via the UI during registration. Hardcoding a secret path to become a Superadmin is a massive security vulnerability. 
> 
> You must promote your first account manually via the database:
> 1. Register an account normally at `/register`.
> 2. Open the **Supabase Dashboard SQL Editor**.
> 3. Run the following query:
>    ```sql
>    UPDATE user_profiles 
>    SET role = 'superadmin', is_approved = true 
>    WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
>    ```
> 4. Refresh your dashboard. You will now see the exclusive **User Management** tab, allowing you to securely approve all future Admins from the UI.

---

## 🚀 Step-by-Step Setup Guide

### Phase 1: Database Setup (Supabase)
1. Create a new Supabase project.
2. Navigate to the SQL Editor and run the contents of `supabase/schema.sql` to generate the necessary tables and Row-Level Security (RLS) policies.
3. The script automatically enables Realtime WebSockets for `sensor_readings` and `notifications`.

### Phase 2: Environment Configuration
1. Navigate to the `web` directory and copy `.env.example` to a new file named `.env.local`.
2. Populate the Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Populate the HiveMQ Cloud credentials (`HIVEMQ_HOST`, `HIVEMQ_PORT`, `HIVEMQ_USERNAME`, `HIVEMQ_PASSWORD`).
4. Define a secure `ESP32_API_KEY` to authenticate incoming sensor payloads from the Worker.
5. Define `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000` or your production domain).

### Phase 3: Telegram Bot Integration
> [!WARNING]  
> **Local Development Note:** Telegram webhooks cannot reach `http://localhost`. If you are testing locally, you MUST use a tunneling service like [Ngrok](https://ngrok.com/) (`ngrok http 3000`) and use the Ngrok URL for your webhooks, OR deploy your Next.js app to Vercel first.

1. Open Telegram, message `@BotFather`, create a new bot, and copy your `TELEGRAM_BOT_TOKEN` into `.env.local`.
2. **Inbound Webhook (Bot Commands):** Register your Next.js API with Telegram so it can receive `/start` and `/subscribe` commands. Open your browser and navigate to:
   `https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-public-domain.com/api/webhooks/telegram-bot`
3. **Outbound Webhook (Alerts):** In your Supabase Dashboard, navigate to **Database > Webhooks**.
4. Create a new Webhook triggered by `INSERT` events on the `notifications` table.
5. Set the Webhook URL to point to your deployed endpoint: `https://your-public-domain.com/api/webhooks/telegram`.

### Phase 4: Running the Platform Locally
You will need two terminal windows to run both the Web Server and the MQTT Bridge concurrently.

**Terminal 1: Next.js Server**
```bash
cd web
npm install
npm run dev
```

**Terminal 2: MQTT Worker Bridge**
```bash
cd web
node mqtt-worker.js
```

### Phase 5: Hardware Flashing (ESP32)
1. **Wiring:** Please refer to the [ESP32 Hardware Guide](esp32/README.md) for the GPIO pinout schema.
2. Open the `esp32` directory in the Arduino IDE.
3. Install required libraries: `WiFiManager`, `PubSubClient`, `ArduinoJson`, `DHT sensor library`.
4. Update `esp32/smart_maggot_box/config.h` with your HiveMQ connection details.
5. Flash the code to your ESP32.
6. On boot, the ESP32 will host a "MaggotBox-Setup" Wi-Fi network. Connect to it via your phone to input your local Wi-Fi credentials dynamically.
