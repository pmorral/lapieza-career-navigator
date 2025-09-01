# Despliegue de update-status-interview

## Prerrequisitos

1. **Supabase CLI instalado**:

   ```bash
   npm install -g supabase
   ```

2. **Autenticado en Supabase**:

   ```bash
   supabase login
   ```

3. **Proyecto vinculado**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

## Despliegue

### 1. Despliegue Local (Desarrollo)

```bash
# Navegar al directorio de la función
cd supabase/functions/update-status-interview

# Iniciar función localmente
supabase functions serve update-status-interview --env-file .env.local
```

### 2. Despliegue a Producción

```bash
# Desde el directorio raíz del proyecto
supabase functions deploy update-status-interview
```

### 3. Verificar Despliegue

```bash
# Listar funciones desplegadas
supabase functions list

# Ver logs de la función
supabase functions logs update-status-interview
```

## Configuración de Variables de Entorno

### Variables Requeridas

```bash
# .env.local (desarrollo)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# .env (producción)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Obtener Claves

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Settings** > **API**
3. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Testing Post-Despliegue

### 1. Usar el Script de Prueba

```bash
# Configurar variables en el script
cd supabase/functions/update-status-interview
nano test-function.sh

# Actualizar estas líneas:
SUPABASE_URL="https://your-project.supabase.co"
ANON_KEY="your-anon-key-here"

# Ejecutar prueba
./test-function.sh -c candidate_123 -s analyzing-interview -i interview_456
```

### 2. Usar curl Directamente

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

### 3. Verificar Respuesta

La respuesta debe ser similar a:

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

## Monitoreo

### Logs en Tiempo Real

```bash
supabase functions logs update-status-interview --follow
```

### Métricas de Rendimiento

- **Tiempo de respuesta**: < 1 segundo
- **Tasa de éxito**: > 99%
- **Errores**: Monitorear logs para patrones

## Rollback

Si necesitas revertir a una versión anterior:

```bash
# Listar versiones
supabase functions list

# Revertir a versión específica
supabase functions deploy update-status-interview --version VERSION_ID
```

## Troubleshooting

### Error: "Function not found"

```bash
# Verificar que la función esté desplegada
supabase functions list

# Redesplegar si es necesario
supabase functions deploy update-status-interview
```

### Error: "Permission denied"

```bash
# Verificar permisos de base de datos
supabase db reset

# O ejecutar manualmente:
GRANT UPDATE ON interviews TO authenticated;
GRANT SELECT ON interviews TO authenticated;
```

### Error: "Invalid environment variables"

```bash
# Verificar variables de entorno
supabase status

# Reconfigurar si es necesario
supabase link --project-ref YOUR_PROJECT_ID
```

## Seguridad

### Permisos de Función

La función utiliza la `service_role_key` para acceder a la base de datos. Asegúrate de:

1. **No exponer** la clave en el frontend
2. **Usar** `anon_key` para llamadas desde el cliente
3. **Validar** permisos en el frontend antes de llamar a la función

### Rate Limiting

Considera implementar rate limiting en el frontend:

```typescript
// Ejemplo de rate limiting básico
const RATE_LIMIT_DELAY = 1000; // 1 segundo
let lastCall = 0;

const updateStatusWithRateLimit = async (params) => {
  const now = Date.now();
  if (now - lastCall < RATE_LIMIT_DELAY) {
    throw new Error("Please wait before making another request");
  }

  lastCall = now;
  return await updateStatus(params);
};
```

## Soporte

Si encuentras problemas:

1. **Revisar logs**: `supabase functions logs update-status-interview`
2. **Verificar configuración**: Variables de entorno y permisos
3. **Probar localmente**: `supabase functions serve`
4. **Documentación**: Revisar README.md e INTEGRATION.md
