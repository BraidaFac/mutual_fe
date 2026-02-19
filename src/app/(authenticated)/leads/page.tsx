/**
 * Página de Leads
 * Gestión de leads del CRM
 */

import LeadsContent from "@/components/leads/LeadsContent";

export const metadata = {
  title: "Leads | CRM",
  description: "Gestión de leads del sistema CRM",
};

export default function LeadsPage() {
  return <LeadsContent />;
}
