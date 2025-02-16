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
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          role: 'user' | 'admin'
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          role?: 'user' | 'admin'
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          role?: 'user' | 'admin'
        }
      }
      content_items: {
        Row: {
          id: string
          title: string
          description: string
          type: 'wallpapers' | 'ringtones'
          url: string
          category: string
          user_id: string
          created_at: string
          downloads: number
          is_approved: boolean
          copyright_info: string | null
          tags: string[]
          file_size: number
          dimensions: string | null
          duration: number | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'wallpapers' | 'ringtones'
          url: string
          category: string
          user_id: string
          created_at?: string
          downloads?: number
          is_approved?: boolean
          copyright_info?: string | null
          tags?: string[]
          file_size?: number
          dimensions?: string | null
          duration?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'wallpapers' | 'ringtones'
          url?: string
          category?: string
          user_id?: string
          created_at?: string
          downloads?: number
          is_approved?: boolean
          copyright_info?: string | null
          tags?: string[]
          file_size?: number
          dimensions?: string | null
          duration?: number | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'wallpapers' | 'ringtones'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'wallpapers' | 'ringtones'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'wallpapers' | 'ringtones'
          created_at?: string
        }
      }
      likes: {
        Row: {
          content_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          content_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          content_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}