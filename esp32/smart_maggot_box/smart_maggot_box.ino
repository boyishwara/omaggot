#if defined(ESP8266)
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif

#include <WiFiManager.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include "config.h"

DHT dht(DHTPIN, DHTTYPE);

// WiFi & MQTT Clients
WiFiClientSecure espClient;
PubSubClient mqtt(espClient);

unsigned long lastReadTime = 0;
String currentStatus = "NORMAL";

void setup() {
  Serial.begin(115200);
  
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  dht.begin();
  
  // HiveMQ uses TLS port 8883, we must skip cert verification for simplicity on ESP
  espClient.setInsecure(); 
  mqtt.setServer(HIVEMQ_HOST, HIVEMQ_PORT);
  mqtt.setCallback(mqttCallback);

  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  if (!mqtt.connected()) {
    connectMQTT();
  }
  
  mqtt.loop();
  
  // Continuously update LEDs and Buzzer based on currentStatus
  updateHardwareIndicators();
  
  if (millis() - lastReadTime >= SENSOR_INTERVAL) {
    lastReadTime = millis();
    readAndPublishData();
  }
}

void connectWiFi() {
  Serial.println("Starting WiFiManager...");
  WiFiManager wifiManager;
  
  // Set the portal to stay open for 60 seconds (1 minute)
  wifiManager.setConfigPortalTimeout(60);
  
  Serial.println("Opening setup window for 60 seconds...");
  Serial.println("Connect to 'MaggotBox-Setup' NOW if you want to change WiFi.");
  
  // This FORCES the portal to open every time it boots.
  // If you configure it within 60s, it saves and connects.
  // If you do nothing, it times out (returns false) and moves on.
  if (!wifiManager.startConfigPortal("MaggotBox-Setup")) {
    Serial.println("Setup window closed. Attempting to connect to saved WiFi...");
    
    // Attempt to connect using the previously saved credentials
    WiFi.begin(); 
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
      delay(500);
      Serial.print(".");
      retries++;
    }
    
    // If it still can't connect after retrying, restart to try again
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\nFailed to connect to saved WiFi. Restarting...");
      delay(3000);
      ESP.restart(); 
    }
  }
  
  Serial.println("\nWiFi connected successfully!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Connecting to HiveMQ MQTT...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    
    // Connect using credentials from config.h
    if (mqtt.connect(clientId.c_str(), HIVEMQ_USERNAME, HIVEMQ_PASSWORD)) {
      Serial.println("connected");
      // Subscribe to status updates from the Node.js backend
      mqtt.subscribe("maggotbox/sensor/status");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  if (String(topic) == "maggotbox/sensor/status") {
    Serial.println("Received status: " + message);
    currentStatus = message;
  }
}

void readAndPublishData() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.print("Temp: ");
  Serial.print(t);
  Serial.println(" C");

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["device_id"] = DEVICE_ID;
  
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);
  
  // Publish to HiveMQ
  if (mqtt.publish("maggotbox/sensor/data", jsonBuffer)) {
    Serial.println("Data published successfully via MQTT");
  } else {
    Serial.println("Failed to publish data via MQTT");
    handleLocalFallbackIndicators(t, h);
  }
}

void updateHardwareIndicators() {
  if (currentStatus == "NORMAL" || currentStatus == "NONE") {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER);
  } else if (currentStatus == "WARNING") {
    digitalWrite(LED_GREEN, millis() % 1000 < 500 ? HIGH : LOW);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER);
  } else if (currentStatus == "DANGER") {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    if (millis() % 2000 < 1000) tone(BUZZER, 1000);
    else noTone(BUZZER);
  }
}

void handleLocalFallbackIndicators(float t, float h) {
  if (t > TEMP_DANGER_HIGH || t < TEMP_DANGER_LOW || h > HUMIDITY_DANGER_HIGH || h < HUMIDITY_DANGER_LOW) {
    currentStatus = "DANGER";
  } else if (t > TEMP_WARNING_HIGH || t < TEMP_WARNING_LOW || h > HUMIDITY_WARNING_HIGH || h < HUMIDITY_WARNING_LOW) {
    currentStatus = "WARNING";
  } else {
    currentStatus = "NORMAL";
  }
}
