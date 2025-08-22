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
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          password: string | null
          provider: string
          provider_id: string | null
          email_verified: boolean
          phone: string | null
          address: Json | null
          background_check_status: string | null
          background_check_date: string | null
          youth_protection_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          password?: string | null
          provider?: string
          provider_id?: string | null
          email_verified?: boolean
          phone?: string | null
          address?: Json | null
          background_check_status?: string | null
          background_check_date?: string | null
          youth_protection_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          password?: string | null
          provider?: string
          provider_id?: string | null
          email_verified?: boolean
          phone?: string | null
          address?: Json | null
          background_check_status?: string | null
          background_check_date?: string | null
          youth_protection_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      troops: {
        Row: {
          id: string
          name: string
          description: string | null
          address: Json
          charter_organization: string
          meeting_schedule: string
          meeting_location: string
          contact_email: string
          contact_phone: string
          status: Database['public']['Enums']['troop_status']
          founded_date: string
          troop_size_limit: number
          created_at: string
          updated_at: string
          created_by_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: Json
          charter_organization: string
          meeting_schedule: string
          meeting_location: string
          contact_email: string
          contact_phone: string
          status?: Database['public']['Enums']['troop_status']
          founded_date: string
          troop_size_limit?: number
          created_at?: string
          updated_at?: string
          created_by_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: Json
          charter_organization?: string
          meeting_schedule?: string
          meeting_location?: string
          contact_email?: string
          contact_phone?: string
          status?: Database['public']['Enums']['troop_status']
          founded_date?: string
          troop_size_limit?: number
          created_at?: string
          updated_at?: string
          created_by_id?: string
        }
      }
      user_troop_roles: {
        Row: {
          id: string
          user_id: string
          troop_id: string
          role: Database['public']['Enums']['user_role']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          troop_id: string
          role: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          troop_id?: string
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
      }
      scouts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: Database['public']['Enums']['gender']
          address: Json
          school: Json
          medical_info: Json | null
          emergency_contacts: Json
          photo_consent: boolean
          photo_url: string | null
          current_rank: Database['public']['Enums']['scout_rank']
          created_at: string
          updated_at: string
          troop_id: string
          parent_id: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: Database['public']['Enums']['gender']
          address: Json
          school: Json
          medical_info?: Json | null
          emergency_contacts: Json
          photo_consent?: boolean
          photo_url?: string | null
          current_rank?: Database['public']['Enums']['scout_rank']
          created_at?: string
          updated_at?: string
          troop_id: string
          parent_id: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: Database['public']['Enums']['gender']
          address?: Json
          school?: Json
          medical_info?: Json | null
          emergency_contacts?: Json
          photo_consent?: boolean
          photo_url?: string | null
          current_rank?: Database['public']['Enums']['scout_rank']
          created_at?: string
          updated_at?: string
          troop_id?: string
          parent_id?: string
        }
      }
      rank_advancements: {
        Row: {
          id: string
          scout_id: string
          rank: Database['public']['Enums']['scout_rank']
          awarded_date: string
          board_date: string | null
          board_members: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scout_id: string
          rank: Database['public']['Enums']['scout_rank']
          awarded_date: string
          board_date?: string | null
          board_members?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scout_id?: string
          rank?: Database['public']['Enums']['scout_rank']
          awarded_date?: string
          board_date?: string | null
          board_members?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      merit_badges: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      scout_merit_badges: {
        Row: {
          id: string
          scout_id: string
          badge_id: string
          start_date: string
          completed_date: string | null
          counselor: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scout_id: string
          badge_id: string
          start_date: string
          completed_date?: string | null
          counselor?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scout_id?: string
          badge_id?: string
          start_date?: string
          completed_date?: string | null
          counselor?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          type: Database['public']['Enums']['event_type']
          start_date: string
          end_date: string | null
          location: string | null
          max_capacity: number | null
          cost: number | null
          rsvp_deadline: string | null
          requires_rsvp: boolean
          created_at: string
          updated_at: string
          troop_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: Database['public']['Enums']['event_type']
          start_date: string
          end_date?: string | null
          location?: string | null
          max_capacity?: number | null
          cost?: number | null
          rsvp_deadline?: string | null
          requires_rsvp?: boolean
          created_at?: string
          updated_at?: string
          troop_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: Database['public']['Enums']['event_type']
          start_date?: string
          end_date?: string | null
          location?: string | null
          max_capacity?: number | null
          cost?: number | null
          rsvp_deadline?: string | null
          requires_rsvp?: boolean
          created_at?: string
          updated_at?: string
          troop_id?: string
        }
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          scout_id: string | null
          status: Database['public']['Enums']['rsvp_status']
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          scout_id?: string | null
          status?: Database['public']['Enums']['rsvp_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          scout_id?: string | null
          status?: Database['public']['Enums']['rsvp_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          subject: string
          content: string
          type: Database['public']['Enums']['message_type']
          priority: Database['public']['Enums']['priority']
          created_at: string
          updated_at: string
          sender_id: string
          troop_id: string
          recipient_id: string | null
        }
        Insert: {
          id?: string
          subject: string
          content: string
          type?: Database['public']['Enums']['message_type']
          priority?: Database['public']['Enums']['priority']
          created_at?: string
          updated_at?: string
          sender_id: string
          troop_id: string
          recipient_id?: string | null
        }
        Update: {
          id?: string
          subject?: string
          content?: string
          type?: Database['public']['Enums']['message_type']
          priority?: Database['public']['Enums']['priority']
          created_at?: string
          updated_at?: string
          sender_id?: string
          troop_id?: string
          recipient_id?: string | null
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
      troop_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
      user_role: 'SCOUTMASTER' | 'ASSISTANT_SCOUTMASTER' | 'COMMITTEE_CHAIR' | 'COMMITTEE_MEMBER' | 'PARENT' | 'CHARTERED_ORG_REP' | 'YOUTH_LEADER' | 'ADMIN'
      gender: 'MALE' | 'FEMALE'
      scout_rank: 'SCOUT' | 'TENDERFOOT' | 'SECOND_CLASS' | 'FIRST_CLASS' | 'STAR' | 'LIFE' | 'EAGLE'
      event_type: 'MEETING' | 'CAMPOUT' | 'SERVICE_PROJECT' | 'COURT_OF_HONOR' | 'FUNDRAISER' | 'TRAINING' | 'OTHER'
      rsvp_status: 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'
      message_type: 'GENERAL' | 'ANNOUNCEMENT' | 'EMERGENCY' | 'EVENT_REMINDER' | 'PERMISSION_SLIP'
      priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}