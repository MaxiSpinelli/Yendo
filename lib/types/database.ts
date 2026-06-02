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
      trips: {
        Row: {
          id: string
          owner_id: string
          name: string
          destination: string
          start_date: string
          end_date: string
          share_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          destination: string
          start_date: string
          end_date: string
          share_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          destination?: string
          start_date?: string
          end_date?: string
          share_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: "editor" | "viewer"
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          role?: "editor" | "viewer"
          created_at?: string
        }
        Update: {
          role?: "editor" | "viewer"
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      flights: {
        Row: {
          id: string
          trip_id: string
          airline: string
          flight_number: string
          origin: string
          destination: string
          departure_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          airline: string
          flight_number: string
          origin: string
          destination: string
          departure_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          airline?: string
          flight_number?: string
          origin?: string
          destination?: string
          departure_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flights_trip_id_fkey"
            columns: ["trip_id"]
            referencedRelation: "trips"
            referencedColumns: ["id"]
          }
        ]
      }
      accommodations: {
        Row: {
          id: string
          trip_id: string
          name: string
          address: string
          checkin_at: string
          checkout_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          name: string
          address: string
          checkin_at: string
          checkout_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          address?: string
          checkin_at?: string
          checkout_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_trip_id_fkey"
            columns: ["trip_id"]
            referencedRelation: "trips"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          trip_id: string
          name: string
          starts_at: string
          location: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          name: string
          starts_at: string
          location?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          starts_at?: string
          location?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_trip_id_fkey"
            columns: ["trip_id"]
            referencedRelation: "trips"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Convenience aliases ──────────────────────────────────────────────────────

export type Trip               = Database["public"]["Tables"]["trips"]["Row"]
export type TripInsert         = Database["public"]["Tables"]["trips"]["Insert"]
export type TripUpdate         = Database["public"]["Tables"]["trips"]["Update"]

export type TripMember         = Database["public"]["Tables"]["trip_members"]["Row"]

export type Flight             = Database["public"]["Tables"]["flights"]["Row"]
export type FlightInsert       = Database["public"]["Tables"]["flights"]["Insert"]
export type FlightUpdate       = Database["public"]["Tables"]["flights"]["Update"]

export type Accommodation      = Database["public"]["Tables"]["accommodations"]["Row"]
export type AccommodationInsert = Database["public"]["Tables"]["accommodations"]["Insert"]
export type AccommodationUpdate = Database["public"]["Tables"]["accommodations"]["Update"]

export type Activity           = Database["public"]["Tables"]["activities"]["Row"]
export type ActivityInsert     = Database["public"]["Tables"]["activities"]["Insert"]
export type ActivityUpdate     = Database["public"]["Tables"]["activities"]["Update"]

// ─── Timeline union type ──────────────────────────────────────────────────────

export type TimelineItem =
  | { type: "flight";        sortKey: string; data: Flight }
  | { type: "accommodation"; sortKey: string; data: Accommodation }
  | { type: "activity";      sortKey: string; data: Activity }
