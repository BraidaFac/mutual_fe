/**
 * Contenido principal de la página de Importación ETL
 * Orquesta el flujo de selección de template, carga de archivo y ejecución
 */

"use client";

import { PageHeader } from "@/components/shared";
import { useImportExecution } from "@/hooks/etl";
import {
  CheckCircle,
  CloudUpload,
  PlayArrow,
  Settings
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import { useCallback, useState } from "react";
import FileUploader from "./FileUploader";
import TemplateSelector from "./TemplateSelector";

const STEPS = [
  "Seleccionar template",
  "Cargar archivo",
  "Ejecutar importación",
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

export default function ImportContent() {
  // Estado de UI
  const [activeTab, setActiveTab] = useState(0);
  const [validatingFile, setValidatingFile] = useState(false);

  // Hook de importación
  const {
    templates,
    loadingTemplates,
    selectedTemplate,
    selectTemplate,
    selectedFile,
    setFile,
    clearFile,
    fileError,
    executing,
    canExecute,
    executeImport,
  } = useImportExecution();

  // Calcular paso activo
  const getActiveStep = () => {
    if (!selectedTemplate) return 0;
    if (!selectedFile) return 1;
    return 2;
  };

  const activeStep = getActiveStep();

  // Handlers
  const handleExecute = useCallback(async () => {
    setValidatingFile(true);
    executeImport();
  }, [ executeImport]);


  const handleNewImport = useCallback(() => {
    clearFile();
  }, [clearFile]);


  return (
    <Box>
      <PageHeader
        title="Importación de Datos"
        subtitle="Importa datos desde archivos CSV o Excel utilizando templates configurados"
        actions={
          <Button variant="outlined" onClick={handleNewImport}>
            Nueva importación
          </Button>
        }
      />

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue: number) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<CloudUpload />}
            iconPosition="start"
            label="Nueva importación"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Si hay una ejecución en curso o completada, mostrar resultados */}
            <Stack spacing={4}>
                {/* Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel>
                  {STEPS.map((label, index) => (
                    <Step key={`step-${index}`} completed={index < activeStep}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Paso 1: Selección de template */}
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Settings
                        color={selectedTemplate ? "success" : "action"}
                      />
                      <Typography variant="h6">
                        1. Seleccionar Template
                      </Typography>
                      {selectedTemplate && (
                        <CheckCircle color="success" fontSize="small" />
                      )}
                    </Stack>

                    <TemplateSelector
                      templates={templates}
                      selectedTemplate={selectedTemplate}
                      onSelect={selectTemplate}
                      loading={loadingTemplates}
                    />

                    {selectedTemplate && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Este template espera archivos{" "}
                        <strong>
                          {selectedTemplate.fileType.toUpperCase()}
                        </strong>{" "}
                        y mapeará{" "}
                        <strong>
                          {selectedTemplate.columnMappings.length} columnas
                        </strong>
                        .
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Paso 2: Carga de archivo */}
                <Collapse in={!!selectedTemplate}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <CloudUpload
                          color={
                            selectedFile && !fileError ? "success" : "action"
                          }
                        />
                        <Typography variant="h6">2. Cargar Archivo</Typography>
                        {selectedFile && !fileError && (
                          <CheckCircle color="success" fontSize="small" />
                        )}
                      </Stack>

                      <FileUploader
                        file={selectedFile}
                        onFileSelect={setFile}
                        onClear={clearFile}
                        error={fileError}
                        acceptedFileType={selectedTemplate?.fileType}
                        disabled={!selectedTemplate}
                      />

                      {fileError && (
                        <Box sx={{ mt: 2 }}>
                          <Alert severity="error">{fileError}</Alert>
                        </Box>
                      )}
                      {!validatingFile &&  selectedFile && (
                        <Box sx={{ mt: 2 }}>
                          <Alert severity="success">
                            Archivo válido. 
                          </Alert>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Collapse>

                {/* Paso 3: Ejecutar */}
                <Collapse
                  in={!!selectedTemplate && !!selectedFile && !fileError}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <PlayArrow color="action" />
                        <Typography variant="h6">
                          3. Ejecutar Importación
                        </Typography>
                      </Stack>

                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Resumen:</strong>
                        </Typography>
                        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                          <li>Template: {selectedTemplate?.nombre}</li>
                          <li>Archivo: {selectedFile?.name}</li>
                          <li>
                            Tipo de entidad: {selectedTemplate?.entity.name}
                          </li>
                          <li>
                            Columnas a mapear:{" "}
                            {selectedTemplate?.columnMappings.length}
                          </li>
                        </ul>
                      </Alert>

                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={
                            executing ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <PlayArrow />
                            )
                          }
                          onClick={handleExecute}
                          disabled={!canExecute || executing}
                        >
                          {executing ? "Importando..." : "Iniciar importación"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Collapse>
              </Stack>
          </Box>
        </TabPanel>

      </Paper>

    </Box>
  );
}
