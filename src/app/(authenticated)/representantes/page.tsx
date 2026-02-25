/**
 * Página de Representantes
 * Gestión de representantes del sistema (solo ADMIN y MANAGER)
 */

import RepresentantesContent from "@/components/representantes/RepresentantesContent";

export const metadata = {
  title: "Representantes | CRM",
  description: "Gestión de representantes del sistema",
};

export default function RepresentantesPage() {
  return <RepresentantesContent />;
}
