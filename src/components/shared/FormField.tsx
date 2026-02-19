/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  type: "text" | "email" | "tel" | "number" | "select" | "checkbox";
  name: string;
  label: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  options?: Option[];
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  disabled?: boolean;
  slotProps?: any;
}

export default function FormField({
  type,
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  options = [],
  placeholder,
  multiline = false,
  rows = 1,
  fullWidth = true,
  disabled = false,
  slotProps = {},
}: FormFieldProps) {
  if (type === "select") {
    return (
      <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled}>
        <InputLabel required={required}>{label}</InputLabel>
        <Select
          name={name}
          value={value as string}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          {!required && (
            <MenuItem value="">
              <em>Seleccionar...</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }

  if (type === "checkbox") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={value as boolean}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        }
        label={label}
      />
    );
  }

  return (
    <TextField
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
      required={required}
      placeholder={placeholder}
      multiline={multiline}
      slotProps={slotProps}
      rows={multiline ? rows : undefined}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
}
