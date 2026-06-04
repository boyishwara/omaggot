export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sensor_readings: {
        Row: {
          id: number
          temperature: number
          humidity: number
          heat_index: number | null
          status: string
          device_id: string
          recorded_at: string
        }
        Insert: {
          id?: never
          temperature: number
          humidity: number
          heat_index?: number | null
          status?: string
          device_id?: string
          recorded_at?: string
        }
        Update: {
          id?: never
          temperature?: number
          humidity?: number
          heat_index?: number | null
          status?: string
          device_id?: string
          recorded_at?: string
        }
      }
      warning_rules: {
        Row: {
          id: number
          name: string
          parameter: string
          condition: string
          threshold: number
          severity: string
          message: string
          is_active: boolean
          notify_email: boolean
          notify_sound: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          name: string
          parameter: string
          condition: string
          threshold: number
          severity: string
          message: string
          is_active?: boolean
          notify_email?: boolean
          notify_sound?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          name?: string
          parameter?: string
          condition?: string
          threshold?: number
          severity?: string
          message?: string
          is_active?: boolean
          notify_email?: boolean
          notify_sound?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          rule_id: number | null
          rule_name: string | null
          severity: string
          message: string
          reading_id: number | null
          temperature: number | null
          humidity: number | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: never
          rule_id?: number | null
          rule_name?: string | null
          severity: string
          message: string
          reading_id?: number | null
          temperature?: number | null
          humidity?: number | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: never
          rule_id?: number | null
          rule_name?: string | null
          severity?: string
          message?: string
          reading_id?: number | null
          temperature?: number | null
          humidity?: number | null
          is_read?: boolean
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
