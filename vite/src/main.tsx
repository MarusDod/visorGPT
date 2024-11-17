import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import VisorQueryClientProvider from "./services/query-client";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";

createRoot(document.getElementById("root")!).render(
  <VisorQueryClientProvider>
    <SnackbarProvider
      autoHideDuration={4000}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </VisorQueryClientProvider>
);
