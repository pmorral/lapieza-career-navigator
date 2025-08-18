-- Script para verificar la creación automática de perfiles
-- Este script verifica si el trigger handle_new_user está funcionando correctamente

-- 1. Verificar que la función existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 2. Verificar que el trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar la estructura de la tabla profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verificar las políticas RLS de la tabla profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Verificar si hay usuarios en auth.users que no tienen perfiles correspondientes
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.created_at,
    CASE 
        WHEN p.user_id IS NOT NULL THEN '✅ Perfil creado'
        ELSE '❌ Sin perfil'
    END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- 6. Verificar el conteo total de usuarios vs perfiles
SELECT 
    'Total usuarios en auth.users' as description,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total perfiles en public.profiles' as description,
    COUNT(*) as count
FROM public.profiles;
