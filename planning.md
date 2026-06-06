# planning.md — O'Maggot Box: Sistem Monitoring Perkembangbiakan Maggot Berbasis IoT

> **Untuk AI Coding Assistant**: Baca dokumen ini secara menyeluruh sebelum menulis satu baris kode pun.
> Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk arsitektur, konvensi, dan keputusan desain proyek ini.

---

## 1. Gambaran Proyek

**Nama**: O'Maggot Box — Sistem Monitoring Perkembangbiakan Maggot Berbasis IoT  
**Konteks**: Tugas Besar Mata Kuliah Semester 4  
**Tujuan**: Memantau kondisi lingkungan budidaya maggot BSF (*Black Soldier Fly* / *Hermetia illucens*) secara real-time menggunakan sensor IoT, menampilkan data di web dashboard, dan mengirim peringatan otomatis ketika kondisi di luar ambang batas optimal.

### Stack Teknologi

| Layer | Teknologi |
|---|---|
| Hardware | ESP32 + DHT22 + Buzzer 3V + LED Hijau/Merah + Resistor 220Ω |
| Backend + Frontend | Next.js 14 (App Router) — monorepo satu project |
| Database | Supabase (PostgreSQL + Realtime + Auth) |
| Styling | Tailwind CSS |
| Deployment | Local (localhost:3000) — Supabase tetap cloud |

---

## 2. Mengapa Parameter Ini Penting untuk Maggot BSF

### Parameter yang Dimonitor

#### 🌡️ Suhu (Temperature)

- **Optimal**: 25°C – 35°C
- **Kritis bawah**: < 20°C → metabolisme melambat drastis, larva tidak makan, pertumbuhan terhenti
- **Kritis atas**: > 40°C → kematian massal larva, denaturasi protein
- **Pengaruh**: Suhu adalah faktor paling dominan. Pada 30°C larva BSF menyelesaikan siklus dalam ~18 hari. Setiap penurunan 5°C bisa memperpanjang siklus hingga 2× lipat.

#### 💧 Kelembaban (Humidity)

- **Optimal**: 60% – 80% RH
- **Kritis bawah**: < 50% RH → desiccation (larva mengering), kematian pada instar awal
- **Kritis atas**: > 85% RH → pertumbuhan jamur/bakteri patogen, anaerob kondisi
- **Pengaruh**: Kelembaban menjaga keseimbangan kadar air substrat. Larva BSF membutuhkan substrat lembab (~70% moisture) untuk bergerak dan makan.

#### 📊 Indeks Kenyamanan (Heat Index)

- Dihitung dari kombinasi suhu + kelembaban
- Memberikan gambaran "tekanan panas nyata" yang dialami larva
- Digunakan untuk trigger warning level bertingkat

### Level Warning System

```
NORMAL  → Suhu 25-35°C, Kelembaban 60-80%   [LED Hijau ON]
WARNING → Salah satu parameter mendekati batas [LED Hijau Kedip]
DANGER  → Salah satu parameter melewati batas [LED Merah ON + Buzzer]
CRITICAL→ Kedua parameter kritis              [LED Merah Kedip + Buzzer Panjang]
```

---

## 3. Skema Hardware IoT

### Komponen

| Komponen | Spesifikasi | Fungsi |
|---|---|---|
| ESP32 | 38-pin, WiFi+BT | Mikrokontroler utama |
| DHT22 | 3-pin (VCC, DATA, GND) | Sensor suhu & kelembaban |
| LED Hijau | 3mm/5mm | Indikator kondisi normal |
| LED Merah | 3mm/5mm | Indikator kondisi bahaya |
| Buzzer | 3V aktif/pasif | Alarm audio |
| Resistor | 220Ω × 2 (untuk LED) | Current limiting LED |

### Wiring Diagram

```
ESP32 PIN       →  KOMPONEN
─────────────────────────────────────────
3V3             →  DHT22 Pin 1 (VCC)
GPIO 4          →  DHT22 Pin 2 (DATA)  [+ pull-up 10kΩ ke 3V3 jika perlu]
GND             →  DHT22 Pin 4 (GND)   [Pin 3 NC]

GPIO 26         →  Resistor 220Ω → LED Hijau Anoda (+)
GND             →  LED Hijau Katoda (-)

GPIO 27         →  Resistor 220Ω → LED Merah Anoda (+)
GND             →  LED Merah Katoda (-)

GPIO 25         →  Buzzer (+)
GND             →  Buzzer (-)
─────────────────────────────────────────
Catatan: DHT22 3-pin = VCC, DATA, GND (pin 3 sudah terintegrasi resistor internal)
```

