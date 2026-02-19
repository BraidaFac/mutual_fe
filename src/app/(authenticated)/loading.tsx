/**
 * Loading UI para páginas autenticadas
 */

import { Box, CircularProgress, Fade } from "@mui/material";

export default function Loading() {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <CircularProgress size={50} thickness={4} />
      </Box>
    </Fade>
  );
}
