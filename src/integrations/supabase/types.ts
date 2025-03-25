export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clothing_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          image_url: string
          material: string | null
          style_matches: Json | null
          type: string
          updated_at: string | null
          wardrobe_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          material?: string | null
          style_matches?: Json | null
          type: string
          updated_at?: string | null
          wardrobe_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          material?: string | null
          style_matches?: Json | null
          type?: string
          updated_at?: string | null
          wardrobe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clothing_items_wardrobe_id_fkey"
            columns: ["wardrobe_id"]
            isOneToOne: false
            referencedRelation: "wardrobes"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_items: {
        Row: {
          liked_at: string | null
          listing_id: string
          user_id: string
        }
        Insert: {
          liked_at?: string | null
          listing_id: string
          user_id: string
        }
        Update: {
          liked_at?: string | null
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liked_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          condition: string
          currency: string
          id: string
          image: string
          last_updated: string | null
          platform: Database["public"]["Enums"]["platform_enum"]
          price: number
          seller_feedback_percentage: string
          seller_feedback_score: number | null
          seller_username: string
          title: string
          url: string
        }
        Insert: {
          condition: string
          currency: string
          id: string
          image: string
          last_updated?: string | null
          platform: Database["public"]["Enums"]["platform_enum"]
          price: number
          seller_feedback_percentage: string
          seller_feedback_score?: number | null
          seller_username: string
          title: string
          url: string
        }
        Update: {
          condition?: string
          currency?: string
          id?: string
          image?: string
          last_updated?: string | null
          platform?: Database["public"]["Enums"]["platform_enum"]
          price?: number
          seller_feedback_percentage?: string
          seller_feedback_score?: number | null
          seller_username?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          listing_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          listing_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          listing_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_style_preferences: {
        Row: {
          price_range: Json | null
          sizes: Json | null
          style_scores: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          price_range?: Json | null
          sizes?: Json | null
          style_scores?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          price_range?: Json | null
          sizes?: Json | null
          style_scores?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_style_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          gender: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          name: string
          profile_picture: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          name: string
          profile_picture?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          name?: string
          profile_picture?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wardrobes: {
        Row: {
          created_at: string | null
          id: string
          style_aggregate: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          style_aggregate?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          style_aggregate?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wardrobes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_enum: "Male" | "Female" | "Other"
      platform_enum: "eBay" | "Etsy" | "Depop" | "Grailed" | "ThredUp"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