### Logic Hardware

```
Kondisi NORMAL  : LED Hijau ON steady, LED Merah OFF, Buzzer OFF
Kondisi WARNING : LED Hijau blink 500ms, LED Merah OFF, Buzzer beep pendek 1×
Kondisi DANGER  : LED Hijau OFF, LED Merah ON steady, Buzzer beep 3×
Kondisi CRITICAL: LED Hijau OFF, LED Merah blink 200ms, Buzzer continuous
```

---

## 4. Arsitektur Sistem Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│                      ESP32 (Hardware)                       │
│  DHT22 → baca Suhu+Humidity setiap 10 detik                │
│  → Hitung status (NORMAL/WARNING/DANGER/CRITICAL)           │
│  → Kontrol LED + Buzzer lokal                               │
│  → HTTP POST ke Next.js API /api/sensor                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP POST (JSON)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js API Routes                          │
│  POST /api/sensor        → Terima data, simpan ke Supabase  │
│  GET  /api/sensor        → Ambil data historis              │
│  GET  /api/sensor/latest → Data terbaru                     │
│  POST /api/rules         → Buat/edit aturan warning         │
│  GET  /api/rules         → Ambil semua rules                │
│  DELETE /api/rules/[id]  → Hapus rule                       │
│  POST /api/notify/test   → Test notifikasi                  │
│  GET  /api/export        → Export CSV/JSON                  │
│  DELETE /api/data/clear  → Hapus data rentang waktu         │
└─────────────────────┬───────────────────────────────────────┘
                      │ Supabase Client (realtime + REST)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Cloud)                         │
│  sensor_readings   → Data suhu, humidity, status per waktu  │
│  warning_rules     → Aturan threshold yang bisa di-CRUD     │
│  notifications     → Log notifikasi yang dikirim            │
│  admin_sessions    → Session admin (via Supabase Auth)      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Supabase Realtime Subscription
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Frontend                          │
│  /                 → Landing Page (publik)                  │
│  /admin/login      → Halaman login admin                    │
│  /admin/dashboard  → Dashboard monitoring real-time         │
│  /admin/rules      → CRUD warning rules                     │
│  /admin/reports    → Export laporan                         │
│  /admin/settings   → Pengaturan sistem + test notifikasi    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Struktur Folder Project

