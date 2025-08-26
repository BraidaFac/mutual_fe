import { SideBar } from "@/components/Menu/SideMenu";
import Box from "@mui/material/Box";

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
    </Box>
  );
}
