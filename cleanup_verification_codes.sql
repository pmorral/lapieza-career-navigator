-- Script para limpiar códigos de verificación expirados y usados
-- Ejecuta este script periódicamente o cuando sea necesario

-- Limpiar códigos expirados
DELETE FROM verification_codes 
WHERE expires_at < NOW();

-- Limpiar códigos ya utilizados
DELETE FROM verification_codes 
WHERE used = true;

-- Mostrar estadísticas de la tabla
SELECT 
  COUNT(*) as total_codes,
  COUNT(CASE WHEN used = true THEN 1 END) as used_codes,
  COUNT(CASE WHEN used = false THEN 1 END) as unused_codes,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_codes
FROM verification_codes;

-- Mostrar códigos activos (no expirados y no usados)
SELECT 
  email,
  type,
  created_at,
  expires_at,
  CASE 
    WHEN expires_at < NOW() THEN 'EXPIRADO'
    WHEN used = true THEN 'USADO'
    ELSE 'ACTIVO'
  END as status
FROM verification_codes
ORDER BY created_at DESC
LIMIT 10;