```
smart-maggot-box/
├── CLAUDE.md                          ← Dokumen ini
├── DESIGN_md.md                       ← Referensi desain (jangan ubah)
├── README.md                          ← Panduan setup singkat
│
├── esp32/                             ← SEMUA kode untuk ESP32
│   ├── README.md                      ← Panduan upload ke ESP32
│   ├── smart_maggot_box.ino           ← Sketch Arduino utama
│   └── config.h                       ← Konfigurasi WiFi, API URL, pin
│
└── web/                               ← Project Next.js
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── .env.local                     ← TIDAK di-commit (gitignore)
    ├── .env.example                   ← Template env vars
    │
    ├── src/
    │   ├── app/                       ← Next.js App Router
    │   │   ├── layout.tsx             ← Root layout
    │   │   ├── page.tsx               ← Landing page (/)
    │   │   ├── globals.css            ← CSS variables dari DESIGN_md
    │   │   │
    │   │   ├── admin/
    │   │   │   ├── layout.tsx         ← Layout admin (auth guard)
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx       ← Halaman login
    │   │   │   ├── dashboard/
    │   │   │   │   └── page.tsx       ← Dashboard monitoring
    │   │   │   ├── rules/
    │   │   │   │   └── page.tsx       ← CRUD warning rules
    │   │   │   ├── reports/
    │   │   │   │   └── page.tsx       ← Export laporan
    │   │   │   └── settings/
    │   │   │       └── page.tsx       ← Settings + test API
    │   │   │
    │   │   └── api/                   ← API Routes (Next.js)
    │   │       ├── sensor/
    │   │       │   ├── route.ts       ← GET/POST sensor data
    │   │       │   └── latest/
    │   │       │       └── route.ts   ← GET data terbaru
    │   │       ├── rules/
    │   │       │   ├── route.ts       ← GET/POST rules
    │   │       │   └── [id]/
    │   │       │       └── route.ts   ← PUT/DELETE rule by id
    │   │       ├── notify/
    │   │       │   └── test/
    │   │       │       └── route.ts   ← POST test notifikasi
    │   │       ├── export/
    │   │       │   └── route.ts       ← GET export data
    │   │       └── data/
    │   │           └── clear/
    │   │               └── route.ts   ← DELETE data by range
    │   │
    │   ├── components/
    │   │   ├── ui/                    ← Komponen UI primitif
    │   │   │   ├── Button.tsx
    │   │   │   ├── Card.tsx
    │   │   │   ├── Badge.tsx
    │   │   │   └── Input.tsx
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx         ← Landing page navbar
    │   │   │   ├── AdminSidebar.tsx   ← Sidebar dashboard admin
    │   │   │   └── Footer.tsx
    │   │   ├── dashboard/
    │   │   │   ├── SensorCard.tsx     ← Card metrik suhu/humidity
    │   │   │   ├── StatusBadge.tsx    ← Badge NORMAL/WARNING/DANGER
    │   │   │   ├── RealtimeChart.tsx  ← Chart data real-time
    │   │   │   ├── NotificationPanel.tsx ← Panel notifikasi live
    │   │   │   └── DeviceStatus.tsx   ← Status koneksi ESP32
    │   │   └── landing/
    │   │       ├── HeroSection.tsx
    │   │       ├── FeatureSection.tsx
    │   │       └── StatsSection.tsx
    │   │
    │   ├── lib/
    │   │   ├── supabase/
    │   │   │   ├── client.ts          ← Supabase browser client
    │   │   │   ├── server.ts          ← Supabase server client
    │   │   │   └── types.ts           ← TypeScript types dari DB schema
    │   │   ├── utils/
    │   │   │   ├── sensor.ts          ← Helper kalkulasi status, heat index
    │   │   │   ├── export.ts          ← Helper generate CSV/JSON
    │   │   │   └── format.ts          ← Format angka, tanggal
    │   │   └── hooks/
    │   │       ├── useRealtimeSensor.ts  ← Hook Supabase realtime
    │   │       └── useNotifications.ts   ← Hook notifikasi
    │   │
    │   └── types/
    │       └── index.ts               ← Global TypeScript types
    │
    └── supabase/
        └── schema.sql                 ← SQL untuk setup database
```

---

## 6. Database Schema (Supabase)

### Tabel: `sensor_readings`

```sql
-- Data dari ESP32, insert setiap ~10 detik
CREATE TABLE sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,        -- Suhu dalam °C
  humidity    DECIMAL(5,2) NOT NULL,        -- Kelembaban dalam %RH
  heat_index  DECIMAL(5,2),                 -- Heat index kalkulasi
  status      TEXT NOT NULL DEFAULT 'NORMAL', -- NORMAL/WARNING/DANGER/CRITICAL
  device_id   TEXT NOT NULL DEFAULT 'esp32-001', -- ID perangkat
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Index untuk query performa
CREATE INDEX idx_sensor_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX idx_sensor_device_id ON sensor_readings(device_id);
-- Realtime enabled
ALTER TABLE sensor_readings REPLICA IDENTITY FULL;
```

### Tabel: `warning_rules`

