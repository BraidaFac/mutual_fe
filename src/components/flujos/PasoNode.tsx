"use client";

import { PasoTramite, TipoPaso } from "@/types/index";
import {
  AccessTime as AccessTimeIcon,
  FlashOn as FlashOnIcon,
} from "@mui/icons-material";
import { Box, Chip, Paper, Tooltip, Typography } from "@mui/material";
import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

interface PasoNodeProps {
  data: {
    paso: PasoTramite;
    onEdit?: (paso: PasoTramite) => void;
  };
}

const PasoNode = memo(({ data }: PasoNodeProps) => {
  const { paso } = data;

  const tieneTransicionesAutomaticas =
    paso.transicionesOrigen?.some((t) => t.esAutomatico) || false;

  return (
    <>
      {/* Handle de entrada (izquierda) */}
      {paso.tipoPaso !== TipoPaso.INICIAL && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: "#555",
            width: 12,
            height: 12,
            border: "2px solid white",
          }}
        />
      )}
      <Paper
        elevation={3}
        sx={{
          minWidth: 200,
          maxWidth: 250,
          cursor: "pointer",
          transition: "all 0.2s",
          border: `3px solid ${paso.color}`,
          backgroundColor: "white",
          "&:hover": {
            boxShadow: 6,
            transform: "scale(1.02)",
          },
        }}
        onClick={() => data.onEdit?.(paso)}
      >
        {/* Header con color y secuencia */}
        <Box
          sx={{
            backgroundColor: paso.color,
            color: "white",
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" fontWeight="bold">
            Paso {paso.orden}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {tieneTransicionesAutomaticas && (
              <Tooltip title="Transiciones automáticas configuradas">
                <FlashOnIcon sx={{ fontSize: 16 }} />
              </Tooltip>
            )}
            {paso.diasMaximoSinAvance && (
              <Tooltip title={`${paso.diasMaximoSinAvance} días máximo`}>
                <AccessTimeIcon sx={{ fontSize: 16 }} />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Contenido del nodo */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {paso.nombre}
          </Typography>
          {paso.descripcion && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {paso.descripcion}
            </Typography>
          )}
        </Box>

        {/* Footer con estado */}
        <Box
          sx={{
            px: 1.5,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
          {paso.diasMaximoSinAvance && (
            <Typography variant="caption" color="text.secondary">
              {paso.diasMaximoSinAvance}d máx
            </Typography>
          )}
        </Box>
      </Paper>
      {/* Handle de salida (derecha) */}

      {paso.tipoPaso !== TipoPaso.FINAL_EXITOSO &&
        paso.tipoPaso !== TipoPaso.FINAL_RECHAZADO && (
          <Handle
            type="source"
            position={Position.Right}
            style={{
              background: "#555",
              width: 12,
              height: 12,
              border: "2px solid white",
            }}
          />
        )}
    </>
  );
});

PasoNode.displayName = "PasoNode";

export default PasoNode;
