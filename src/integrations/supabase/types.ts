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
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
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
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
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