```sql
-- Rules yang bisa di-CRUD oleh admin
CREATE TABLE warning_rules (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,              -- Nama rule, contoh: "Suhu Terlalu Tinggi"
  parameter     TEXT NOT NULL,             -- 'temperature' | 'humidity' | 'heat_index'
  condition     TEXT NOT NULL,             -- 'gt' | 'lt' | 'gte' | 'lte'
  threshold     DECIMAL(6,2) NOT NULL,     -- Nilai ambang batas
  severity      TEXT NOT NULL,             -- 'WARNING' | 'DANGER' | 'CRITICAL'
  message       TEXT NOT NULL,             -- Pesan notifikasi
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  notify_email  BOOLEAN NOT NULL DEFAULT FALSE, -- Kirim email?
  notify_sound  BOOLEAN NOT NULL DEFAULT TRUE,  -- Aktifkan buzzer?
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tabel: `notifications`

```sql
-- Log setiap notifikasi/peringatan yang terjadi
CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  rule_id     BIGINT REFERENCES warning_rules(id) ON DELETE SET NULL,
  rule_name   TEXT,                        -- Snapshot nama rule saat notif
  severity    TEXT NOT NULL,
  message     TEXT NOT NULL,
  reading_id  BIGINT REFERENCES sensor_readings(id) ON DELETE SET NULL,
  temperature DECIMAL(5,2),               -- Snapshot nilai saat notif
  humidity    DECIMAL(5,2),
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notif_is_read ON notifications(is_read);
-- Realtime enabled untuk notifikasi live
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

### Tabel: `system_settings`

```sql
-- Pengaturan global sistem
CREATE TABLE system_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seed data default
INSERT INTO system_settings (key, value) VALUES
  ('sensor_interval_seconds', '10'),
  ('email_notifications_enabled', 'false'),
  ('admin_email', ''),
  ('device_id', 'esp32-001'),
  ('system_name', 'O'Maggot Box');
```

---

## 7. Fitur Lengkap — Admin Panel

### 7.1 Dashboard Real-time

- **Kartu metrik utama**: Suhu saat ini, Kelembaban saat ini, Heat Index, Status perangkat
- **Status badge**: NORMAL (hijau) / WARNING (kuning) / DANGER (oranye) / CRITICAL (merah)
- **Chart real-time**: Line chart suhu & kelembaban 1 jam terakhir, auto-update via Supabase Realtime
- **Panel notifikasi live**: Muncul di pojok kanan atas ketika ada warning baru
- **Status device**: Online/Offline + kapan terakhir kirim data (heartbeat check)
- **Statistik harian**: Min/Max/Avg suhu dan kelembaban hari ini

### 7.2 CRUD Warning Rules

- Buat rule baru (pilih parameter, kondisi, threshold, severity, pesan)
- Edit rule yang ada
- Aktifkan / nonaktifkan rule tanpa hapus
- Hapus rule (dengan konfirmasi)
- Preview: simulasi rule dengan data terkini
- **Default rules** yang di-seed otomatis:
  - Suhu > 38°C → DANGER
  - Suhu < 22°C → WARNING  
  - Kelembaban < 50% → DANGER
  - Kelembaban > 85% → WARNING
  - Kelembaban < 40% → CRITICAL

### 7.3 Export Laporan

- Pilih rentang tanggal (date range picker)
- Pilih format: **CSV** atau **JSON**
- Filter berdasarkan status (semua / warning saja / danger saja)
- Preview jumlah data yang akan diexport sebelum download
- Nama file otomatis: `maggot-report-YYYY-MM-DD.csv`

### 7.4 Manajemen Data

- **Clear data**: Hapus data sensor dari rentang waktu tertentu
- Konfirmasi double (ketik "HAPUS" untuk konfirmasi) sebelum delete
- Opsi: hapus juga notifikasi terkait atau tidak
- Log aktivitas: siapa menghapus apa dan kapan

### 7.5 Settings & Test

- Test koneksi Supabase (ping database)
- Test API endpoint (simulasi POST dari ESP32)
- Test notifikasi (kirim notif dummy ke panel)
- Lihat info sistem: versi, uptime, jumlah data tersimpan
- **Konfigurasi**: interval pengiriman data, nama sistem
- Lihat raw data 10 data terakhir (untuk debug)

### 7.6 Notifikasi Admin (fitur kritis yang sering terlupakan)

- **Notification center** di header: bell icon + badge jumlah unread
- Slide-out panel menampilkan riwayat notifikasi
- Mark as read individual atau semua sekaligus
- Filter: semua / belum dibaca / by severity
- **Browser push notification** (jika izin diberikan)
- Toast notification muncul real-time saat tab aktif

### 7.7 Fitur Tambahan (Critical Thinking — yang belum ter-list)

Setelah menganalisis sistem monitoring industri serupa, berikut fitur yang **wajib** ditambahkan agar sistem komprehensif:

