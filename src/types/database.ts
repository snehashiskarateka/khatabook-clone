export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      parties: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          gstin: string | null;
          address: string | null;
          state: string | null;
          type: string;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          gstin?: string | null;
          address?: string | null;
          state?: string | null;
          type?: string;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          gstin?: string | null;
          address?: string | null;
          state?: string | null;
          type?: string;
          created_at?: string;
          user_id?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          unit: string;
          rate: number;
          hsn_code: string | null;
          gst_rate: number;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          unit?: string;
          rate?: number;
          hsn_code?: string | null;
          gst_rate?: number;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          unit?: string;
          rate?: number;
          hsn_code?: string | null;
          gst_rate?: number;
          created_at?: string;
          user_id?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          party_id: string | null;
          amount: number;
          type: string;
          date: string;
          note: string | null;
          bill_no: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          party_id?: string | null;
          amount: number;
          type: string;
          date?: string;
          note?: string | null;
          bill_no?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          party_id?: string | null;
          amount?: number;
          type?: string;
          date?: string;
          note?: string | null;
          bill_no?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_no: string;
          party_id: string | null;
          date: string;
          due_date: string | null;
          items: Json;
          subtotal: number;
          cgst: number;
          sgst: number;
          igst: number;
          total: number;
          status: string;
          notes: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          invoice_no: string;
          party_id?: string | null;
          date?: string;
          due_date?: string | null;
          items?: Json;
          subtotal?: number;
          cgst?: number;
          sgst?: number;
          igst?: number;
          total?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          invoice_no?: string;
          party_id?: string | null;
          date?: string;
          due_date?: string | null;
          items?: Json;
          subtotal?: number;
          cgst?: number;
          sgst?: number;
          igst?: number;
          total?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
    };
  };
}