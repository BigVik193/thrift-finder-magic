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
          created_at: string | null
          embedding: string | null
          id: string
          image_url: string
          type: Database["public"]["Enums"]["clothing_type_enum"]
          updated_at: string | null
          wardrobe_id: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          image_url: string
          type: Database["public"]["Enums"]["clothing_type_enum"]
          updated_at?: string | null
          wardrobe_id?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          image_url?: string
          type?: Database["public"]["Enums"]["clothing_type_enum"]
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
      daily_fetch_status: {
        Row: {
          batch_id: string
          completed_at: string | null
          id: string
          new_listings_added: number
          started_at: string | null
          status: string
          term_count: number
          terms_processed: number
          terms_with_errors: number
        }
        Insert: {
          batch_id: string
          completed_at?: string | null
          id?: string
          new_listings_added?: number
          started_at?: string | null
          status?: string
          term_count?: number
          terms_processed?: number
          terms_with_errors?: number
        }
        Update: {
          batch_id?: string
          completed_at?: string | null
          id?: string
          new_listings_added?: number
          started_at?: string | null
          status?: string
          term_count?: number
          terms_processed?: number
          terms_with_errors?: number
        }
        Relationships: []
      }
      daily_search_terms: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
          search_term: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          search_term: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          search_term?: string
        }
        Relationships: []
      }
      liked_items: {
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
        Relationships: []
      }
      listings: {
        Row: {
          condition: string
          currency: string
          embedding: string | null
          id: string
          image: string
          last_updated: string | null
          platform: string
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
          embedding?: string | null
          id: string
          image: string
          last_updated?: string | null
          platform: string
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
          embedding?: string | null
          id?: string
          image?: string
          last_updated?: string | null
          platform?: string
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
      user_recommendations: {
        Row: {
          created_at: string | null
          listing_id: string
          similarity_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          listing_id: string
          similarity_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          listing_id?: string
          similarity_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_searches: {
        Row: {
          created_at: string | null
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_searches_user_id_fkey"
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
          style_vector: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          price_range?: Json | null
          sizes?: Json | null
          style_vector?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          price_range?: Json | null
          sizes?: Json | null
          style_vector?: string | null
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_similar_listings: {
        Args: {
          user_vector: string
          exclude_ids: string[]
          result_limit?: number
        }
        Returns: {
          id: string
          title: string
          price: number
          currency: string
          image: string
          platform: string
          condition: string
          url: string
          similarity: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      clothing_type_enum:
        | "Tops"
        | "Bottoms"
        | "Outerwear"
        | "Footwear"
        | "Other"
      gender_enum: "Male" | "Female" | "Other"
      platform_enum: "eBay" | "Etsy" | "Depop" | "Grailed" | "ThredUp"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      clothing_type_enum: ["Tops", "Bottoms", "Outerwear", "Footwear", "Other"],
      gender_enum: ["Male", "Female", "Other"],
      platform_enum: ["eBay", "Etsy", "Depop", "Grailed", "ThredUp"],
    },
  },
} as const
