/**
 * Página de Templates de Importación
 * Configura templates de mapeo para importaciones
 */

import TemplatesContent from "@/components/etl/templates/TemplatesContent";

export const metadata = {
  title: "Templates de Importación | CRM",
  description: "Configura templates de mapeo para importaciones de datos",
};

export default function TemplatesPage() {
  return <TemplatesContent />;
}
