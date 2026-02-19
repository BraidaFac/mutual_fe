"use client";

import { deepClone } from "@/lib/clone";
import { flujosService } from "@/services/index";
import {
  DocumentoRequerido,
  FlujoDto,
  FlujoTramite,
  PasoTramite,
  ReglaTransicion,
} from "@/types/index";
import {
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import PasoNode from "./PasoNode";

interface FlujoVisualEditorProps {
  open: boolean;
  onClose: () => void;
  flujo: FlujoTramite | null;
  onFlujoActualizado?: () => void;
  onEditarPaso?: (paso: PasoTramite) => void;
}

interface TransicionDialogData {
  open: boolean;
  sourceId: number | null;
  targetId: number | null;
  transicionExistente?: ReglaTransicion;
}

const nodeTypes = {
  pasoNode: PasoNode,
};

const FlujoVisualEditor = ({
  open,
  onClose,
  flujo,
  onFlujoActualizado,
  onEditarPaso,
}: FlujoVisualEditorProps) => {
  const [pasosState, setPasosState] = useState<PasoTramite[]>([]);
  const [documentosRequeridosState, setDocumentosRequeridosState] = useState<
    DocumentoRequerido[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  useEffect(() => {
    if (!open) {
      setNodes([]);
      setEdges([]);
    }
  }, [open, setNodes, setEdges]);

  useEffect(() => {
    if (!open) return;
    if (flujo) {
      setPasosState(deepClone(flujo.pasos || []));
      setDocumentosRequeridosState(deepClone(flujo.documentosRequeridos || []));
    } else {
      setPasosState([]);
      setDocumentosRequeridosState([]);
    }
    setError(null);
  }, [open, flujo]);

  const [transicionDialog, setTransicionDialog] =
    useState<TransicionDialogData>({
      open: false,
      sourceId: null,
      targetId: null,
    });

  const [formTransicion, setFormTransicion] = useState({
    esAutomatico: false,
    descripcion: "",
    condicionDocumentos: {
      operador: "AND" as "AND" | "OR",
      documentos: [] as Array<{
        documentoId: number;
        estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
      }>,
    },
  });

  // Convertir pasos a nodos de React Flow
  useEffect(() => {
    const pasosOrdenados = [...pasosState].sort(
      (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
    );

    const newNodes: Node[] = pasosOrdenados.map((paso, index) => ({
      id: paso.id?.toString() || "",
      type: "pasoNode",
      position: {
        x: (index % 3) * 300 + 100,
        y: Math.floor(index / 3) * 200 + 100,
      },
      data: {
        paso,
        onEdit: onEditarPaso,
      },
    }));

    setNodes(newNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasosState]);

  // Convertir transiciones a edges de React Flow
  useEffect(() => {
    const newEdges: Edge[] = [];

    pasosState.forEach((paso) => {
      paso.transicionesOrigen?.forEach((transicion) => {
        const id = `${paso.id?.toString() || ""}-${transicion.pasoDestino.id?.toString() || ""}`;
        newEdges.push({
          id: `e-${id}`,
          source: paso.id?.toString() || "",
          target: transicion.pasoDestino.id?.toString() || "",
          type: transicion.esAutomatico ? "default" : "step",
          animated: transicion.esAutomatico,
          label:
            transicion.descripcion ||
            (transicion.esAutomatico ? "Auto" : "Manual"),
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: transicion.esAutomatico ? "#10b981" : "#3b82f6",
          },
          style: {
            strokeWidth: 2,
            stroke: transicion.esAutomatico ? "#10b981" : "#3b82f6",
          },
          data: {
            transicion,
          },
        });
      });
    });

    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasosState]);

  // Manejar nuevas conexiones
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceId = Number(connection.source);
      const targetId = Number(connection.target);

      // Verificar si ya existe una transición entre estos pasos
      const pasoOrigen = pasosState.find((p) => p.id === sourceId);
      const transicionExistente = pasoOrigen?.transicionesOrigen?.find(
        (t) => t.pasoDestino?.id === targetId,
      );

      if (transicionExistente) {
        // Editar transición existente
        setTransicionDialog({
          open: true,
          sourceId,
          targetId,
          transicionExistente,
        });
        setFormTransicion({
          esAutomatico: transicionExistente.esAutomatico,
          descripcion: transicionExistente.descripcion || "",
          condicionDocumentos: transicionExistente.condicionDocumentos || {
            operador: "AND",
            documentos: [],
          },
        });
      } else {
        // Nueva transición
        setTransicionDialog({
          open: true,
          sourceId,
          targetId,
        });
        setFormTransicion({
          esAutomatico: false,
          descripcion: "",
          condicionDocumentos: {
            operador: "AND",
            documentos: [],
          },
        });
      }
    },
    [pasosState],
  );

  const handleToggleDocumentoCondicion = (documentoId: number) => {
    const existe = formTransicion.condicionDocumentos.documentos.find(
      (d) => d.documentoId === documentoId,
    );

    if (existe) {
      // Remover documento
      setFormTransicion((prev) => ({
        ...prev,
        condicionDocumentos: {
          ...prev.condicionDocumentos,
          documentos: prev.condicionDocumentos.documentos.filter(
            (d) => d.documentoId !== documentoId,
          ),
        },
      }));
    } else {
      // Agregar documento con estado por defecto APROBADO
      setFormTransicion((prev) => ({
        ...prev,
        condicionDocumentos: {
          ...prev.condicionDocumentos,
          documentos: [
            ...prev.condicionDocumentos.documentos,
            { documentoId, estado: "APROBADO" as const },
          ],
        },
      }));
    }
  };

  const handleCambiarEstadoDocumento = (
    documentoId: number,
    estado: "PENDIENTE" | "APROBADO" | "RECHAZADO",
  ) => {
    setFormTransicion((prev) => ({
      ...prev,
      condicionDocumentos: {
        ...prev.condicionDocumentos,
        documentos: prev.condicionDocumentos.documentos.map((d) =>
          d.documentoId === documentoId ? { ...d, estado } : d,
        ),
      },
    }));
  };

  const handleGuardarTransicion = () => {
    if (!transicionDialog.sourceId || !transicionDialog.targetId) return;

    const pasoOrigen = pasosState.find(
      (p) => p.id === transicionDialog.sourceId,
    );
    const pasoDestino = pasosState.find(
      (p) => p.id === transicionDialog.targetId,
    );
    if (!pasoOrigen || !pasoDestino) return;

    // Crear copia del array de pasos para forzar re-render
    const nuevosPasos = pasosState.map((paso) => {
      if (paso.id === pasoOrigen.id) {
        // Clonar el paso origen con sus transiciones
        const transicionesOrigen = paso.transicionesOrigen || [];

        if (transicionDialog.transicionExistente) {
          // Actualizar transición existente
          const index = transicionesOrigen.findIndex(
            (t) => t.id === transicionDialog.transicionExistente?.id,
          );
          if (index !== -1) {
            return {
              ...paso,
              transicionesOrigen: transicionesOrigen.map((t, i) =>
                i === index
                  ? {
                      ...t,
                      esAutomatico: formTransicion.esAutomatico,
                      descripcion: formTransicion.descripcion,
                      condicionDocumentos: formTransicion.esAutomatico
                        ? formTransicion.condicionDocumentos
                        : undefined,
                    }
                  : t,
              ),
            };
          }
        } else {
          // Crear nueva transición
          const nuevaTransicion: ReglaTransicion = {
            id: undefined,
            pasoOrigen,
            pasoDestino,
            esAutomatico: formTransicion.esAutomatico,
            descripcion: formTransicion.descripcion,
            condicionDocumentos: formTransicion.esAutomatico
              ? formTransicion.condicionDocumentos
              : undefined,
          };

          return {
            ...paso,
            transicionesOrigen: [...transicionesOrigen, nuevaTransicion],
          };
        }
      } else if (
        paso.id === pasoDestino.id &&
        !transicionDialog.transicionExistente
      ) {
        // Agregar a transicionesDestino del paso destino solo si es nueva
        const nuevaTransicion: ReglaTransicion = {
          id: undefined,
          pasoOrigen,
          pasoDestino,
          esAutomatico: formTransicion.esAutomatico,
          descripcion: formTransicion.descripcion,
          condicionDocumentos: formTransicion.esAutomatico
            ? formTransicion.condicionDocumentos
            : undefined,
        };

        return {
          ...paso,
          transicionesDestino: [
            ...(paso.transicionesDestino || []),
            nuevaTransicion,
          ],
        };
      }
      return paso;
    });

    // Notificar cambios con el nuevo array
    setPasosState(nuevosPasos);

    // Cerrar diálogo
    setTransicionDialog({ open: false, sourceId: null, targetId: null });
    setFormTransicion({
      esAutomatico: false,
      descripcion: "",
      condicionDocumentos: { operador: "AND", documentos: [] },
    });
  };

  const handleEliminarTransicion = () => {
    if (!transicionDialog.transicionExistente || !transicionDialog.sourceId)
      return;

    if (!confirm("¿Está seguro que desea eliminar esta transición?")) return;

    // Crear copia del array de pasos sin la transición eliminada
    const nuevosPasos = pasosState.map((paso) => {
      if (paso.id === transicionDialog.sourceId) {
        return {
          ...paso,
          transicionesOrigen:
            paso.transicionesOrigen?.filter(
              (t) => t.id !== transicionDialog.transicionExistente?.id,
            ) || [],
        };
      }
      return paso;
    });

    setPasosState(nuevosPasos);

    // Cerrar diálogo
    setTransicionDialog({ open: false, sourceId: null, targetId: null });
    setFormTransicion({
      esAutomatico: false,
      descripcion: "",
      condicionDocumentos: { operador: "AND", documentos: [] },
    });
  };

  const handleGuardarFlujo = async () => {
    if (!flujo?.id) return;
    const flujoPayload: FlujoDto = {
      id: flujo.id,
      nombre: flujo.nombre,
      descripcion: flujo.descripcion,
      fuerza: { id: flujo.fuerza.id },
      tipoPrestamo: flujo.tipoPrestamo,
      activo: flujo.activo,
      pasos: pasosState,
      documentosRequeridos: documentosRequeridosState,
    };

    try {
      setLoading(true);
      setError(null);
      await flujosService.update(flujo.id, flujoPayload);
      onFlujoActualizado?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el flujo",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (edge.data?.transicion) {
        const transicion = edge.data.transicion as ReglaTransicion;
        setTransicionDialog({
          open: true,
          sourceId: transicion.pasoOrigen?.orden || null,
          targetId: transicion.pasoDestino?.orden || null,
          transicionExistente: transicion,
        });
        setFormTransicion({
          esAutomatico: transicion.esAutomatico,
          descripcion: transicion.descripcion || "",
          condicionDocumentos: transicion.condicionDocumentos || {
            operador: "AND",
            documentos: [],
          },
        });
      }
    },
    [],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Visualizador de pasos</DialogTitle>
      <Box sx={{ height: "600px", width: "100%", position: "relative" }}>
        {/* Información */}
        <Paper
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 4,
            p: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {pasosState.length} pasos configurados
          </Typography>
        </Paper>

        {/* Canvas de React Flow */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={1}
            zoomable
            pannable
            style={{
              backgroundColor: "#f5f5f5",
            }}
          />
        </ReactFlow>

        {/* Diálogo de configuración de transición */}
        <Dialog
          open={transicionDialog.open}
          onClose={() =>
            setTransicionDialog({ open: false, sourceId: null, targetId: null })
          }
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SettingsIcon />
              Configurar Transición
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                label="Descripción"
                value={formTransicion.descripcion}
                onChange={(e) =>
                  setFormTransicion((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                fullWidth
                multiline
                rows={3}
                placeholder="Ej: Transición al aprobar documentos"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formTransicion.esAutomatico}
                    onChange={(e) =>
                      setFormTransicion((prev) => ({
                        ...prev,
                        esAutomatico: e.target.checked,
                      }))
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Transición Automática
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      La transición se ejecutará automáticamente cuando se
                      cumplan las condiciones
                    </Typography>
                  </Box>
                }
              />

              {formTransicion.esAutomatico && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Condiciones de Documentos
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    paragraph
                  >
                    La transición se ejecutará automáticamente cuando se cumplan
                    las condiciones seleccionadas
                  </Typography>

                  {/* Operador AND/OR */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Operador Lógico</InputLabel>
                    <Select
                      value={formTransicion.condicionDocumentos.operador}
                      onChange={(e) =>
                        setFormTransicion((prev) => ({
                          ...prev,
                          condicionDocumentos: {
                            ...prev.condicionDocumentos,
                            operador: e.target.value as "AND" | "OR",
                          },
                        }))
                      }
                      label="Operador Lógico"
                    >
                      <MenuItem value="AND">
                        AND (Todos los documentos deben cumplir)
                      </MenuItem>
                      <MenuItem value="OR">
                        OR (Al menos uno debe cumplir)
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* Lista de documentos requeridos */}
                  {documentosRequeridosState.length === 0 ? (
                    <Paper sx={{ p: 2, backgroundColor: "warning.light" }}>
                      <Typography variant="caption">
                        ⚠️ No hay documentos requeridos configurados en este
                        flujo. Agregue documentos en el tab
                        &quot;Documentos&quot; para poder configurar
                        condiciones.
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{ maxHeight: 300, overflow: "auto" }}
                    >
                      <List dense>
                        {documentosRequeridosState.map((docReq) => {
                          const documentoSeleccionado =
                            formTransicion.condicionDocumentos.documentos.find(
                              (d) => d.documentoId === docReq.documento.id,
                            );

                          return (
                            <ListItem
                              key={docReq.documento.id}
                              sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                "&:last-child": { borderBottom: 0 },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                  gap: 2,
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!!documentoSeleccionado}
                                      onChange={() =>
                                        docReq.documento.id &&
                                        handleToggleDocumentoCondicion(
                                          docReq.documento.id,
                                        )
                                      }
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2">
                                        {docReq.documento.nombre}
                                      </Typography>
                                      {docReq.documento.descripcion && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {docReq.documento.descripcion}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                  sx={{ flex: 1 }}
                                />
                                {documentoSeleccionado && (
                                  <FormControl
                                    size="small"
                                    sx={{ minWidth: 130 }}
                                  >
                                    <Select
                                      value={documentoSeleccionado.estado}
                                      onChange={(e) =>
                                        docReq.documento.id &&
                                        handleCambiarEstadoDocumento(
                                          docReq.documento.id,
                                          e.target.value as
                                            | "PENDIENTE"
                                            | "APROBADO"
                                            | "RECHAZADO",
                                        )
                                      }
                                      size="small"
                                    >
                                      <MenuItem value="PENDIENTE">
                                        <Chip
                                          label="Pendiente"
                                          size="small"
                                          color="warning"
                                          sx={{ fontSize: "0.7rem" }}
                                        />
                                      </MenuItem>
                                      <MenuItem value="APROBADO">
                                        <Chip
                                          label="Aprobado"
                                          size="small"
                                          color="success"
                                          sx={{ fontSize: "0.7rem" }}
                                        />
                                      </MenuItem>
                                      <MenuItem value="RECHAZADO">
                                        <Chip
                                          label="Rechazado"
                                          size="small"
                                          color="error"
                                          sx={{ fontSize: "0.7rem" }}
                                        />
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                )}
                              </Box>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Paper>
                  )}

                  {/* Resumen de condiciones */}
                  {formTransicion.condicionDocumentos.documentos.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        color="primary"
                        fontWeight="bold"
                      >
                        Resumen:
                      </Typography>
                      <Typography variant="caption" display="block">
                        La transición se ejecutará cuando{" "}
                        {formTransicion.condicionDocumentos.operador === "AND"
                          ? "TODOS"
                          : "AL MENOS UNO"}{" "}
                        de los siguientes documentos cumplan:
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {formTransicion.condicionDocumentos.documentos.map(
                          (dc) => {
                            const doc = documentosRequeridosState.find(
                              (dr) => dr.documento.id === dc.documentoId,
                            );
                            return (
                              <Chip
                                key={dc.documentoId}
                                label={`${doc?.documento.nombre}: ${dc.estado}`}
                                size="small"
                                color={
                                  dc.estado === "APROBADO"
                                    ? "success"
                                    : dc.estado === "RECHAZADO"
                                      ? "error"
                                      : "warning"
                                }
                                variant="outlined"
                              />
                            );
                          },
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            {/* Botón eliminar a la izquierda si es edición */}
            {transicionDialog.transicionExistente && (
              <Box sx={{ flex: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleEliminarTransicion}
                >
                  Eliminar Transición
                </Button>
              </Box>
            )}
            <Button
              onClick={() =>
                setTransicionDialog({
                  open: false,
                  sourceId: null,
                  targetId: null,
                })
              }
            >
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleGuardarTransicion}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <DialogActions>
        {error && (
          <Typography color="error" variant="caption" sx={{ flex: 1 }}>
            {error}
          </Typography>
        )}
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardarFlujo}
          disabled={loading || !flujo?.id}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlujoVisualEditor;
