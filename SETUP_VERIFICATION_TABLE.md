# 🗄️ Configuración de la Tabla verification_codes

## 📋 **Resumen**

Debido a un error en las migraciones anteriores, necesitamos crear la tabla `verification_codes` manualmente usando el SQL Editor de Supabase.

## 🚀 **Pasos para Crear la Tabla**

### **Paso 1: Acceder al SQL Editor**

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral izquierdo
4. Haz clic en **"New query"**

### **Paso 2: Crear la Tabla**

1. Copia y pega el contenido del archivo `create_verification_codes_table.sql`
2. Haz clic en **"Run"** para ejecutar el script
3. Verifica que no haya errores en la consola

### **Paso 3: Probar la Tabla**

1. Copia y pega el contenido del archivo `test_verification_system.sql`
2. Ejecuta el script para verificar que todo funciona
3. Deberías ver la estructura de la tabla y las pruebas exitosas

## 📊 **Estructura de la Tabla**

La tabla `verification_codes` tiene las siguientes columnas:

| Columna      | Tipo      | Descripción                                       |
| ------------ | --------- | ------------------------------------------------- |
| `id`         | UUID      | Identificador único (generado automáticamente)    |
| `email`      | TEXT      | Email del usuario (NOT NULL)                      |
| `code`       | TEXT      | Código de verificación de 6 dígitos (NOT NULL)    |
| `type`       | TEXT      | Tipo de verificación (default: 'trial_interview') |
| `expires_at` | TIMESTAMP | Fecha de expiración del código (NOT NULL)         |
| `used`       | BOOLEAN   | Si el código ya fue usado (default: FALSE)        |
| `created_at` | TIMESTAMP | Fecha de creación (generado automáticamente)      |

## 🔍 **Índices Creados**

- `idx_verification_codes_email_type` - Para búsquedas por email y tipo
- `idx_verification_codes_expires` - Para limpieza de códigos expirados

## 🛡️ **Seguridad (RLS)**

- Row Level Security está habilitado
- Política temporal permite todas las operaciones
- Puedes restringir esto más tarde según tus necesidades

## 🧹 **Mantenimiento**

### **Limpieza Automática**

Los códigos expirados se limpian automáticamente en las cloud functions, pero puedes ejecutar limpieza manual:

1. Usa el script `cleanup_verification_codes.sql`
2. Ejecútalo periódicamente o cuando sea necesario

### **Monitoreo**

Revisa regularmente:

- Códigos expirados
- Códigos utilizados
- Estadísticas de uso

## 🧪 **Verificación del Sistema**

Después de crear la tabla, puedes probar el sistema completo:

1. **Frontend:** Llena el formulario de entrevista AI
2. **Verificación:** Recibe el código por email
3. **Validación:** Ingresa el código en la interfaz
4. **Confirmación:** Se genera la entrevista AI

## 🚨 **Solución de Problemas**

### **Error: "relation does not exist"**

- Verifica que ejecutaste el script completo
- Revisa que no haya errores de sintaxis
- Confirma que tienes permisos de administrador

### **Error: "permission denied"**

- Verifica que RLS esté configurado correctamente
- Confirma que la política permita las operaciones necesarias

### **Error: "duplicate key"**

- Los códigos son únicos por diseño
- Cada email puede tener múltiples códigos (con diferentes timestamps)

## 📞 **Soporte**

Si tienes problemas:

1. Revisa los logs del SQL Editor
2. Verifica la sintaxis del SQL
3. Confirma que tienes permisos de administrador
4. Revisa la documentación de Supabase

---

**¡Una vez que la tabla esté creada, el sistema de verificación estará completamente funcional! 🎉**