| Fitur | Alasan |
|---|---|
| **Device heartbeat monitor** | ESP32 bisa disconnect. Jika tidak ada data >2 menit, tampilkan "Device Offline" dan notifikasi. Tanpa ini admin tidak tahu apakah "tidak ada warning" = kondisi baik atau = sensor mati. |
| **Grafik tren harian/mingguan** | Satu titik data tidak bermakna. Tren naik/turun suhu selama 24 jam sangat penting untuk keputusan intervensi. |
| **Riwayat notifikasi** | Tanpa log, admin tidak bisa mengaudit "kapan terjadi anomali kemarin". |
| **Statistik agregasi** (min/max/avg) | Untuk laporan akademik dan keputusan budidaya. |
| **Status "Acknowledged"** pada notifikasi | Admin bisa tandai "sudah ditangani" untuk membedakan dari yang belum direspons. |
| **API key untuk ESP32** | Tanpa auth, siapapun bisa POST data palsu ke endpoint. Gunakan header `x-api-key`. |
| **Data retention info** | Tampilkan berapa banyak data tersimpan, sejak kapan, agar admin tahu perlu clear atau tidak. |
| **Kondisi ideal indicator** | Tampilkan apakah kondisi saat ini "ideal untuk fase larva instar 1/2/3" — value add edukasi. |

---

## 8. Desain Visual (dari DESIGN_md.md)

### Color Palette — CSS Variables

```css
/* globals.css — salin persis ini */
:root {
  --primary:        #cc785c;
  --primary-active: #a9583e;
  --primary-disabled:#e6dfd8;
  --ink:            #141413;
  --body:           #3d3d3a;
  --body-strong:    #252523;
  --muted:          #6c6a64;
  --muted-soft:     #8e8b82;
  --hairline:       #e6dfd8;
  --canvas:         #faf9f5;
  --surface-soft:   #f5f0e8;
  --surface-card:   #efe9de;
  --surface-cream-strong: #e8e0d2;
  --surface-dark:   #181715;
  --surface-dark-elevated: #252320;
  --on-primary:     #ffffff;
  --on-dark:        #faf9f5;
  --on-dark-soft:   #a09d96;
  --accent-teal:    #5db8a6;
  --accent-amber:   #e8a55a;
  --success:        #5db872;
  --warning:        #d4a017;
  --error:          #c64545;
}
```

### Typography

- **Display/Heading**: `'Lora', 'EB Garamond', Georgia, serif` (substitusi Copernicus)
- **Body/UI**: `'DM Sans', 'Inter', sans-serif` (substitusi StyreneB)
- **Code**: `'JetBrains Mono', monospace`
- Font weight display: selalu **400** (tidak pernah bold untuk serif)

### Prinsip Visual Utama

1. Canvas selalu **cream** (`#faf9f5`) — tidak pernah putih murni
2. Coral (`#cc785c`) hanya untuk CTA primer dan callout cards — langka dan impactful
3. Dark navy (`#181715`) untuk product mockup cards dan footer
4. Alternasi ritme: cream → cream-card → dark → cream → coral → dark-footer
5. Serif untuk semua heading display, sans untuk semua body teks

### Mapping Status Sensor ke Warna

```
NORMAL   → var(--success)  #5db872 (hijau)
WARNING  → var(--warning)  #d4a017 (amber)
DANGER   → var(--accent-amber) #e8a55a (oranye)
CRITICAL → var(--error)    #c64545 (merah)
OFFLINE  → var(--muted)    #6c6a64 (abu)
```

---

## 9. Konvensi Kode

### TypeScript Types Utama

```typescript
// src/types/index.ts

export type SensorStatus = 'NORMAL' | 'WARNING' | 'DANGER' | 'CRITICAL';
export type RuleCondition = 'gt' | 'lt' | 'gte' | 'lte';
export type RuleParameter = 'temperature' | 'humidity' | 'heat_index';
export type RuleSeverity = 'WARNING' | 'DANGER' | 'CRITICAL';

export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  heat_index: number | null;
  status: SensorStatus;
  device_id: string;
  recorded_at: string;
}

export interface WarningRule {
  id: number;
  name: string;
  parameter: RuleParameter;
  condition: RuleCondition;
  threshold: number;
  severity: RuleSeverity;
  message: string;
  is_active: boolean;
  notify_sound: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  rule_id: number | null;
  rule_name: string | null;
  severity: RuleSeverity;
  message: string;
  reading_id: number | null;
  temperature: number | null;
  humidity: number | null;
  is_read: boolean;
  created_at: string;
}
```

