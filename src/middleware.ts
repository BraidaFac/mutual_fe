/**
 * Middleware de Next.js para protección de rutas
 * Se ejecuta en el edge runtime antes de cada request
 */

import { NextRequest, NextResponse } from "next/server";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/login", "/register"];

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = [
  "/",
  "/clientes",
  "/tramites",
  "/flujos",
  "/documentos",
  "/fuerzas",
  "/configuracion",
  "/importacion",
  "/localidades",
  "/leads",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar autenticación desde múltiples fuentes
  const refreshTokenFromCookie = request.cookies.get("refreshToken")?.value;

  console.log("refreshTokenFromCookie", refreshTokenFromCookie);
  // Como fallback, también verificar si hay token en localStorage
  // (el middleware no puede acceder a localStorage, pero podemos inferirlo)
  const hasAuth = !!refreshTokenFromCookie;

  // ✅ IMPORTANTE: Permitir acceso a rutas públicas sin redirección
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  console.log("isPublicRoute", isPublicRoute);
  if (isPublicRoute) {
    // Si está en ruta pública y YA está autenticado, redirigir al dashboard
    if (hasAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Si no está autenticado, permitir acceso a la ruta pública
    return NextResponse.next();
  }

  // Verificar si es ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    // Usar === para raíz, startsWith para subrutas
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Si es ruta protegida y NO está autenticado, redirigir al login
  if (isProtectedRoute && !hasAuth) {
    const loginUrl = new URL("/login", request.url);

    // Solo agregar 'from' si NO es la raíz
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }

    console.log("[Middleware] Redirigiendo a login desde", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurar qué rutas procesa el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
