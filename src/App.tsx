import { BrowserRouter } from "react-router-dom";

import { RouteScrollManager } from "./components/shared/RouteScrollManager";
import { AppRoutes } from "./router/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <RouteScrollManager />
      <AppRoutes />
    </BrowserRouter>
  );
}
