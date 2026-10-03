// Supabase MCP の generate_typescript_types で生成した型（必要部分のみ）。
// tasks テーブルを変更したら再生成して更新してください。
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      tasks: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
