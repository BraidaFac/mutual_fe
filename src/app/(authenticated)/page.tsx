/**
 * Dashboard principal
 * Muestra estadísticas y resumen de trámites
 */

import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata = {
  title: "Dashboard | CRM",
  description: "Panel principal del sistema CRM",
};

export default function Home() {
  return <DashboardContent />;
}
