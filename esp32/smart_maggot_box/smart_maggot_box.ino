#if defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#else
#include <WiFi.h>
#include <HTTPClient.h>
#endif

#include <DHT.h>
#include <ArduinoJson.h>
#include "config.h"

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastReadTime = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  dht.begin();
  
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  if (millis() - lastReadTime >= SENSOR_INTERVAL) {
    lastReadTime = millis();
    readAndSendData();
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void readAndSendData() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.print("Temp: ");
  Serial.print(t);
  Serial.print(" C, Humidity: ");
  Serial.print(h);
  Serial.println(" %");

  // HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
#if defined(ESP8266)
    WiFiClient client;
    HTTPClient http;
    http.begin(client, API_URL);
#else
    HTTPClient http;
    http.begin(API_URL);
#endif
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["device_id"] = DEVICE_ID;
    doc["api_key"] = API_KEY;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
      
      // Parse response to get final status determined by the server rules
      StaticJsonDocument<200> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error && responseDoc["success"] == true) {
        String status = responseDoc["data"]["status"];
        handleLocalIndicators(status);
      }
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      handleLocalFallbackIndicators(t, h);
    }
    
    http.end();
  }
}

void handleLocalIndicators(String status) {
  if (status == "NORMAL") {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER);
  } else if (status == "WARNING") {
    // Blink green
    digitalWrite(LED_GREEN, millis() % 1000 < 500 ? HIGH : LOW);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER);
  } else if (status == "DANGER") {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    // Beep buzzer slowly
    if (millis() % 2000 < 1000) tone(BUZZER, 1000);
    else noTone(BUZZER);
  } else if (status == "CRITICAL") {
    digitalWrite(LED_GREEN, LOW);
    // Blink red quickly
    digitalWrite(LED_RED, millis() % 400 < 200 ? HIGH : LOW);
    // Continuous buzzer
    tone(BUZZER, 1000);
  }
}

void handleLocalFallbackIndicators(float t, float h) {
  if (t > TEMP_DANGER_HIGH || t < TEMP_DANGER_LOW || h > HUMIDITY_DANGER_HIGH || h < HUMIDITY_DANGER_LOW) {
    handleLocalIndicators("CRITICAL");
  } else if (t > TEMP_WARNING_HIGH || t < TEMP_WARNING_LOW || h > HUMIDITY_WARNING_HIGH || h < HUMIDITY_WARNING_LOW) {
    handleLocalIndicators("WARNING");
  } else {
    handleLocalIndicators("NORMAL");
  }
}
