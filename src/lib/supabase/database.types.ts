export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_kits: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          match_id: string
          tips: Json | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          match_id: string
          tips?: Json | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          match_id?: string
          tips?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_kits_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_data: {
        Row: {
          created_at: string
          cv_id: string
          desired_role: string | null
          education: Json
          embedding: string | null
          experience: Json
          full_name: string | null
          headline: string | null
          id: string
          languages: Json
          location: string | null
          seniority: string | null
          skills: string[]
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_id: string
          desired_role?: string | null
          education?: Json
          embedding?: string | null
          experience?: Json
          full_name?: string | null
          headline?: string | null
          id?: string
          languages?: Json
          location?: string | null
          seniority?: string | null
          skills?: string[]
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          cv_id?: string
          desired_role?: string | null
          education?: Json
          embedding?: string | null
          experience?: Json
          full_name?: string | null
          headline?: string | null
          id?: string
          languages?: Json
          location?: string | null
          seniority?: string | null
          skills?: string[]
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_data_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
        ]
      }
      cvs: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string | null
          file_path: string
          id: string
          is_active: boolean
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          file_path: string
          id?: string
          is_active?: boolean
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          file_path?: string
          id?: string
          is_active?: boolean
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          location: string | null
          posted_at: string | null
          raw: Json | null
          region: string | null
          salary: string | null
          source: string
          source_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          location?: string | null
          posted_at?: string | null
          raw?: Json | null
          region?: string | null
          salary?: string | null
          source: string
          source_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          location?: string | null
          posted_at?: string | null
          raw?: Json | null
          region?: string | null
          salary?: string | null
          source?: string
          source_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          cv_id: string | null
          id: string
          job_id: string
          matched_skills: string[]
          missing_skills: string[]
          reasoning: string | null
          score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_id?: string | null
          id?: string
          job_id: string
          matched_skills?: string[]
          missing_skills?: string[]
          reasoning?: string | null
          score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cv_id?: string | null
          id?: string
          job_id?: string
          matched_skills?: string[]
          missing_skills?: string[]
          reasoning?: string | null
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          region?: string | null
          updated_at?: string
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
