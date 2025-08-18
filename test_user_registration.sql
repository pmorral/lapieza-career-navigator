-- Script para simular y verificar el proceso de registro de usuario
-- Este script simula lo que sucede cuando un usuario se registra

-- IMPORTANTE: Este script es solo para pruebas en desarrollo
-- NO ejecutar en producción

-- 1. Verificar el estado actual antes de la prueba
SELECT '=== ESTADO ANTES DE LA PRUEBA ===' as info;

SELECT 
    'Usuarios totales' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Perfiles totales' as metric,
    COUNT(*) as count
FROM public.profiles;

-- 2. Simular la inserción de un usuario (esto activará el trigger)
-- NOTA: En la práctica, esto se hace a través de Supabase Auth
-- Aquí solo simulamos para verificar que el trigger funciona

-- Primero, crear un usuario de prueba en auth.users
-- (Esto normalmente se hace a través de supabase.auth.signUp)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Usuario de Prueba"}'::jsonb,
    'authenticated',
    'authenticated'
) RETURNING id, email, raw_user_meta_data;

-- 3. Verificar que se creó el perfil automáticamente
SELECT '=== VERIFICACIÓN DESPUÉS DE LA INSERCIÓN ===' as info;

SELECT 
    'Usuarios totales' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Perfiles totales' as metric,
    COUNT(*) as count
FROM public.profiles;

-- 4. Verificar que el perfil se creó con los datos correctos
SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    p.is_new_user,
    p.subscription_status
FROM public.profiles p
WHERE p.email = 'test@example.com';

-- 5. Verificar la relación entre el usuario y el perfil
SELECT 
    au.id as user_id,
    au.email as user_email,
    au.raw_user_meta_data->>'full_name' as user_full_name,
    p.id as profile_id,
    p.full_name as profile_full_name,
    p.email as profile_email,
    p.is_new_user,
    p.subscription_status
FROM auth.users au
JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'test@example.com';

-- 6. Limpiar datos de prueba (opcional)
-- DELETE FROM public.profiles WHERE email = 'test@example.com';
-- DELETE FROM auth.users WHERE email = 'test@example.com';

-- 7. Verificar el estado final
SELECT '=== ESTADO FINAL ===' as info;

SELECT 
    'Usuarios totales' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Perfiles totales' as metric,
    COUNT(*) as count
FROM public.profiles;
