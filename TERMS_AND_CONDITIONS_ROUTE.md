# Ruta de Términos y Condiciones - Servicios Adicionales

## 📍 **URL de Acceso**

```
/dashboard/terms-and-conditions-aditional-services
```

## 🎯 **Propósito**

Esta ruta muestra los términos y condiciones específicos para los servicios adicionales de Academy by LaPieza, incluyendo asesorías, entrevistas con coaches y búsqueda de vacantes personalizadas.

## 📋 **Contenido Mostrado**

### 1. **Confirmación de Sesión**

- Tiempo de respuesta: 24 a 48 horas
- Contacto automático del equipo

### 2. **Preparación para la Sesión**

- Llegar con dudas y objetivos claros
- Aprovechamiento máximo de la sesión

### 3. **Puntualidad y Tolerancia**

- 10 minutos de tolerancia en sala virtual
- Cancelación automática sin reembolso si no se ingresa a tiempo

### 4. **Características del Servicio**

- Servicios personales e intransferibles
- No se pueden transferir a terceros

### 5. **Información Adicional**

- Aplicación a todos los servicios adicionales
- Sesiones por plataformas virtuales seguras
- Cambios con 24 horas de anticipación
- Pagos al momento de confirmación

## 🔗 **Acceso desde la Aplicación**

### **Desde Servicios Adicionales**

1. Navegar a `/dashboard/services` (requiere login)
2. Hacer clic en "Ver Términos y Condiciones" (botón superior derecho)

### **Acceso Directo (Público)**

- URL: `/terms-and-conditions-aditional-services`
- **NO requiere autenticación** - Accesible para todos los visitantes
- Página independiente con header público

## 🎨 **Diseño y UX**

### **Colores por Sección**

- 🔵 **Azul**: Confirmación de sesión
- 🟢 **Verde**: Preparación para sesión
- 🟠 **Naranja**: Puntualidad y tolerancia
- 🟣 **Púrpura**: Características del servicio
- ⚠️ **Amarillo**: Información importante

### **Elementos Visuales**

- Iconos descriptivos para cada sección
- Cards con colores diferenciados
- Información organizada y fácil de leer
- Responsive design para móviles

## 🔧 **Implementación Técnica**

### **Componente**

- `TermsAndConditionsAdditionalServices.tsx`
- Ubicado en `src/components/`
- **Página independiente** con header público

### **Rutas**

- **Ruta pública** en `App.tsx`: `/terms-and-conditions-aditional-services`
- **NO integrada** en `Dashboard.tsx` (es independiente)
- Accesible desde `AdditionalServices.tsx` (botón de redirección)

### **Navegación**

- Botón en la página de servicios adicionales (redirección)
- **Ruta pública** que NO requiere autenticación
- **Página independiente** con header propio y navegación
- Botones de "Inicio" y "Volver" para navegación fácil

## 📱 **Responsive Design**

- **Desktop**: Layout horizontal con iconos y texto
- **Tablet**: Layout adaptativo
- **Móvil**: Stack vertical para mejor legibilidad

## 🚀 **Beneficios para el Usuario**

1. **Transparencia**: Conoce exactamente qué esperar
2. **Claridad**: Términos explicados de forma simple
3. **Accesibilidad**: Fácil de encontrar desde servicios
4. **Información**: Detalles importantes sobre puntualidad y políticas
5. **Confianza**: Entiende las reglas del servicio

## 🔄 **Mantenimiento**

### **Actualizaciones de Contenido**

- Modificar directamente en `TermsAndConditionsAdditionalServices.tsx`
- Los cambios se reflejan automáticamente en la ruta

### **Nuevas Secciones**

- Agregar nuevas cards siguiendo el patrón existente
- Mantener consistencia de colores y diseño
- Usar iconos apropiados de Lucide React

## 📊 **Métricas de Uso**

- Ruta accesible desde servicios adicionales
- Términos claros para reducir dudas del usuario
- Información legal importante para el negocio
- Transparencia en políticas de cancelación y reprogramación
