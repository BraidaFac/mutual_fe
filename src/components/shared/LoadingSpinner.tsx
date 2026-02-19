"use client";

import { Box, CircularProgress, Fade } from "@mui/material";

export default function LoadingSpinner() {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: "fixed", // clave
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          zIndex: 1300, // encima de todo (importante en MUI)
        }}
      >
        <CircularProgress size={50} thickness={4} />
      </Box>
    </Fade>
  );
}
