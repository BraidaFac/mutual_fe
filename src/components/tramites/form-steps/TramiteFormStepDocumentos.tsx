import { FlujoTramite } from "@/types/flujo.types";
import { Cliente, TramiteDocumento } from "@/types/index";
import { Alert, Box } from "@mui/material";
import React from "react";
import { TramiteDocumentosManager } from "../documentos";

interface TramiteFormStepDocumentosProps {
  cliente: Cliente | null;
  flujo: FlujoTramite | null;
  documentos: TramiteDocumento[];
  onChange: (documentos: TramiteDocumento[]) => void;
}

export const TramiteFormStepDocumentos: React.FC<
  TramiteFormStepDocumentosProps
> = ({ cliente, flujo, documentos, onChange }) => {
  // Validación de flujo requerido
  if (!flujo) {
    return (
      <Box>
        <Alert severity="warning">
          Para continuar con la carga de documentos, primero debe completar los
          datos del trámite y seleccionar un tipo de préstamo.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <TramiteDocumentosManager
        flujo={flujo}
        cliente={cliente}
        documentosCargados={documentos}
        onDocumentosChange={onChange}
      />
    </Box>
  );
};
