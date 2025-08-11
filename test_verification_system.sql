-- Script para probar el sistema de verificación
-- Ejecuta este script después de crear la tabla para verificar que funciona

-- 1. Insertar un código de prueba
INSERT INTO verification_codes (email, code, type, expires_at) 
VALUES (
  'test@example.com',
  '123456',
  'trial_interview',
  NOW() + INTERVAL '10 minutes'
);

-- 2. Verificar que se insertó correctamente
SELECT * FROM verification_codes WHERE email = 'test@example.com';

-- 3. Simular verificación exitosa
UPDATE verification_codes 
SET used = true 
WHERE email = 'test@example.com' AND code = '123456';

-- 4. Verificar que se marcó como usado
SELECT * FROM verification_codes WHERE email = 'test@example.com';

-- 5. Limpiar datos de prueba
DELETE FROM verification_codes WHERE email = 'test@example.com';

-- 6. Verificar que se limpió
SELECT COUNT(*) as remaining_test_codes FROM verification_codes WHERE email = 'test@example.com';

-- 7. Mostrar estructura final de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'verification_codes'
ORDER BY ordinal_position;
