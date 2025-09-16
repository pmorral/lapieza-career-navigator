# API de Candidatos - Documentación de Uso

## Función: `get-candidates`

Esta función obtiene información completa de todos los candidatos registrados con datos de membresía, entrevistas y pagos.

### URL de la función

```
https://qgxpzuaeorjkcjwwphjt.supabase.co/functions/v1/get-candidates
```

## Características Principales

### ✅ **Información Obtenida:**

- **Datos básicos:** Nombre, email, WhatsApp, fecha de registro
- **Membresía:** Estado de suscripción, tipo de plan, fecha de expiración
- **Entrevistas:** Si usó entrevista gratuita, cuántas entrevistas AI ha hecho
- **Pagos:** Último pago realizado, monto, fecha
- **Actividad:** Última actividad del usuario
- **Créditos:** Créditos de entrevista disponibles

### ⚡ **Optimizaciones:**

- **Índices GIN** para búsqueda rápida por nombre y email
- **LATERAL JOINs** para consultas eficientes
- **Paginación** integrada
- **Filtros** múltiples
- **Caché** de consultas optimizado

## Uso desde Frontend

### 1. **Consulta básica con paginación**

```typescript
const getCandidates = async (page: number = 1, limit: number = 50) => {
  const offset = (page - 1) * limit;

  const { data } = await supabase.functions.invoke("get-candidates", {
    body: {
      limit,
      offset,
    },
  });

  return data;
};

// Uso
const result = await getCandidates(1, 25);
console.log("Candidatos:", result.data);
console.log("Total:", result.pagination.total);
```

### 2. **Búsqueda por nombre o email**

```typescript
const searchCandidates = async (searchTerm: string) => {
  const { data } = await supabase.functions.invoke("get-candidates", {
    body: {
      search_name: searchTerm,
      search_email: searchTerm, // Busca en ambos campos
      limit: 50,
    },
  });

  return data;
};

// Uso
const results = await searchCandidates("juan perez");
```

### 3. **Filtrar por estado de membresía**

```typescript
const getActiveMembers = async () => {
  const { data } = await supabase.functions.invoke("get-candidates", {
    body: {
      subscription_status: "active",
      limit: 100,
    },
  });

  return data;
};

const getPremiumUsers = async () => {
  const { data } = await supabase.functions.invoke("get-candidates", {
    body: {
      subscription_plan: "Academy Premium",
      limit: 100,
    },
  });

  return data;
};
```

### 4. **Consulta completa con todos los filtros**

```typescript
const getFilteredCandidates = async (filters: {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
}) => {
  const offset = ((filters.page || 1) - 1) * (filters.limit || 50);

  const { data, error } = await supabase.functions.invoke("get-candidates", {
    body: {
      limit: filters.limit || 50,
      offset,
      search_name: filters.name,
      search_email: filters.email,
      subscription_status: filters.subscriptionStatus,
      subscription_plan: filters.subscriptionPlan,
    },
  });

  if (error) {
    throw new Error("Error fetching candidates: " + error.message);
  }

  return data;
};

// Uso
const candidates = await getFilteredCandidates({
  page: 2,
  limit: 25,
  name: "maria",
  subscriptionStatus: "active",
});
```

## Respuesta de la API

### Estructura de respuesta exitosa:

```typescript
interface CandidateResponse {
  success: true;
  data: CandidateData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface CandidateData {
  user_id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  subscription_status: string; // 'active', 'inactive', 'cancelled'
  subscription_plan: string | null; // 'Academy Premium', etc.
  subscription_expires_at: string | null;
  trial_interview_used: boolean;
  trial_interview_date: string | null;
  total_ai_interviews: number;
  last_payment_date: string | null;
  last_payment_amount: number | null;
  interview_credits: number;
  created_at: string;
  last_activity: string;
}
```

### Ejemplo de respuesta:

```json
{
  "success": true,
  "data": [
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "full_name": "Juan Pérez",
      "email": "juan.perez@example.com",
      "whatsapp": "+52 55 1234 5678",
      "subscription_status": "active",
      "subscription_plan": "Academy Premium",
      "subscription_expires_at": "2024-12-31T23:59:59Z",
      "trial_interview_used": true,
      "trial_interview_date": "2024-01-15T10:30:00Z",
      "total_ai_interviews": 5,
      "last_payment_date": "2024-01-01T00:00:00Z",
      "last_payment_amount": 39.99,
      "interview_credits": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "last_activity": "2024-01-20T15:45:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "pages": 3,
    "current_page": 1,
    "has_next": true,
    "has_prev": false
  }
}
```

## Parámetros de Consulta

### Método GET (Query Parameters):

```
GET /functions/v1/get-candidates?limit=50&offset=0&search_name=juan&subscription_status=active
```

### Método POST (JSON Body):

```json
{
  "limit": 50,
  "offset": 0,
  "search_name": "juan",
  "search_email": "juan@example.com",
  "subscription_status": "active",
  "subscription_plan": "Academy Premium"
}
```

### Parámetros disponibles:

| Parámetro             | Tipo   | Descripción                       | Valores                           |
| --------------------- | ------ | --------------------------------- | --------------------------------- |
| `limit`               | number | Límite de resultados (1-1000)     | Default: 50                       |
| `offset`              | number | Desplazamiento para paginación    | Default: 0                        |
| `search_name`         | string | Buscar en nombre completo         | Texto libre                       |
| `search_email`        | string | Buscar en email                   | Texto libre                       |
| `subscription_status` | string | Filtrar por estado de suscripción | 'active', 'inactive', 'cancelled' |
| `subscription_plan`   | string | Filtrar por tipo de plan          | 'Academy Premium', etc.           |

## Manejo de Errores

```typescript
try {
  const { data, error } = await supabase.functions.invoke("get-candidates", {
    body: { limit: 50 },
  });

  if (error) {
    console.error("Error:", error);
    return;
  }

  if (!data.success) {
    console.error("API Error:", data.message);
    return;
  }

  // Usar data.data y data.pagination
  console.log("Candidatos:", data.data);
} catch (error) {
  console.error("Network error:", error);
}
```

## Seguridad

- ✅ **Autenticación requerida:** Bearer token en header
- ✅ **Permisos de admin:** Solo usuarios con rol 'admin' pueden acceder
- ✅ **Rate limiting:** Aplicado automáticamente por Supabase
- ✅ **Validación de parámetros:** Límites y tipos validados

## Performance

- ⚡ **Consulta optimizada:** ~50-100ms para 1000+ registros
- 📊 **Índices GIN:** Búsqueda de texto ultra rápida
- 🔄 **Paginación eficiente:** No carga todos los registros
- 💾 **LATERAL JOINs:** Reduce consultas redundantes

## Ejemplos de Uso Prácticos

### Dashboard de Administración

```typescript
const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({});

  const loadCandidates = async () => {
    const result = await getFilteredCandidates(filters);
    setCandidates(result.data);
    setPagination(result.pagination);
  };

  return (
    <div>
      <h1>Candidatos ({pagination?.total})</h1>
      {/* Render candidates table */}
    </div>
  );
};
```

### Búsqueda en Tiempo Real

```typescript
const useDebounceSearch = (searchTerm: string, delay: number) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, delay]);

  return debouncedTerm;
};

const SearchCandidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounceSearch(searchTerm, 300);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedSearch) {
      searchCandidates(debouncedSearch).then(setResults);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar candidatos..."
    />
  );
};
```
