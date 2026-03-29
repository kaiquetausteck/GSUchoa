import { Navigate, Route, Routes } from "react-router-dom";

import { PanelLayout } from "../components/painel/PanelLayout";
import { PANEL_NAV_ITEMS } from "../config/painel/navigation";
import { SITE_SECTION_ROUTES } from "../hooks/site/useSectionAnchors";
import DashboardPage from "../pages/painel";
import ContactsPage from "../pages/painel/contacts";
import ClientsPage from "../pages/painel/clients";
import LoginPage from "../pages/painel/login";
import ModulePage from "../pages/painel/module";
import PortfolioPage from "../pages/painel/portfolio";
import TestimonialsPage from "../pages/painel/testimonials";
import UsersPage from "../pages/painel/users";
import ClientDetailsPage from "../pages/site/clients/details";
import ClientsPagePublic from "../pages/site/clients";
import CaseDetailsPage from "../pages/site/cases/details";
import CasesPage from "../pages/site/cases";
import SitePage from "../pages/site";
import TestimonialDetailsPage from "../pages/site/testimonials/details";
import TestimonialsPagePublic from "../pages/site/testimonials";
import { RequirePanelAuth } from "./guards/RequirePanelAuth";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SitePage />} />
      <Route path="/clientes" element={<ClientsPagePublic />} />
      <Route path="/clientes/:slug" element={<ClientDetailsPage />} />
      <Route path="/cases" element={<CasesPage />} />
      <Route path="/cases/:slug" element={<CaseDetailsPage />} />
      <Route path="/depoimentos" element={<TestimonialsPagePublic />} />
      <Route path="/depoimentos/:id" element={<TestimonialDetailsPage />} />
      {SITE_SECTION_ROUTES.filter((route) => route.legacyPath).map((route) => (
        <Route
          key={route.id}
          element={<Navigate replace to={route.href} />}
          path={route.legacyPath!}
        />
      ))}

      <Route path="/painel">
        <Route element={<LoginPage />} path="login" />
        <Route element={<RequirePanelAuth />}>
          <Route element={<PanelLayout />}>
            <Route index element={<Navigate replace to="dashboard" />} />
            <Route element={<DashboardPage />} path="dashboard" />
            <Route element={<UsersPage />} path="usuarios" />
            <Route element={<ContactsPage />} path="contatos" />
            <Route element={<ContactsPage />} path="contatos/funil" />
            <Route element={<ClientsPage />} path="clientes" />
            <Route element={<PortfolioPage />} path="portfolio" />
            <Route element={<TestimonialsPage />} path="depoimentos" />
            {PANEL_NAV_ITEMS.filter((item) => !item.implemented).map((item) => (
              <Route
                key={item.key}
                element={<ModulePage item={item} />}
                path={item.segment}
              />
            ))}
            <Route
              element={
                <ModulePage
                  item={{
                    key: "painel-not-found",
                    label: "Não encontrado",
                    segment: "",
                    to: "",
                    icon: PANEL_NAV_ITEMS[0].icon,
                    title: "Página não encontrada",
                    description: "Essa rota interna do painel não existe.",
                  }}
                />
              }
              path="*"
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
