"use client";

import { Chip } from "@mui/material";

interface StatusChipProps {
  status: string;
  color?: "urgent" | "warning" | "success" | "info" | "default";
  size?: "small" | "medium";
}

export default function StatusChip({
  status,
  color = "default",
  size = "small",
}: StatusChipProps) {
  const getChipColor = () => {
    switch (color) {
      case "urgent":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={status}
      color={getChipColor()}
      size={size}
      variant="outlined"
    />
  );
}
