"use client";

import { EstadisticasDashboard } from "@/types/index";
import {
  Assignment,
  AssignmentLate,
  CheckCircle,
  TrendingUp,
} from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

interface DashboardStatsProps {
  estadisticas: EstadisticasDashboard;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          border: `1px solid ${color}50`,
        },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              color="text.secondary"
              variant="body2"
              gutterBottom
              fontWeight={500}
            >
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold" my={1}>
              {value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function DashboardStats({ estadisticas }: DashboardStatsProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total de Trámites"
          value={estadisticas.totalTramites}
          icon={<Assignment sx={{ color: "#1976d2", fontSize: 32 }} />}
          color="#1976d2"
          subtitle="Todos los trámites en el sistema"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Trámites Activos"
          value={estadisticas.tramitesActivos}
          icon={<CheckCircle sx={{ color: "#2e7d32", fontSize: 32 }} />}
          color="#2e7d32"
          subtitle="En proceso actualmente"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Con Retraso"
          value={estadisticas.tramitesConRetraso}
          icon={<AssignmentLate sx={{ color: "#d32f2f", fontSize: 32 }} />}
          color="#d32f2f"
          subtitle="Requieren atención urgente"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Última Semana"
          value={estadisticas.tramitesUltimaSemana}
          icon={<TrendingUp sx={{ color: "#ed6c02", fontSize: 32 }} />}
          color="#ed6c02"
          subtitle="Nuevos en 7 días"
        />
      </Grid>
    </Grid>
  );
}
