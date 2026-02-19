"use client";

import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showAddButton = false,
  addButtonText = "Agregar",
  onAdd,
  actions,
}: PageHeaderProps) {
  return (
    <Box mb={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={2}>
          {showAddButton && onAdd && (
            <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
              {addButtonText}
            </Button>
          )}
          {actions}
        </Stack>
      </Stack>
    </Box>
  );
}
