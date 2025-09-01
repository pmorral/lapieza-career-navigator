# Update Status Interview Function

Esta función de Supabase permite actualizar el estado de una entrevista existente.

## Endpoint

```
POST /functions/v1/update-status-interview
```

## Parámetros de Entrada

El body de la petición debe ser un JSON con los siguientes campos:

```json
{
  "candidateID": "string",
  "status": "string",
  "interviewID": "string"
}
```

### Campos Requeridos

- **candidateID**: ID del candidato (debe coincidir con el almacenado en la base de datos)
- **status**: Nuevo estado de la entrevista
- **interviewID**: ID externo de la entrevista

### Estados Válidos

- `"analyzing-interview"` - Entrevista siendo analizada
- `"created-pending"` - Entrevista creada y pendiente
- `"completed"` - Entrevista completada
- `"failed"` - Entrevista fallida

## Ejemplo de Uso

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/update-status-interview" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "candidateID": "candidate_123",
    "status": "analyzing-interview",
    "interviewID": "interview_456"
  }'
```

## Respuesta de Éxito

```json
{
  "success": true,
  "message": "Interview status updated successfully",
  "data": {
    "interview_id": 1,
    "candidate_id": "candidate_123",
    "interview_id_external": "interview_456",
    "old_status": "created-pending",
    "new_status": "analyzing-interview",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## Respuestas de Error

### Campos Faltantes
```json
{
  "error": "Missing required fields: candidateID, status, interviewID"
}
```

### Estado Inválido
```json
{
  "error": "Invalid status. Must be one of: analyzing-interview, created-pending, completed, failed",
  "receivedStatus": "invalid-status",
  "validStatuses": ["analyzing-interview", "created-pending", "completed", "failed"]
}
```

### Entrevista No Encontrada
```json
{
  "error": "Interview not found",
  "interviewID": "interview_456"
}
```

### ID de Candidato No Coincide
```json
{
  "error": "Candidate ID mismatch",
  "provided": "candidate_123",
  "found": "candidate_789"
}
```

## Funcionalidad

1. **Validación de Entrada**: Verifica que todos los campos requeridos estén presentes
2. **Validación de Estado**: Confirma que el estado proporcionado sea válido
3. **Búsqueda de Entrevista**: Busca la entrevista por `interviewID` en la tabla `interviews`
4. **Verificación de Candidato**: Confirma que el `candidateID` coincida con el almacenado
5. **Actualización**: Actualiza el estado de la entrevista y el timestamp de modificación
6. **Respuesta**: Retorna los datos actualizados de la entrevista

## Logs

La función registra logs detallados para debugging:
- 🚀 Inicio de la función
- 📝 Procesamiento de la petición
- 🔍 Búsqueda de entrevista
- ✅ Operaciones exitosas
- ❌ Errores encontrados

## Seguridad

- Utiliza la clave de servicio de Supabase para acceso a la base de datos
- Valida todos los campos de entrada
- Verifica la coincidencia del ID del candidato
- Maneja errores de manera segura sin exponer información sensible