### Konvensi Penamaan

- **Komponen React**: PascalCase (`SensorCard.tsx`)
- **Functions/hooks**: camelCase (`useRealtimeSensor`)
- **API routes**: kebab-case dalam URL (`/api/sensor/latest`)
- **Database columns**: snake_case (`recorded_at`, `is_active`)
- **CSS classes**: gunakan Tailwind, hindari custom class kecuali di globals.css
- **Constants**: UPPER_SNAKE_CASE (`TEMP_OPTIMAL_MIN = 25`)

### Aturan Kode

1. Setiap file **maksimal 400 baris** — pecah jika lebih
2. Setiap fungsi wajib memiliki JSDoc comment minimal satu baris
3. Semua API route wajib handle error dengan response yang konsisten:

   ```typescript
   // Success
   return NextResponse.json({ success: true, data: ... })
   // Error
   return NextResponse.json({ success: false, error: 'Pesan error' }, { status: 400 })
   ```

4. Gunakan Supabase **server client** untuk API routes, **browser client** untuk realtime di frontend
5. Jangan hardcode nilai threshold — selalu ambil dari tabel `warning_rules`

---

## 10. Setup & Cara Menjalankan Proyek

### Prerequisites

- Node.js v18+
- Arduino IDE 2.x atau PlatformIO
- Akun Supabase (gratis)

### Langkah 1: Clone & Install

```bash
git clone <repo-url>
cd smart-maggot-box/web
npm install
```

### Langkah 2: Setup Supabase

1. Buat project baru di <https://supabase.com>
2. Buka **SQL Editor** di Supabase dashboard
3. Copy-paste isi file `supabase/schema.sql` dan klik **Run**
4. Buka **Settings → API** → copy `Project URL` dan `anon key`

### Langkah 3: Setup Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local dengan nilai dari Supabase:
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # Untuk operasi server-side
ESP32_API_KEY=maggot-secret-key-2024    # API key untuk autentikasi ESP32
```

### Langkah 4: Buat Admin User

1. Di Supabase dashboard → **Authentication → Users**
2. Klik **Invite User** atau **Add User**
3. Masukkan email & password admin
4. User ini yang digunakan login di `/admin/login`

### Langkah 5: Jalankan Web

```bash
cd web
npm run dev
# Buka http://localhost:3000
```

### Langkah 6: Upload ke ESP32

Lihat panduan lengkap di `esp32/README.md`

---

## 11. Panduan Upload ESP32

> Detail ada di `esp32/README.md`. Ringkasan:

1. Install **Arduino IDE 2.x**
2. Tambah board ESP32: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install library: `DHT sensor library` by Adafruit, `ArduinoJson`
4. Edit `esp32/config.h`:

   ```cpp
   #define WIFI_SSID "nama_wifi_kamu"
   #define WIFI_PASSWORD "password_wifi"
   #define API_URL "http://192.168.x.x:3000/api/sensor"  // IP laptop di LAN
   #define API_KEY "maggot-secret-key-2024"
   ```

5. Buka `smart_maggot_box.ino` di Arduino IDE
6. Pilih board: **ESP32 Dev Module**, port sesuai
7. Upload

---

## 12. Alur Data Detail

```
1. ESP32 baca DHT22 setiap SENSOR_INTERVAL (default: 10 detik)
2. Hitung heat index dari suhu + kelembaban
3. Tentukan status lokal berdasarkan threshold default (hardcoded di ESP32 sebagai fallback)
4. Kontrol LED + Buzzer sesuai status
5. HTTP POST ke /api/sensor:
   {
     "temperature": 31.5,
     "humidity": 72.3,
     "device_id": "esp32-001",
     "api_key": "maggot-secret-key-2024"
   }
6. API /api/sensor:
   a. Validasi api_key
   b. Hitung heat_index server-side
   c. Evaluasi semua warning_rules yang is_active=true
   d. Tentukan status final
   e. INSERT ke sensor_readings
   f. Jika status WARNING/DANGER/CRITICAL: INSERT ke notifications
   g. Return { success: true, status: "DANGER", ... }
