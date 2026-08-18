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
      admin_assignments: {
        Row: {
          admin_id: string
          assigned_by: string | null
          beneficiary_id: string
          created_at: string
          id: string
          notes: string | null
        }
        Insert: {
          admin_id: string
          assigned_by?: string | null
          beneficiary_id: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Update: {
          admin_id?: string
          assigned_by?: string | null
          beneficiary_id?: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      bps_activities: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          sort_order: number
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      bps_daily_checks: {
        Row: {
          activity_id: string
          check_date: string
          created_at: string
          done: boolean
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          check_date: string
          created_at?: string
          done?: boolean
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          check_date?: string
          created_at?: string
          done?: boolean
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bps_daily_checks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "bps_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      bps_monthly_goals: {
        Row: {
          affirmation_percent: number | null
          affirmation_remark: string | null
          affirmation_score: number | null
          affirmation_submitted_at: string | null
          affirmation_total: number | null
          belief_submitted_at: string | null
          created_at: string
          evaluation_percent: number | null
          evaluation_remark: string | null
          evaluation_score: number | null
          evaluation_submitted_at: string | null
          evaluation_total: number | null
          finance_goal: string | null
          finance_items: Json
          id: string
          mlm_goal: string
          mlm_items: Json
          relationship_goal: string | null
          relationship_items: Json
          self_dev_goal: string | null
          self_dev_items: Json
          target_month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affirmation_percent?: number | null
          affirmation_remark?: string | null
          affirmation_score?: number | null
          affirmation_submitted_at?: string | null
          affirmation_total?: number | null
          belief_submitted_at?: string | null
          created_at?: string
          evaluation_percent?: number | null
          evaluation_remark?: string | null
          evaluation_score?: number | null
          evaluation_submitted_at?: string | null
          evaluation_total?: number | null
          finance_goal?: string | null
          finance_items?: Json
          id?: string
          mlm_goal?: string
          mlm_items?: Json
          relationship_goal?: string | null
          relationship_items?: Json
          self_dev_goal?: string | null
          self_dev_items?: Json
          target_month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affirmation_percent?: number | null
          affirmation_remark?: string | null
          affirmation_score?: number | null
          affirmation_submitted_at?: string | null
          affirmation_total?: number | null
          belief_submitted_at?: string | null
          created_at?: string
          evaluation_percent?: number | null
          evaluation_remark?: string | null
          evaluation_score?: number | null
          evaluation_submitted_at?: string | null
          evaluation_total?: number | null
          finance_goal?: string | null
          finance_items?: Json
          id?: string
          mlm_goal?: string
          mlm_items?: Json
          relationship_goal?: string | null
          relationship_items?: Json
          self_dev_goal?: string | null
          self_dev_items?: Json
          target_month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          admin_id: string
          beneficiary_id: string
          created_at: string
          id: string
          mood: string | null
          next_action: string | null
          next_action_due: string | null
          summary: string
        }
        Insert: {
          admin_id: string
          beneficiary_id: string
          created_at?: string
          id?: string
          mood?: string | null
          next_action?: string | null
          next_action_due?: string | null
          summary: string
        }
        Update: {
          admin_id?: string
          beneficiary_id?: string
          created_at?: string
          id?: string
          mood?: string | null
          next_action?: string | null
          next_action_due?: string | null
          summary?: string
        }
        Relationships: []
      }
      cohort_messages: {
        Row: {
          body: string
          cohort_id: string
          created_at: string
          id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          body: string
          cohort_id: string
          created_at?: string
          id?: string
          sender_id: string
          sender_name: string
        }
        Update: {
          body?: string
          cohort_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_messages_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          seq_number: number | null
          start_date: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          seq_number?: number | null
          start_date?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          seq_number?: number | null
          start_date?: string
        }
        Relationships: []
      }
      crm_clients: {
        Row: {
          city: string | null
          contact_email: string | null
          contact_linkedin: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          email_1_sent: boolean
          email_2_sent: boolean
          email_3_sent: boolean
          google_reviews_count: number | null
          id: string
          last_contacted_at: string | null
          lead_score: number | null
          linkedin_connected: boolean
          linkedin_dm_sent: boolean
          name: string
          niche: string | null
          notes: string | null
          path_key: string | null
          priority: string | null
          stage: string
          the_gap: string | null
          the_leak: string | null
          the_lift: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_linkedin?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          email_1_sent?: boolean
          email_2_sent?: boolean
          email_3_sent?: boolean
          google_reviews_count?: number | null
          id?: string
          last_contacted_at?: string | null
          lead_score?: number | null
          linkedin_connected?: boolean
          linkedin_dm_sent?: boolean
          name: string
          niche?: string | null
          notes?: string | null
          path_key?: string | null
          priority?: string | null
          stage?: string
          the_gap?: string | null
          the_leak?: string | null
          the_lift?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_linkedin?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          email_1_sent?: boolean
          email_2_sent?: boolean
          email_3_sent?: boolean
          google_reviews_count?: number | null
          id?: string
          last_contacted_at?: string | null
          lead_score?: number | null
          linkedin_connected?: boolean
          linkedin_dm_sent?: boolean
          name?: string
          niche?: string | null
          notes?: string | null
          path_key?: string | null
          priority?: string | null
          stage?: string
          the_gap?: string | null
          the_leak?: string | null
          the_lift?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      dfy_months: {
        Row: {
          created_at: string
          id: string
          net_income_usd: number
          notes: string | null
          period_month: string
          qualified: boolean
          remittance_owed_usd: number
          remittance_paid: boolean
          remittance_paid_at: string | null
          status: Database["public"]["Enums"]["dfy_month_status"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          net_income_usd: number
          notes?: string | null
          period_month: string
          qualified?: boolean
          remittance_owed_usd?: number
          remittance_paid?: boolean
          remittance_paid_at?: string | null
          status?: Database["public"]["Enums"]["dfy_month_status"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          net_income_usd?: number
          notes?: string | null
          period_month?: string
          qualified?: boolean
          remittance_owed_usd?: number
          remittance_paid?: boolean
          remittance_paid_at?: string | null
          status?: Database["public"]["Enums"]["dfy_month_status"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      escalations: {
        Row: {
          beneficiary_id: string
          created_at: string
          id: string
          level: string
          opened_by: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          beneficiary_id: string
          created_at?: string
          id?: string
          level?: string
          opened_by?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string
          created_at?: string
          id?: string
          level?: string
          opened_by?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          room: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          room?: string
          sender_id: string
          sender_name: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          room?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          cohort_id: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
        }
        Insert: {
          accepted_at?: string | null
          cohort_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
        }
        Update: {
          accepted_at?: string | null
          cohort_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invitations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_checkins: {
        Row: {
          created_at: string
          happened: boolean
          id: string
          logged_by: string
          mentorship_id: string
          note: string | null
          week_of: string
        }
        Insert: {
          created_at?: string
          happened: boolean
          id?: string
          logged_by: string
          mentorship_id: string
          note?: string | null
          week_of: string
        }
        Update: {
          created_at?: string
          happened?: boolean
          id?: string
          logged_by?: string
          mentorship_id?: string
          note?: string | null
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_checkins_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_escalations: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          breach_72h_sent_at: string | null
          classification: string | null
          classification_note: string | null
          created_at: string
          description: string
          id: string
          mentorship_id: string
          raised_at: string
          raised_by: string
          reassigned: boolean
          reminder_48h_sent_at: string | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          review_id: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          breach_72h_sent_at?: string | null
          classification?: string | null
          classification_note?: string | null
          created_at?: string
          description: string
          id?: string
          mentorship_id: string
          raised_at?: string
          raised_by: string
          reassigned?: boolean
          reminder_48h_sent_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          breach_72h_sent_at?: string | null
          classification?: string | null
          classification_note?: string | null
          created_at?: string
          description?: string
          id?: string
          mentorship_id?: string
          raised_at?: string
          raised_by?: string
          reassigned?: boolean
          reminder_48h_sent_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_escalations_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_escalations_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "mentorship_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_reviews: {
        Row: {
          checkpoint_number: number
          created_at: string
          created_by: string
          flag_note: string | null
          flag_raised: boolean
          id: string
          mentee_progress_note: string | null
          mentorship_id: string
          rep_support_assessment: string | null
        }
        Insert: {
          checkpoint_number: number
          created_at?: string
          created_by: string
          flag_note?: string | null
          flag_raised?: boolean
          id?: string
          mentee_progress_note?: string | null
          mentorship_id: string
          rep_support_assessment?: string | null
        }
        Update: {
          checkpoint_number?: number
          created_at?: string
          created_by?: string
          flag_note?: string | null
          flag_raised?: boolean
          id?: string
          mentee_progress_note?: string | null
          mentorship_id?: string
          rep_support_assessment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_reviews_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          created_at: string
          ended_at: string | null
          ended_reason: string | null
          id: string
          mentee_confirmed: boolean
          mentee_id: string
          mentor_confirmed: boolean
          mentor_id: string
          requested_at: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          mentee_confirmed?: boolean
          mentee_id: string
          mentor_confirmed?: boolean
          mentor_id: string
          requested_at?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          mentee_confirmed?: boolean
          mentee_id?: string
          mentor_confirmed?: boolean
          mentor_id?: string
          requested_at?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      paths: {
        Row: {
          active: boolean
          created_at: string
          key: string
          name: string
          sort_order: number
          tagline: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          key: string
          name: string
          sort_order?: number
          tagline: string
        }
        Update: {
          active?: boolean
          created_at?: string
          key?: string
          name?: string
          sort_order?: number
          tagline?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          cohort_id: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          google_calendar_connected: boolean
          google_refresh_token: string | null
          id: string
          niche: string | null
          path_auto_assigned: boolean
          path_chosen_at: string | null
          path_deadline: string | null
          path_key: string | null
          positioning_statement: string | null
          rank: Database["public"]["Enums"]["rank_tier"]
          reinstatement_fee_usd: number
          start_date: string | null
          suspended: boolean
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string
          vetted_dse_certified_at: string | null
          vetted_dse_certified_by: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cohort_id?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          google_calendar_connected?: boolean
          google_refresh_token?: string | null
          id: string
          niche?: string | null
          path_auto_assigned?: boolean
          path_chosen_at?: string | null
          path_deadline?: string | null
          path_key?: string | null
          positioning_statement?: string | null
          rank?: Database["public"]["Enums"]["rank_tier"]
          reinstatement_fee_usd?: number
          start_date?: string | null
          suspended?: boolean
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
          vetted_dse_certified_at?: string | null
          vetted_dse_certified_by?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cohort_id?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          google_calendar_connected?: boolean
          google_refresh_token?: string | null
          id?: string
          niche?: string | null
          path_auto_assigned?: boolean
          path_chosen_at?: string | null
          path_deadline?: string | null
          path_key?: string | null
          positioning_statement?: string | null
          rank?: Database["public"]["Enums"]["rank_tier"]
          reinstatement_fee_usd?: number
          start_date?: string | null
          suspended?: boolean
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
          vetted_dse_certified_at?: string | null
          vetted_dse_certified_by?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_path_key_fkey"
            columns: ["path_key"]
            isOneToOne: false
            referencedRelation: "paths"
            referencedColumns: ["key"]
          },
        ]
      }
      task_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          day_number: number | null
          id: string
          notes: string | null
          playbook: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number?: number | null
          id?: string
          notes?: string | null
          playbook: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number?: number | null
          id?: string
          notes?: string | null
          playbook?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          at_risk: boolean
          blockers: string | null
          calls_booked: number
          clients_closed: number
          created_at: string
          demos_built: number
          id: string
          next_week_focus: string | null
          outreach_count: number
          revenue_usd: number
          tasks_completed: number
          user_id: string
          week_number: number
          wins: string | null
        }
        Insert: {
          at_risk?: boolean
          blockers?: string | null
          calls_booked?: number
          clients_closed?: number
          created_at?: string
          demos_built?: number
          id?: string
          next_week_focus?: string | null
          outreach_count?: number
          revenue_usd?: number
          tasks_completed?: number
          user_id: string
          week_number: number
          wins?: string | null
        }
        Update: {
          at_risk?: boolean
          blockers?: string | null
          calls_booked?: number
          clients_closed?: number
          created_at?: string
          demos_built?: number
          id?: string
          next_week_focus?: string | null
          outreach_count?: number
          revenue_usd?: number
          tasks_completed?: number
          user_id?: string
          week_number?: number
          wins?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_message: { Args: { _a: string; _b: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "beneficiary"
      dfy_month_status:
        | "submitted"
        | "remittance_paid"
        | "verified"
        | "disputed"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      rank_tier: "recruit" | "operator" | "closer" | "lion" | "crown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "beneficiary"],
      dfy_month_status: [
        "submitted",
        "remittance_paid",
        "verified",
        "disputed",
      ],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      rank_tier: ["recruit", "operator", "closer", "lion", "crown"],
    },
  },
} as const
