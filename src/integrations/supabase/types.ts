export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      leads_with_status: {
        Row: {
          "ambar.mittal@mathco.com_Comment": string | null
          "ambar.mittal@mathco.com_Score": string | null
          "Company Name": string | null
          "Confirmation Status": string | null
          id: number
          Last_Updated: string | null
          "Lead ID": number | null
          "Leadership contact email": string | null
          "Relationship Strength": string | null
          "SDR Name": string | null
          Status: string | null
          "Target Lead Linkedin URL": string | null
          "Target Lead Name": string | null
          "Target Lead Title": string | null
        }
        Insert: {
          "ambar.mittal@mathco.com_Comment"?: string | null
          "ambar.mittal@mathco.com_Score"?: string | null
          "Company Name"?: string | null
          "Confirmation Status"?: string | null
          id?: number
          Last_Updated?: string | null
          "Lead ID"?: number | null
          "Leadership contact email"?: string | null
          "Relationship Strength"?: string | null
          "SDR Name"?: string | null
          Status?: string | null
          "Target Lead Linkedin URL"?: string | null
          "Target Lead Name"?: string | null
          "Target Lead Title"?: string | null
        }
        Update: {
          "ambar.mittal@mathco.com_Comment"?: string | null
          "ambar.mittal@mathco.com_Score"?: string | null
          "Company Name"?: string | null
          "Confirmation Status"?: string | null
          id?: number
          Last_Updated?: string | null
          "Lead ID"?: number | null
          "Leadership contact email"?: string | null
          "Relationship Strength"?: string | null
          "SDR Name"?: string | null
          Status?: string | null
          "Target Lead Linkedin URL"?: string | null
          "Target Lead Name"?: string | null
          "Target Lead Title"?: string | null
        }
        Relationships: []
      }
      stakeholder_responses: {
        Row: {
          comment: string | null
          id: string
          lead_id: number
          relationship_score: number | null
          stakeholder_email: string
          submitted_at: string
        }
        Insert: {
          comment?: string | null
          id?: string
          lead_id: number
          relationship_score?: number | null
          stakeholder_email: string
          submitted_at?: string
        }
        Update: {
          comment?: string | null
          id?: string
          lead_id?: number
          relationship_score?: number | null
          stakeholder_email?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_responses_view"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "stakeholder_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_with_status"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lead_responses_view: {
        Row: {
          company_name: string | null
          lead_id: number | null
          lead_status: string | null
          leadership_email: string | null
          relationship_score: number | null
          relationship_strength: string | null
          sdr_name: string | null
          stakeholder_comment: string | null
          stakeholder_email: string | null
          submitted_at: string | null
          target_lead_name: string | null
          target_lead_title: string | null
          target_lead_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_column_to_table: {
        Args: { table_name: string; column_name: string; column_type?: string }
        Returns: boolean
      }
      execute_sql: {
        Args: { sql: string }
        Returns: boolean
      }
      get_leads_for_stakeholder: {
        Args: { p_email: string }
        Returns: {
          lead_id: number
          target_lead_name: string
          company_name: string
          target_lead_title: string
          target_lead_url: string
          leadership_email: string
          lead_status: string
          sdr_name: string
          relationship_strength: string
          existing_score: number
          existing_comment: string
        }[]
      }
      get_table_columns: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
