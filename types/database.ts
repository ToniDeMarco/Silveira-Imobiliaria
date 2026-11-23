/**
 * Tipos do banco no formato gerado pelo Supabase CLI.
 * Reflete `supabase/migrations/0001_init.sql`.
 *
 * Para regenerar a partir do projeto real:
 *   npx supabase gen types typescript --project-id <ID> --schema public > types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      imoveis: {
        Row: {
          id: string;
          codigo: string;
          titulo: string;
          slug: string;
          descricao: string | null;
          finalidade: "venda" | "aluguel";
          tipo: "casa" | "apartamento" | "terreno" | "comercial" | "rural" | "chacara";
          preco: number | null;
          condominio: number | null;
          iptu: number | null;
          cidade: string | null;
          bairro: string | null;
          endereco: string | null;
          quartos: number | null;
          suites: number | null;
          banheiros: number | null;
          vagas: number | null;
          area_total: number | null;
          area_construida: number | null;
          caracteristicas: string[];
          latitude: number | null;
          longitude: number | null;
          destaque: boolean;
          status: "rascunho" | "publicado" | "vendido" | "alugado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          codigo?: string;
          titulo: string;
          /** Gerado pelo trigger `imoveis_definir_slug` (título + código). */
          slug?: string;
          descricao?: string | null;
          finalidade: "venda" | "aluguel";
          tipo: "casa" | "apartamento" | "terreno" | "comercial" | "rural" | "chacara";
          preco?: number | null;
          condominio?: number | null;
          iptu?: number | null;
          cidade?: string | null;
          bairro?: string | null;
          endereco?: string | null;
          quartos?: number | null;
          suites?: number | null;
          banheiros?: number | null;
          vagas?: number | null;
          area_total?: number | null;
          area_construida?: number | null;
          caracteristicas?: string[];
          latitude?: number | null;
          longitude?: number | null;
          destaque?: boolean;
          status?: "rascunho" | "publicado" | "vendido" | "alugado";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          titulo?: string;
          slug?: string;
          descricao?: string | null;
          finalidade?: "venda" | "aluguel";
          tipo?: "casa" | "apartamento" | "terreno" | "comercial" | "rural" | "chacara";
          preco?: number | null;
          condominio?: number | null;
          iptu?: number | null;
          cidade?: string | null;
          bairro?: string | null;
          endereco?: string | null;
          quartos?: number | null;
          suites?: number | null;
          banheiros?: number | null;
          vagas?: number | null;
          area_total?: number | null;
          area_construida?: number | null;
          caracteristicas?: string[];
          latitude?: number | null;
          longitude?: number | null;
          destaque?: boolean;
          status?: "rascunho" | "publicado" | "vendido" | "alugado";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fotos_imovel: {
        Row: {
          id: string;
          imovel_id: string;
          url: string;
          url_thumb: string;
          caminho: string;
          caminho_thumb: string;
          ordem: number;
          capa: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          imovel_id: string;
          url: string;
          url_thumb: string;
          caminho: string;
          caminho_thumb: string;
          ordem?: number;
          capa?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          imovel_id?: string;
          url?: string;
          url_thumb?: string;
          caminho?: string;
          caminho_thumb?: string;
          ordem?: number;
          capa?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fotos_imovel_imovel_id_fkey";
            columns: ["imovel_id"];
            isOneToOne: false;
            referencedRelation: "imoveis";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          imovel_id: string | null;
          nome: string;
          telefone: string;
          email: string | null;
          mensagem: string | null;
          origem: "formulario" | "whatsapp";
          created_at: string;
        };
        Insert: {
          id?: string;
          imovel_id?: string | null;
          nome: string;
          telefone: string;
          email?: string | null;
          mensagem?: string | null;
          origem?: "formulario" | "whatsapp";
          created_at?: string;
        };
        Update: {
          id?: string;
          imovel_id?: string | null;
          nome?: string;
          telefone?: string;
          email?: string | null;
          mensagem?: string | null;
          origem?: "formulario" | "whatsapp";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_imovel_id_fkey";
            columns: ["imovel_id"];
            isOneToOne: false;
            referencedRelation: "imoveis";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      gerar_slug: {
        Args: { p_titulo: string; p_codigo: string };
        Returns: string;
      };
      proximo_codigo_imovel: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
