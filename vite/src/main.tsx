import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import VisorQueryClientProvider from "./services/query-client";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { SidebarProvider } from "./components/sidebar/sidebar-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <VisorQueryClientProvider>
    <SnackbarProvider
      autoHideDuration={2000}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    />
    <BrowserRouter>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </BrowserRouter>
  </VisorQueryClientProvider>
);
