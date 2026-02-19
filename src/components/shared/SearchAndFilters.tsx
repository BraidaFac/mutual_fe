"use client";

import { Clear, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useState } from "react";

export type FilterType = "select" | "dateRange";

interface FilterOption {
  value: string | number;
  label: string;
}

interface SearchAndFiltersProps {
  searchValue: string | number;
  onSearchChange: (value: string | number) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value: string | number | Date | null;
    options?: FilterOption[];
    type?: FilterType;
    onChange: (value: string | number | Date | null) => void;
  }>;
  onClearFilters?: () => void;
}

export default function SearchAndFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  onClearFilters,
}: SearchAndFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const activeFiltersCount = filters.filter((f) => f.value).length;

  return (
    <Box mb={3}>
      <Stack spacing={2}>
        {/* Barra de búsqueda */}
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <Search sx={{ mr: 1, color: "action.active" }} />
                ),
                endAdornment: localSearch && (
                  <Button
                    size="small"
                    onClick={() => {
                      setLocalSearch("");
                      onSearchChange("");
                    }}
                  >
                    <Clear />
                  </Button>
                ),
              },
            }}
          />
        </form>

        {/* Filtros */}
        {filters.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            {filters
              .filter((f) => f.type === "dateRange")
              .map((filter) => (
                <DatePicker
                  key={filter.key}
                  label={filter.label}
                  onChange={(value) => filter.onChange(value)}
                  value={filter.value as Date | null}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { minWidth: 120 },
                    },
                  }}
                />
              ))}
            {filters
              .filter((f) => f.options)
              .map((filter) => (
                <FormControl
                  key={filter.key}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={filter.value}
                    label={filter.label}
                    onChange={(e) => filter.onChange(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {filter.options!.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

            {/* Indicador de filtros activos y botón limpiar */}
            {activeFiltersCount > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${activeFiltersCount} filtro${
                    activeFiltersCount > 1 ? "s" : ""
                  } activo${activeFiltersCount > 1 ? "s" : ""}`}
                  size="small"
                  variant="outlined"
                />
                {onClearFilters && (
                  <Button
                    size="small"
                    onClick={onClearFilters}
                    startIcon={<Clear />}
                  >
                    Limpiar
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
