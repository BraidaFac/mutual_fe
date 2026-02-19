# 🔄 Fix: Loops Infinitos en Hooks - useCallback y Memoización

## 🐛 **Problema**

Varios hooks estaban causando **loops infinitos** por funciones que se recreaban en cada render.

### **Síntomas:**
- `fetchTemplates()` se ejecutaba infinitas veces
- `loadEntityProperties()` se ejecutaba infinitas veces
- La aplicación se volvía muy lenta
- Múltiples requests al servidor

---

## 🔍 **Causa Raíz**

### **1. `useErrorHandler` sin memoización**

```typescript
// ❌ ANTES (MAL)
export function useErrorHandler() {
  const handleError = (error: unknown) => { // Se recrea en CADA render
    // ...
  };
  
  return { handleError }; // Nueva referencia en cada render
}
```

**Problema:** Cada vez que el componente se renderiza, `handleError` es una **nueva función** (nueva referencia en memoria).

---

### **2. Hooks dependiendo de funciones no memoizadas**

```typescript
// ❌ ANTES (MAL)
const fetchTemplates = useCallback(
  async () => {
    handleError(error); // Usa handleError
  },
  [handleError] // ← handleError cambia en cada render!
);

useEffect(() => {
  fetchTemplates();
}, [fetchTemplates]); // ← fetchTemplates se recrea constantemente
```

---

### **3. El Loop Infinito Completo**

```
Render 1:
  useErrorHandler() → crea handleError (ref 0x001)
  useImportTemplates()
    → fetchTemplates con dep [handleError ref 0x001]
    → useCallback genera fetchTemplates (ref 0xAAA)
  
  useEffect detecta fetchTemplates (ref 0xAAA)
    → ejecuta fetchTemplates()
    → setState() → causa re-render

Render 2:
  useErrorHandler() → crea handleError (ref 0x002) ← ¡NUEVA REFERENCIA!
  useImportTemplates()
    → detecta que handleError cambió
    → fetchTemplates se RECREA (ref 0xBBB)
  
  useEffect detecta fetchTemplates (ref 0xBBB) ← ¡DIFERENTE!
    → ejecuta fetchTemplates()
    → setState() → causa re-render

Render 3:
  useErrorHandler() → crea handleError (ref 0x003) ← ¡NUEVA REFERENCIA!
  ...
  
♾️ LOOP INFINITO
```

---

## ✅ **Solución: Memoización con `useCallback`**

### **1. Memoizar `useErrorHandler`**

```typescript
// ✅ AHORA (BIEN)
import { useCallback } from "react";

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    // ... lógica ...
  }, []); // ← Sin dependencias, siempre la misma referencia
  
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []); // ← Sin dependencias, siempre la misma referencia
  
  return { handleError, showSuccess };
}
```

**Resultado:** `handleError` y `showSuccess` **mantienen la misma referencia** entre renders.

---

### **2. Remover dependencias innecesarias en hooks**

**Opción A: Sin dependencias (recomendado cuando la función está memoizada)**

```typescript
// ✅ BIEN
const fetchTemplates = useCallback(
  async () => {
    handleError(error); // handleError ahora está memoizado
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [] // ← Sin dependencias porque handleError no cambia
);
```

**Opción B: Solo dependencias necesarias**

```typescript
// ✅ BIEN
const fetchTemplates = useCallback(
  async () => {
    // ...
  },
  [filtros] // ← Solo filtros, no handleError
);
```

---

## 📊 **Comparación: Antes vs Después**

### **Antes ❌:**

```typescript
// useErrorHandler.ts
const handleError = (error: unknown) => { /* ... */ };

// useImportTemplates.ts
const fetchTemplates = useCallback(
  async () => { /* ... */ },
  [handleError] // ← Cambia en cada render!
);

// TemplatesContent.tsx
useEffect(() => {
  fetchTemplates();
}, [fetchTemplates]); // ← Se ejecuta infinitamente
```

**Resultado:**
```
Render → handleError nuevo → fetchTemplates nuevo 
  → useEffect ejecuta → setState 
  → Render → handleError nuevo → fetchTemplates nuevo
  → useEffect ejecuta → setState
  → ♾️ LOOP INFINITO
```

---

### **Después ✅:**

```typescript
// useErrorHandler.ts
const handleError = useCallback((error: unknown) => { 
  /* ... */ 
}, []); // ← Memoizado, misma referencia

// useImportTemplates.ts
const fetchTemplates = useCallback(
  async () => { /* ... */ },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [] // ← Sin dependencias problemáticas
);

// TemplatesContent.tsx
useEffect(() => {
  fetchTemplates();
}, [fetchTemplates]); // ← Se ejecuta solo cuando cambia (nunca)
```

