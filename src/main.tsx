import { createRoot } from "react-dom/client";

import { PanelAuthProvider } from "./context/painel/PanelAuthContext.tsx";
import { ThemeProvider } from "./context/shared/ThemeContext.tsx";
import { ToastProvider } from "./context/shared/ToastContext.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ToastProvider>
      <PanelAuthProvider>
        <App />
      </PanelAuthProvider>
    </ToastProvider>
  </ThemeProvider>,
);
