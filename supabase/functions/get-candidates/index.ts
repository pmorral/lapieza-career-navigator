import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetCandidatesRequest {
  limit?: number;
  offset?: number;
  search_name?: string;
  search_email?: string;
}

interface CandidateData {
  full_name: string;
  email: string;
  created_at: string;
}

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  pages: number;
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
}

interface GetCandidatesResponse {
  data: CandidateData[];
  pagination: PaginationMeta;
  success: boolean;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase con service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parsear parámetros de la request
    let params: GetCandidatesRequest = {};

    if (req.method === "GET") {
      const url = new URL(req.url);
      params = {
        limit: url.searchParams.get("limit")
          ? parseInt(url.searchParams.get("limit")!)
          : 50,
        offset: url.searchParams.get("offset")
          ? parseInt(url.searchParams.get("offset")!)
          : 0,
        search_name: url.searchParams.get("search_name") || undefined,
        search_email: url.searchParams.get("search_email") || undefined,
      };
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        params = {
          limit: body.limit || 50,
          offset: body.offset || 0,
          search_name: body.search_name || undefined,
          search_email: body.search_email || undefined,
        };
      } catch (error) {
        // Si no hay body o no es JSON válido, usar parámetros por defecto
        console.log("No valid JSON body provided, using default parameters");
        params = {
          limit: 50,
          offset: 0,
        };
      }
    }

    // Validar parámetros
    if (params.limit && (params.limit < 1 || params.limit > 1000)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Limit must be between 1 and 1000",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (params.offset && params.offset < 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Offset must be non-negative",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Fetching candidates with params:", params);

    // Construir query simple para obtener solo nombre, email y fecha de creación
    let query = supabase
      .from("profiles")
      .select("full_name, email, created_at", { count: "exact" });

    // Aplicar filtros de búsqueda si existen
    if (params.search_name) {
      query = query.ilike("full_name", `%${params.search_name}%`);
    }

    if (params.search_email) {
      query = query.ilike("email", `%${params.search_email}%`);
    }

    // Aplicar paginación
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Ordenar por fecha de creación descendente
    query = query.order("created_at", { ascending: false });

    const { data: candidates, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Database query failed",
          error: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calcular información de paginación
    const total = count || 0;
    const pages = Math.ceil(total / limit);
    const current_page = Math.floor(offset / limit) + 1;

    // Procesar y retornar resultados
    const response: GetCandidatesResponse = {
      success: true,
      data: candidates || [],
      pagination: {
        total,
        limit,
        offset,
        pages,
        current_page,
        has_next: offset + limit < total,
        has_prev: offset > 0,
      },
    };

    console.log(`Successfully fetched ${response.data.length} candidates`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
