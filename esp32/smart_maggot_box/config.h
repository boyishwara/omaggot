#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
// We use WiFiManager now, so no hardcoded SSID/Password is needed here.

// API & MQTT Configuration
#define HIVEMQ_HOST "e89ede5cee8445aa808be2775eb952fb.s1.eu.hivemq.cloud"
#define HIVEMQ_PORT 8883
#define HIVEMQ_USERNAME "boy_hivemq"
#define HIVEMQ_PASSWORD "WsJYAEpM42d3ufC"

#define API_KEY "maggot-secret-key-2024"
#if defined(ESP8266)
#define DEVICE_ID "esp8266-001"
#else
#define DEVICE_ID "esp32-001"
#endif

// Timing Configuration
#define SENSOR_INTERVAL 10000 // Waktu jeda pengiriman data (dalam milidetik)

// Hardware Pins
#if defined(ESP8266)
// NodeMCU/Wemos Pins
#define DHTPIN 4      // D2 pada NodeMCU
#define DHTTYPE DHT21

#define LED_GREEN 5   // D1 pada NodeMCU
#define LED_RED 14    // D5 pada NodeMCU
#define BUZZER 12     // D6 pada NodeMCU
#else
// ESP32 Pins
#define DHTPIN 4
#define DHTTYPE DHT21

#define LED_GREEN 18
#define LED_RED 19
#define BUZZER 21
#endif

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
