/**
 * Página de Clientes
 * Gestión de clientes del CRM
 */

import ClientesContent from "@/components/clientes/ClientesContent";

export const metadata = {
  title: "Clientes | CRM",
  description: "Gestión de clientes del sistema CRM",
};

export default function ClientesPage() {
  return <ClientesContent />;
}
