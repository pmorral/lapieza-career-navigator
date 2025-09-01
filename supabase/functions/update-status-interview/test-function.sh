#!/bin/bash

# Script para probar la función update-status-interview
# Asegúrate de tener las variables de entorno configuradas

# Configuración
SUPABASE_URL="https://your-project.supabase.co"
ANON_KEY="your-anon-key-here"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help          Mostrar esta ayuda"
    echo "  -u, --url           URL de Supabase (default: $SUPABASE_URL)"
    echo "  -k, --key           Clave anónima de Supabase"
    echo "  -c, --candidate     ID del candidato"
    echo "  -s, --status        Estado de la entrevista"
    echo "  -i, --interview     ID de la entrevista"
    echo ""
    echo "Ejemplo:"
    echo "  $0 -c candidate_123 -s analyzing-interview -i interview_456"
    echo ""
    echo "Estados válidos: analyzing-interview, created-pending, completed, failed"
}

# Variables por defecto
CANDIDATE_ID=""
STATUS=""
INTERVIEW_ID=""

# Parsear argumentos de línea de comandos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -u|--url)
            SUPABASE_URL="$2"
            shift 2
            ;;
        -k|--key)
            ANON_KEY="$2"
            shift 2
            ;;
        -c|--candidate)
            CANDIDATE_ID="$2"
            shift 2
            ;;
        -s|--status)
            STATUS="$2"
            shift 2
            ;;
        -i|--interview)
            INTERVIEW_ID="$2"
            shift 2
            ;;
        *)
            echo "Error: Opción desconocida $1"
            show_help
            exit 1
            ;;
    esac
done

# Validar campos requeridos
if [[ -z "$CANDIDATE_ID" || -z "$STATUS" || -z "$INTERVIEW_ID" ]]; then
    echo "Error: Todos los campos son requeridos"
    echo ""
    show_help
    exit 1
fi

# Validar estado
VALID_STATUSES=("analyzing-interview" "created-pending" "completed" "failed")
STATUS_VALID=false
for valid_status in "${VALID_STATUSES[@]}"; do
    if [[ "$STATUS" == "$valid_status" ]]; then
        STATUS_VALID=true
        break
    fi
done

if [[ "$STATUS_VALID" == false ]]; then
    echo "Error: Estado inválido '$STATUS'"
    echo "Estados válidos: ${VALID_STATUSES[*]}"
    exit 1
fi

# Crear payload JSON
PAYLOAD=$(cat <<EOF
{
  "candidateID": "$CANDIDATE_ID",
  "status": "$STATUS",
  "interviewID": "$INTERVIEW_ID"
}
EOF
)

echo "🚀 Probando función update-status-interview..."
echo "📡 URL: $SUPABASE_URL/functions/v1/update-status-interview"
echo "📦 Payload: $PAYLOAD"
echo ""

# Realizar petición
RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/functions/v1/update-status-interview" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -d "$PAYLOAD")

# Mostrar respuesta
echo "📥 Respuesta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Verificar si la respuesta indica éxito
if echo "$RESPONSE" | grep -q '"success": true'; then
    echo ""
    echo "✅ Función ejecutada exitosamente!"
else
    echo ""
    echo "❌ Error en la función"
    exit 1
fi