7. Supabase Realtime broadcast perubahan ke frontend
8. Frontend update chart + kartu metrik + notification panel secara otomatis
```

---

## 13. API Reference

### POST /api/sensor

Endpoint ini dipanggil oleh ESP32 setiap interval.

**Request Body**:

```json
{
  "temperature": 31.5,
  "humidity": 72.3,
  "device_id": "esp32-001",
  "api_key": "maggot-secret-key-2024"
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "id": 1234,
    "status": "NORMAL",
    "heat_index": 33.2
  }
}
```

### GET /api/sensor?limit=100&from=2024-01-01&to=2024-01-31

Ambil data historis dengan filter opsional.

### GET /api/sensor/latest

Ambil 1 data terbaru. Digunakan untuk heartbeat check.

### GET /api/rules

Ambil semua warning rules.

### POST /api/rules

Buat rule baru.

### PUT /api/rules/[id]

Update rule (termasuk toggle is_active).

### DELETE /api/rules/[id]

Hapus rule.

### POST /api/notify/test

Test sistem notifikasi dengan data dummy.

### GET /api/export?from=&to=&format=csv&status=all

Export data. Format: `csv` atau `json`.

### DELETE /api/data/clear

Body: `{ "from": "2024-01-01", "to": "2024-01-15", "also_notifications": true }`

---

## 14. Checklist Implementasi

### Phase 1: Foundation

- [ ] Setup Next.js project dengan Tailwind
- [ ] Setup Supabase dan jalankan schema.sql
- [ ] Buat Supabase client (browser + server)
- [ ] Definisikan TypeScript types
- [ ] Buat globals.css dengan CSS variables dari design

### Phase 2: Backend API

- [ ] POST /api/sensor (dengan validasi API key)
- [ ] GET /api/sensor dan /api/sensor/latest
- [ ] CRUD /api/rules
- [ ] POST /api/notify/test
- [ ] GET /api/export
- [ ] DELETE /api/data/clear

### Phase 3: Frontend — Landing Page

- [ ] Navbar
- [ ] Hero section
- [ ] Feature section (menjelaskan sistem)
- [ ] Stats section
- [ ] Footer

### Phase 4: Frontend — Admin

- [ ] Login page + auth dengan Supabase
- [ ] Admin layout dengan sidebar
- [ ] Dashboard: SensorCard, StatusBadge, RealtimeChart
- [ ] Dashboard: NotificationPanel, DeviceStatus
- [ ] Rules: tabel + form CRUD
- [ ] Reports: date picker + export
- [ ] Settings: test API + info sistem

### Phase 5: Hardware

- [ ] config.h
- [ ] Koneksi WiFi + reconnect handler
- [ ] Baca DHT22
- [ ] Kontrol LED + Buzzer
- [ ] HTTP POST ke API
- [ ] Serial monitor output untuk debug

### Phase 6: Integrasi & Test

- [ ] End-to-end test: ESP32 → API → Supabase → Frontend
- [ ] Test semua warning rules
- [ ] Test export CSV
- [ ] Test clear data
- [ ] Test device offline detection

---

## 15. Hal yang Harus DIHINDARI

1. **Jangan** gunakan `useEffect` untuk polling — gunakan Supabase Realtime subscription
2. **Jangan** hardcode threshold di frontend — ambil dari `warning_rules` tabel
3. **Jangan** simpan `SUPABASE_SERVICE_ROLE_KEY` di client-side code
4. **Jangan** lupa handle ESP32 disconnect — implementasi heartbeat check
5. **Jangan** gunakan warna yang tidak ada di CSS variables
6. **Jangan** buat komponen > 400 baris — pecah menjadi komponen lebih kecil
7. **Jangan** lupa validasi `api_key` di setiap request dari ESP32
8. **Jangan** gunakan `any` TypeScript — selalu definisikan type dengan benar

---

## 16. Referensi & Sumber

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [DHT22 Datasheet](https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf)
- [BSF Optimal Conditions Research](https://doi.org/10.1016/j.wasman.2019.03.045) — optimal temp 27-32°C, humidity 65-75%
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)

---

*Dokumen ini dibuat untuk proyek Tugas Besar Semester 4.*  
*Last updated: 2024 | Versi: 1.0*
