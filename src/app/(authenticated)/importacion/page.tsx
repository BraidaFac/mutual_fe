/**
 * Página de Importación ETL
 * Permite ejecutar importaciones usando templates configurados
 */

import ImportContent from "@/components/etl/import/ImportContent";

export const metadata = {
  title: "Importación de Datos | CRM",
  description: "Importa datos desde archivos CSV o Excel",
};

export default function ImportacionPage() {
  return <ImportContent />;
}
