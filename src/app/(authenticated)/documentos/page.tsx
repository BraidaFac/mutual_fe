/**
 * Página de Documentos
 * Gestión de documentos del sistema
 */

import DocumentosContent from "@/components/documentos/DocumentosContent";

export const metadata = {
  title: "Documentos | CRM",
  description: "Gestión de documentos del sistema",
};

export default function DocumentosPage() {
  return <DocumentosContent />;
}
