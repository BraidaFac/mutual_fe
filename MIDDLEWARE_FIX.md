# 🐛 Fix: Loop Infinito en Middleware - Solución Temporal

## ❌ **Problema**

El middleware estaba entrando en loop infinito con la URL: `http://localhost:3000/login?from=%2Flogin`

## 🔍 **Causa Raíz**

1. **El backend NO está enviando la cookie `refreshToken`** (todavía no implementaste los cambios de `AUTHENTICATION_REFACTOR.md`)
2. El middleware SOLO verifica la cookie, por lo que siempre detecta `hasAuth = false`
3. El middleware redirige `/login` a `/login?from=/login` infinitamente

## ✅ **Solución Implementada**

He arreglado el middleware con tres cambios clave:

### **1. Verificación correcta de rutas públicas**

**Antes (❌ Bug):**

```typescript
if (PUBLIC_ROUTES.includes(pathname) && hasAuth) {
  return NextResponse.redirect(new URL("/", request.url));
}
```

**Problema:** Si `hasAuth = false`, no hace nada y continúa ejecutando el código de protección de rutas, que redirige `/login` a `/login?from=/login`.

**Ahora (✅ Fix):**

```typescript
const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

if (isPublicRoute) {
  // Si está en ruta pública y YA está autenticado, redirigir al dashboard
  if (hasAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // ✅ Si no está autenticado, permitir acceso a la ruta pública
  return NextResponse.next();
}
```

**Resultado:** Si estás en `/login` sin autenticación, el middleware termina aquí y permite el acceso.

---

### **2. Evitar agregar `from` cuando ya estás en login**

**Antes (❌):**

```typescript
if (isProtectedRoute && !hasAuth) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname); // ❌ Siempre agrega from
  return NextResponse.redirect(loginUrl);
}
```

**Ahora (✅):**

```typescript
if (isProtectedRoute && !hasAuth) {
  const loginUrl = new URL("/login", request.url);

  // ✅ Solo agregar 'from' si NO es la raíz
  if (pathname !== "/") {
    loginUrl.searchParams.set("from", pathname);
  }

  return NextResponse.redirect(loginUrl);
}
```

---

### **3. Mejor detección de rutas protegidas**

**Antes (❌):**

```typescript
const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
  pathname.startsWith(route)
);
```

**Problema:** `/login` comienza con `/` (raíz), por lo que `startsWith("/")` retorna `true` y lo considera protegido.

**Ahora (✅):**

```typescript
const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
  // Usar === para raíz, startsWith para subrutas
  return pathname === route || pathname.startsWith(`${route}/`);
});
```

**Resultado:** Solo coincide con rutas exactas o subrutas (ej: `/clientes/123`), pero no con `/login`.

---

## 🎯 **Flujo Correcto Ahora**

### **Caso 1: Acceso a `/login` sin autenticación**

```
Usuario → /login
  ↓
Middleware detecta: isPublicRoute = true, hasAuth = false
  ↓
return NextResponse.next() ✅
  ↓
Página de login se muestra correctamente
```

### **Caso 2: Acceso a `/clientes` sin autenticación**

```
Usuario → /clientes
  ↓
Middleware detecta: isProtectedRoute = true, hasAuth = false
  ↓
Redirige a /login?from=/clientes ✅
  ↓
Después del login, puede redirigir de vuelta a /clientes
```

### **Caso 3: Acceso a `/login` CON autenticación**

```
Usuario autenticado → /login
  ↓
Middleware detecta: isPublicRoute = true, hasAuth = true
  ↓
return NextResponse.redirect("/") ✅
  ↓
Redirige al dashboard (ya está autenticado)
```

---

## 📝 **Explicación del Parámetro `from`**

### **¿Para qué sirve `from`?**

El parámetro `from` guarda la URL a la que el usuario intentó acceder antes de ser redirigido al login.

**Ejemplo:**

1. Usuario intenta acceder a `/tramites/123` sin estar autenticado
2. Middleware redirige a `/login?from=/tramites/123`
3. Usuario inicia sesión
4. La página de login puede leer el parámetro `from` y redirigir de vuelta a `/tramites/123`

### **Código en la página de login para usar `from`:**

```typescript
// src/app/login/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleLogin = async (loginData) => {
    const success = await login(loginData);

    if (success) {
      // ✅ Leer el parámetro 'from'
      const from = searchParams.get("from") || "/";

      // ✅ Redirigir a donde el usuario quería ir
      router.push(from);
    }
  };

  return (
    // ... formulario de login
  );
}
```

---

## ⚠️ **IMPORTANTE: Solución Temporal**

Este fix **NO es la solución definitiva**. El middleware actualmente:

- ✅ Funciona correctamente para desarrollo
- ✅ Evita loops infinitos
- ❌ **NO verifica autenticación real** (porque el backend no envía cookies)

### **Solución Definitiva:**

Necesitas implementar los cambios en el backend NestJS según `AUTHENTICATION_REFACTOR.md`:

1. ✅ Enviar `refreshToken` en cookie httpOnly desde `/auth/login`
2. ✅ Implementar `/auth/refresh-token` que lee desde cookies
3. ✅ Configurar CORS con `credentials: true`

Una vez implementado, el middleware funcionará perfectamente verificando la cookie real.

---

## 🧪 **Cómo Probar**

### **1. Sin autenticación:**

```bash
# Acceder a login directamente
http://localhost:3000/login  ✅ Debe mostrar login

# Acceder a ruta protegida
http://localhost:3000/clientes  → Redirige a /login?from=/clientes ✅
```

### **2. Con autenticación (después de implementar backend):**

```bash
# Login exitoso guarda cookie refreshToken
POST /auth/login → cookie refreshToken establecida

# Acceder a login estando autenticado
http://localhost:3000/login → Redirige a / ✅

# Acceder a rutas protegidas
http://localhost:3000/clientes ✅ Permite acceso
```

---

## 🎯 **Resumen de Cambios**

| Cambio                 | Antes                    | Ahora                                    |
| ---------------------- | ------------------------ | ---------------------------------------- |
| **Rutas públicas**     | Solo redirige si hasAuth | Siempre retorna next() si no auth        |
| **Parámetro from**     | Siempre se agrega        | Solo si pathname !== "/"                 |
| **Detección de rutas** | `startsWith("/")` buggy  | `=== route \|\| startsWith(route + "/")` |
| **Logs**               | Básicos                  | Detallados para debug                    |
| **Loop infinito**      | ❌ Existe                | ✅ Eliminado                             |

---

## 🚀 **Próximos Pasos**

1. ✅ El middleware ya está arreglado
2. ⏳ Implementar cambios en backend NestJS (ver `AUTHENTICATION_REFACTOR.md`)
3. ⏳ Actualizar página de login para usar el parámetro `from`
4. ⏳ Probar flujo completo de autenticación

**¡El loop infinito está resuelto!** 🎉
