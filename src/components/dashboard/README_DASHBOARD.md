# Dashboard de Trámites - Documentación

## 📋 Descripción General

El Dashboard de Trámites es una interfaz completa y moderna que permite visualizar y gestionar todos los trámites del sistema de manera clara y eficiente. Ofrece múltiples vistas de visualización y acciones rápidas para mejorar la productividad.

## ✨ Características Principales

### 1. **KPIs (Indicadores Clave)**

- **Total de Trámites**: Cantidad total en el sistema
- **Trámites Activos**: Trámites en proceso actualmente
- **Con Retraso**: Trámites que requieren atención urgente
- **Última Semana**: Nuevos trámites en los últimos 7 días

### 2. **Sistema de Filtros**

- **Por Fuerza**: Filtra trámites según la fuerza (Ejército, Marina, Aeronáutica, etc.)
- **Por Tipo de Préstamo**: Filtra según el tipo (Extraordinario, Por Caja, Por Haberes, etc.)
- Los filtros se aplican en tiempo real y son combinables

### 3. **Tres Vistas de Visualización**

#### Vista Kanban (Por Pasos)

- Visualización tipo tablero Kanban
- Columnas por cada paso del flujo
- Tarjetas de trámites con información detallada
- Acciones rápidas integradas

#### Vista por Fuerza

- Acordeones expandibles por fuerza
- Distribución de trámites por pasos dentro de cada fuerza
- Métricas visuales y contadores

#### Vista por Tipo de Préstamo

- Gráficos de distribución
- Porcentajes visuales
- Barra de progreso interactiva

## 🎯 Acciones Rápidas

Cada tarjeta de trámite incluye tres acciones principales:

### 1. **Ver Detalles**

- Navega a la página completa del trámite
- Muestra toda la información y documentación

### 2. **Avanzar Paso**

- Avanza el trámite al siguiente paso del flujo
- Solicita confirmación con diálogo
- Permite agregar observaciones
- Actualiza automáticamente el dashboard

### 3. **Contactar Cliente**

- Registra el último contacto con el cliente
- Actualiza la fecha de contacto
- Permite agregar notas sobre el contacto

## 🎨 Diseño Visual

### Código de Colores

- **Verde**: Estados normales y acciones de avance
- **Rojo**: Trámites urgentes o con retraso
- **Azul**: Información general
- **Naranja**: Alertas y advertencias

### Indicadores Visuales

- **Borde Izquierdo de Color**: Identifica el paso actual del trámite
- **Etiqueta "URGENTE"**: Se muestra en trámites que exceden el tiempo máximo
- **Chips de Colores**: Identifican el tipo de préstamo

## 📊 Información en Tarjetas de Trámite

Cada tarjeta muestra:

1. **Número de Trámite**: ID único (#123)
2. **Cliente**: Nombre completo
3. **Tipo de Préstamo**: Con chip de color
4. **Monto Solicitado**: Si está disponible
5. **Fecha de Creación**: Con formato dd/MM/yyyy
6. **Días en el Sistema**: Con alerta si excede el máximo
7. **Botones de Acción**: Ver, Avanzar, Contactar

## 🔧 Componentes Técnicos

### Componentes Principales

- `DashboardContent.tsx`: Contenedor principal
- `DashboardStats.tsx`: KPIs y estadísticas
- `FiltrosDashboard.tsx`: Sistema de filtros
- `TramitesPorPasoView.tsx`: Vista Kanban
- `TramitesPorFuerzaView.tsx`: Vista por fuerza
- `TramitesPorTipoPrestamoView.tsx`: Vista por tipo
- `TramiteMiniCard.tsx`: Tarjeta de trámite individual
- `AccionesRapidasDialog.tsx`: Diálogo de confirmación

### Servicios Utilizados

- `tramitesService.getEstadisticas()`: Obtiene datos del dashboard
- `tramitesService.avanzarPaso()`: Avanza un trámite
- `tramitesService.actualizarUltimoContacto()`: Registra contacto
- `fuerzasService.getAll()`: Obtiene lista de fuerzas

## 🚀 Uso

### Navegación

1. Accede al dashboard desde la página principal (/)
2. Usa los filtros superiores para refinar la vista
3. Cambia entre las 3 vistas usando las pestañas
4. Interactúa con las tarjetas de trámites

### Acciones Rápidas

1. **Ver Detalles**: Click en el botón de información (ℹ️)
2. **Avanzar**: Click en el botón de flecha (→)
3. **Contactar**: Click en el botón de teléfono (📞)
4. **Menú Completo**: Click en los tres puntos (⋮)

### Mejores Prácticas

- Usa la vista Kanban para gestión diaria
- Usa la vista por Fuerza para análisis por departamento
- Usa la vista por Tipo para análisis de productos
- Los filtros ayudan a enfocarse en áreas específicas
- Las acciones rápidas mejoran la productividad

## 📱 Responsive Design

El dashboard es completamente responsive:

- **Desktop**: Vista completa con todas las columnas Kanban
- **Tablet**: Scroll horizontal en vista Kanban
- **Mobile**: Una columna a la vez con navegación por scroll

## 🎯 Estadísticas y Métricas

El backend debe retornar la siguiente estructura en `/tramites/estadisticas`:

```typescript
interface EstadisticasDashboard {
  totalTramites: number;
  tramitesActivos: number;
  tramitesConRetraso: number;
  tramitesUltimaSemana: number;
  porPaso: EstadisticasPorPaso[];
  porFuerza: EstadisticasPorFuerza[];
  porTipoPrestamo: EstadisticasPorTipoPrestamo[];
  tramitesRecientes: Tramite[];
}
```

## 🔄 Actualización de Datos

Los datos se actualizan:

- Al cargar la página
- Al cambiar filtros
- Después de ejecutar acciones rápidas
- Manualmente con refresh del navegador

## 💡 Tips

- **Trámites Urgentes**: Se destacan visualmente con borde rojo y etiqueta
- **Scroll Horizontal**: En vista Kanban, usa scroll para ver todos los pasos
- **Colores Personalizados**: Cada paso tiene su color configurado en el flujo
- **Confirmación de Acciones**: Todas las acciones críticas requieren confirmación

## 🛠️ Personalización

Para personalizar el dashboard:

1. **Colores de Pasos**: Se configuran en el editor de flujos
2. **Días Máximos**: Se configuran por paso en el flujo
3. **KPIs**: Se pueden agregar más en `DashboardStats.tsx`
4. **Vistas**: Se pueden agregar nuevas pestañas en `DashboardContent.tsx`

## 📝 Notas Importantes

- Los trámites se agrupan automáticamente por paso actual
- El sistema respeta las reglas de transición del flujo
- Las acciones rápidas validan permisos del usuario
- El dashboard es la pantalla principal del sistema

