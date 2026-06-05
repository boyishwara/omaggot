const mqtt = require('mqtt');
// Node 18+ has built-in fetch, so no external module needed.
require('dotenv').config({ path: '.env.local' });

// HiveMQ Configuration
const clientId = 'maggotbox_backend_' + Math.random().toString(16).substr(2, 8);
const host = process.env.HIVEMQ_HOST; // e.g., 'your-cluster.hivemq.cloud'
const port = process.env.HIVEMQ_PORT || 8883;
const username = process.env.HIVEMQ_USERNAME;
const password = process.env.HIVEMQ_PASSWORD;

if (!host || !username || !password) {
  console.error("Missing HiveMQ credentials in .env.local! (HIVEMQ_HOST, HIVEMQ_USERNAME, HIVEMQ_PASSWORD)");
  process.exit(1);
}

const connectUrl = `mqtts://${host}:${port}`;
const client = mqtt.connect(connectUrl, {
  clientId,
  username,
  password,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

const API_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/sensor` : 'http://localhost:3000/api/sensor';
const API_KEY = process.env.ESP32_API_KEY || 'maggot-secret-key-2024';

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ Cloud');
  client.subscribe(['maggotbox/sensor/data'], () => {
    console.log(`✅ Subscribed to topic: maggotbox/sensor/data`);
  });
});

client.on('message', async (topic, payload) => {
  if (topic === 'maggotbox/sensor/data') {
    try {
      const data = JSON.parse(payload.toString());
      console.log('📥 Received data from ESP32:', data);

      // Inject API Key expected by the Next.js API
      data.api_key = API_KEY;

      // Post to Next.js API to process logic (Supabase Insert, Rules, Notifications)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success && result.data && result.data.status) {
        const systemStatus = result.data.status;
        console.log(`📤 Publishing status update to ESP32: ${systemStatus}`);
        
        // Publish the determined status back to MQTT for the ESP32 to act on (LED/Buzzer)
        client.publish('maggotbox/sensor/status', systemStatus, { qos: 1 });
      } else {
        console.error('API Error:', result.error);
      }
    } catch (error) {
      console.error('Failed to process MQTT message:', error);
    }
  }
});

client.on('error', (error) => {
  console.error('MQTT Connection Error:', error);
});
