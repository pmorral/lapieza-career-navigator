-- Script para crear la tabla verification_codes
-- Ejecuta este script en el SQL Editor de tu dashboard de Supabase

-- Crear la tabla verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'trial_interview',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para consultas más rápidas
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type ON verification_codes(email, type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (puedes restringir esto más tarde si es necesario)
CREATE POLICY "Allow all operations on verification_codes" ON verification_codes
  FOR ALL USING (true);

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'verification_codes'
ORDER BY ordinal_position;

-- Mostrar la estructura de la tabla
\d verification_codes;

