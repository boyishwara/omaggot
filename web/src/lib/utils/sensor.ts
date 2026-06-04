import type { SensorStatus, RuleSeverity } from '@/types'

// Konstanta
export const TEMP_OPTIMAL_MIN = 25;
export const TEMP_OPTIMAL_MAX = 35;
export const HUMIDITY_OPTIMAL_MIN = 60;
export const HUMIDITY_OPTIMAL_MAX = 80;

// Kalkulasi Heat Index (Sederhana untuk rentang Suhu dan Kelembaban)
// Menggunakan formula Rothfusz (dalam Fahrenheit lalu konversi) atau Steadsman.
// Di sini kita gunakan versi simplifikasi untuk BSF:
export function calculateHeatIndex(temperatureC: number, humidityPercent: number): number {
  // Hanya hitung HI jika suhu >= 26.7 °C (80 °F) dan kelembaban >= 40%
  if (temperatureC < 26.7 || humidityPercent < 40) {
    return temperatureC;
  }
  
  // Konversi C ke F
  const T = (temperatureC * 9/5) + 32;
  const R = humidityPercent;
  
  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -6.83783e-3;
  const c6 = -5.481717e-2;
  const c7 = 1.22874e-3;
  const c8 = 8.5282e-4;
  const c9 = -1.99e-6;
  
  let HI_F = c1 + (c2 * T) + (c3 * R) + (c4 * T * R) + (c5 * T * T) + (c6 * R * R) + (c7 * T * T * R) + (c8 * T * R * R) + (c9 * T * T * R * R);
  
  // Konversi kembali ke C
  return (HI_F - 32) * 5/9;
}

export function determineStatus(temperature: number, humidity: number, rules: any[]): { status: SensorStatus, severityRules: any[] } {
  let finalStatus: SensorStatus = 'NORMAL';
  const triggeredRules = [];
  let severityLevel = 0; // 0: NORMAL, 1: WARNING, 2: DANGER, 3: CRITICAL

  for (const rule of rules) {
    if (!rule.is_active) continue;

    let valueToTest = 0;
    if (rule.parameter === 'temperature') valueToTest = temperature;
    else if (rule.parameter === 'humidity') valueToTest = humidity;
    else if (rule.parameter === 'heat_index') valueToTest = calculateHeatIndex(temperature, humidity);

    let isTriggered = false;
    switch (rule.condition) {
      case 'gt': isTriggered = valueToTest > rule.threshold; break;
      case 'gte': isTriggered = valueToTest >= rule.threshold; break;
      case 'lt': isTriggered = valueToTest < rule.threshold; break;
      case 'lte': isTriggered = valueToTest <= rule.threshold; break;
    }

    if (isTriggered) {
      triggeredRules.push(rule);
      const level = rule.severity === 'CRITICAL' ? 3 : (rule.severity === 'DANGER' ? 2 : 1);
      if (level > severityLevel) {
        severityLevel = level;
      }
    }
  }

  if (severityLevel === 3) finalStatus = 'CRITICAL';
  else if (severityLevel === 2) finalStatus = 'DANGER';
  else if (severityLevel === 1) finalStatus = 'WARNING';

  return { status: finalStatus, severityRules: triggeredRules };
}
