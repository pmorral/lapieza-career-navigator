import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Types
interface GetCandidatesRequest {
  limit?: number;
  offset?: number;
  search_name?: string;
  search_email?: string;
}

interface CandidateData {
  user_id?: string; // Temporal para testing
  full_name: string;
  email: string;
  created_at: string;
  has_active_subscription: boolean;
  interview_responses_count: number;
  cv_optimizations_count: number;
  linkedin_optimizations_count: number;
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
  success: boolean;
  data: CandidateData[];
  pagination: PaginationMeta;
  message?: string;
}

interface GetCandidatesErrorResponse {
  success: false;
  message: string;
  error?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
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
          ? parseInt(url.searchParams.get("limit"))
          : 50,
        offset: url.searchParams.get("offset")
          ? parseInt(url.searchParams.get("offset"))
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log("Fetching candidates with params:", params);

    // Construir query para obtener información básica del perfil más suscripción
    let query = supabase.from("profiles").select(
      `
      user_id,
      full_name, 
      email, 
      created_at,
      subscription_status
    `,
      {
        count: "exact",
      }
    );

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
    query = query.order("created_at", {
      ascending: false,
    });

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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Si no hay candidatos, devolver respuesta vacía
    if (!candidates || candidates.length === 0) {
      const response = {
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          pages: 0,
          current_page: 1,
          has_next: false,
          has_prev: false,
        },
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Obtener los user_ids para consultas adicionales
    const userIds = candidates.map((candidate) => candidate.user_id);

    // Obtener conteos por usuario de forma más eficiente
    const interviewCountsByUser = {};
    const cvOptCountsByUser = {};
    const linkedinOptCountsByUser = {};

    // Ejecutar consultas de conteo para cada usuario en paralelo
    await Promise.all(
      userIds.map(async (userId) => {
        const [
          { count: interviewCount },
          { count: cvOptCount },
          { count: linkedinOptCount },
        ] = await Promise.all([
          // Contar interview_responses por usuario
          supabase
            .from("interview_responses")
            .select("*", { count: "exact", head: true })
            .eq("candidate_id", userId),

          // Contar cv_optimizations por usuario
          supabase
            .from("cv_optimizations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),

          // Contar linkedin_optimizations por usuario
          supabase
            .from("linkedin_optimizations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
        ]);

        interviewCountsByUser[userId] = interviewCount || 0;
        cvOptCountsByUser[userId] = cvOptCount || 0;
        linkedinOptCountsByUser[userId] = linkedinOptCount || 0;
      })
    );

    // Enriquecer datos de candidatos con conteos
    const enrichedCandidates: CandidateData[] = candidates.map((candidate) => ({
      full_name: candidate.full_name,
      email: candidate.email,
      created_at: candidate.created_at,
      has_active_subscription: candidate.subscription_status === "active",
      interview_responses_count: interviewCountsByUser[candidate.user_id] || 0,
      cv_optimizations_count: cvOptCountsByUser[candidate.user_id] || 0,
      linkedin_optimizations_count:
        linkedinOptCountsByUser[candidate.user_id] || 0,
    }));

    // Calcular información de paginación
    const total = count || 0;
    const pages = Math.ceil(total / limit);
    const current_page = Math.floor(offset / limit) + 1;

    // Procesar y retornar resultados
    const response: GetCandidatesResponse = {
      success: true,
      data: enrichedCandidates,
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
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
