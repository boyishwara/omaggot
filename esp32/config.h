#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"

// API Configuration
// Ganti IP dengan IP lokal laptop/server yang menjalankan Next.js
#define API_URL "http://192.168.1.xxx:3000/api/sensor"
#define API_KEY "maggot-secret-key-2024"
#define DEVICE_ID "esp32-001"

// Timing Configuration
#define SENSOR_INTERVAL 10000 // Waktu jeda pengiriman data (dalam milidetik)

// Hardware Pins
#define DHTPIN 4
#define DHTTYPE DHT22

#define LED_GREEN 26
#define LED_RED 27
#define BUZZER 25

// Hardcoded Thresholds (sebagai fallback jika tidak terhubung server)
#define TEMP_WARNING_HIGH 35.0
#define TEMP_DANGER_HIGH 38.0
#define TEMP_WARNING_LOW 22.0
#define TEMP_DANGER_LOW 18.0

#define HUMIDITY_WARNING_HIGH 85.0
#define HUMIDITY_DANGER_HIGH 90.0
#define HUMIDITY_WARNING_LOW 50.0
#define HUMIDITY_DANGER_LOW 40.0

#endif
