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
  notify_email: boolean;
  notify_sound: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
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

export interface SystemSetting {
  key: string;
  value: string;
  updated_at: string;
}
