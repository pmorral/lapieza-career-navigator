# Verificación del Sistema de Creación Automática de Perfiles

## Resumen del Sistema

Sí, **al registrarse, se crea automáticamente el usuario en la tabla `profiles`**. Esto se logra a través de un sistema de triggers de PostgreSQL en Supabase.

## Cómo Funciona

### 1. Trigger Automático
- **Función**: `handle_new_user()`
- **Trigger**: `on_auth_user_created`
- **Evento**: Se ejecuta `AFTER INSERT` en la tabla `auth.users`

### 2. Código del Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Flujo de Registro
1. Usuario se registra con `supabase.auth.signUp()`
2. Se crea el usuario en `auth.users`
3. **Automáticamente** se ejecuta el trigger
4. Se crea el perfil en `public.profiles`
5. Se incluyen los metadatos del usuario (nombre completo, email)

## Verificación del Sistema

### Scripts de Verificación
- `test_profile_creation.sql` - Verifica que el trigger existe y funciona
- `test_user_registration.sql` - Simula el proceso de registro

### Qué Verificar
1. **Existencia del trigger**: Confirmar que `on_auth_user_created` existe
2. **Existencia de la función**: Confirmar que `handle_new_user()` existe
3. **Políticas RLS**: Verificar que las políticas de seguridad están configuradas
4. **Sincronización**: Confirmar que cada usuario en `auth.users` tiene su perfil correspondiente

### Comandos de Verificación Rápidos
```sql
-- Verificar que el trigger existe
SELECT trigger_name, event_object_table, action_timing 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar que la función existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Verificar sincronización de usuarios vs perfiles
SELECT 
    COUNT(*) as total_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles
FROM auth.users;
```

## Campos del Perfil Creado

El perfil se crea automáticamente con:
- `user_id`: ID del usuario de auth.users
- `full_name`: Extraído de `raw_user_meta_data->>'full_name'`
- `email`: Email del usuario
- `created_at`: Timestamp de creación
- `is_new_user`: `true` por defecto
- `subscription_status`: `inactive` por defecto
- Otros campos con valores por defecto

## Posibles Problemas

### 1. Trigger No Funciona
- Verificar que la función `handle_new_user()` existe
- Verificar que el trigger está activo
- Revisar logs de Supabase para errores

### 2. Perfil No Se Crea
- Verificar que el usuario se creó correctamente en `auth.users`
- Verificar que `raw_user_meta_data` contiene `full_name`
- Revisar políticas RLS que puedan estar bloqueando la inserción

### 3. Datos Incorrectos
- Verificar que `raw_user_meta_data` tiene el formato correcto
- Verificar que la función extrae correctamente los datos

## Solución de Problemas

### Si el Trigger No Funciona
```sql
-- Recrear la función
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Si Hay Usuarios Sin Perfiles
```sql
-- Crear perfiles manualmente para usuarios existentes
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Usuario'),
    au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;
```

## Conclusión

El sistema está **correctamente configurado** para crear automáticamente perfiles cuando los usuarios se registran. El trigger `on_auth_user_created` se ejecuta automáticamente después de cada inserción en `auth.users` y crea el perfil correspondiente en `public.profiles`.

Si hay problemas, usar los scripts de verificación para diagnosticar y corregir cualquier inconsistencia.