**Resultado:**
```
Render → handleError (misma ref) → fetchTemplates (misma ref)
  → useEffect ejecuta UNA vez
  
Render posterior → handleError (misma ref) → fetchTemplates (misma ref)
  → useEffect NO ejecuta (no cambió)
  
✅ Sin loops
```

---

## 🔑 **Reglas de Memoización**

### **1. ¿Cuándo usar `useCallback`?**

✅ **SÍ usar cuando:**
- La función es pasada como prop a componentes hijos
- La función es dependencia de `useEffect` o `useCallback`
- La función se usa en múltiples lugares
- Quieres evitar re-renders innecesarios

❌ **NO usar cuando:**
- La función solo se usa dentro del componente
- La función no causa re-renders
- Optimización prematura sin problemas reales

---

### **2. ¿Qué poner en las dependencias?**

```typescript
const myFunction = useCallback(() => {
  console.log(stateValue); // ← Usa stateValue
  someOtherFunction();     // ← Usa someOtherFunction
}, [stateValue, someOtherFunction]); // ← Incluir ambas
```

**Regla:** Incluye **todo lo que uses** dentro de la función.

**Excepción:** Si sabes que algo está memoizado y no cambiará, puedes omitirlo con `eslint-disable`.

---

### **3. Patrones Comunes**

#### **Patrón 1: Hook de utilidades sin dependencias**

```typescript
export function useUtility() {
  const doSomething = useCallback((arg: string) => {
    // No depende de props/state del componente
    console.log(arg);
  }, []); // ← Sin dependencias
  
  return { doSomething };
}
```

#### **Patrón 2: Hook con dependencias de estado**

```typescript
export function useCounter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(c => c + 1); // ← Usa forma funcional, no necesita count
  }, []); // ← Sin dependencias
  
  return { count, increment };
}
```

#### **Patrón 3: Función que depende de props**

```typescript
function MyComponent({ userId }: { userId: string }) {
  const fetchUser = useCallback(async () => {
    const user = await api.getUser(userId); // ← Depende de userId
    // ...
  }, [userId]); // ← Incluir userId
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
}
```

---

## 📝 **Archivos Modificados**

### **1. `src/hooks/useErrorHandler.ts`**

**Cambios:**
- ✅ Todos los handlers envueltos en `useCallback`
- ✅ Sin dependencias innecesarias
- ✅ Siempre retornan las mismas referencias

### **2. `src/hooks/etl/useImportTemplates.ts`**

**Cambios:**
- ✅ `fetchTemplates` sin dependencia de `handleError`
- ✅ `createTemplate`, `updateTemplate`, `deleteTemplate`, `duplicateTemplate` sin dependencias
- ✅ `useEffect` inicial solo se ejecuta al montar

### **3. `src/hooks/etl/useTemplateForm.ts`**

**Cambios:**
- ✅ `loadEntityProperties` sin dependencia de `handleError`

### **4. `src/components/etl/templates/TemplatesContent.tsx`**

**Cambios:**
- ✅ Ya no causa loops porque `fetchTemplates` está memoizado correctamente

---

## 🧪 **Cómo Verificar que Funciona**

### **1. Abrir DevTools**
```javascript
// En la consola del navegador
console.log("Verificando renders...");
```

### **2. Observar la pestaña Network**
- ✅ **Antes:** Múltiples requests iguales (loop)
- ✅ **Ahora:** Solo un request por acción

### **3. Agregar logs temporales**
```typescript
useEffect(() => {
  console.log("useEffect ejecutado"); // Debería verse solo 1 vez
  fetchTemplates();
}, [fetchTemplates]);
```

---

## 🎯 **Resumen**

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **handleError** | Nueva función en cada render | Memoizada, misma referencia |
| **fetchTemplates** | Se recrea constantemente | Memoizada correctamente |
| **Loops infinitos** | Múltiples | Cero |
| **Performance** | Mala (muchos renders) | Buena (renders necesarios) |
| **Requests API** | Duplicados | Solo necesarios |

---

## 💡 **Lección Aprendida**

**"Cuando uses funciones de hooks personalizados como dependencias, asegúrate de que estén memoizadas con `useCallback`"**

Esto es especialmente importante para:
- ✅ Handlers de errores
- ✅ Funciones de utilidades
- ✅ Callbacks de eventos
- ✅ Funciones pasadas a useEffect

---

## 🚀 **Próximos Pasos**

1. ✅ Loops infinitos eliminados
2. ✅ Performance mejorada
3. ⏳ Monitorear en desarrollo que no haya nuevos loops
4. ⏳ Aplicar el mismo patrón en otros hooks similares

**¡Problema resuelto!** 🎉


