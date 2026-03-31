import { Navigate, Route, Routes } from "react-router-dom";

import { PanelLayout } from "../components/painel/PanelLayout";
import { PANEL_NAV_ITEMS } from "../config/painel/navigation";
import { SITE_SECTION_ROUTES } from "../hooks/site/useSectionAnchors";
import MetaCallbackPage from "../pages/auth/MetaCallbackPage";
import DashboardPage from "../pages/painel";
import AccountsIntegrationsPage from "../pages/painel/accounts-integrations";
import ContactsPage from "../pages/painel/contacts";
import ClientsPage from "../pages/painel/clients";
import LoginPage from "../pages/painel/login";
import ModulePage from "../pages/painel/module";
import PaidMediaMetaAccountDashboardPage from "../pages/painel/paid-media-meta-client-dashboard";
import PaidMediaMetaPage from "../pages/painel/paid-media-meta";
import PortfolioPage from "../pages/painel/portfolio";
import TestimonialsPage from "../pages/painel/testimonials";
import UsersPage from "../pages/painel/users";
import ClientDetailsPage from "../pages/site/clients/details";
import ClientsPagePublic from "../pages/site/clients";
import CaseDetailsPage from "../pages/site/cases/details";
import CasesPage from "../pages/site/cases";
import SitePage from "../pages/site";
import PrivacyPolicyPage from "../pages/site/privacy-policy";
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
      <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
      <Route path="/privacy" element={<Navigate replace to="/politica-de-privacidade" />} />
      <Route path="/privacy-policy" element={<Navigate replace to="/politica-de-privacidade" />} />
      <Route path="/exclusao-de-dados" element={<Navigate replace to="/politica-de-privacidade#exclusao-de-dados" />} />
      <Route path="/data-deletion" element={<Navigate replace to="/politica-de-privacidade#exclusao-de-dados" />} />
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
            <Route element={<Navigate replace to="/painel/contas-integracao/meta" />} path="configuracoes/api" />
            <Route element={<Navigate replace to="/painel/trafego-pago/meta" />} path="trafego-pago" />
            <Route element={<PaidMediaMetaPage />} path="trafego-pago/meta" />
            <Route element={<PaidMediaMetaAccountDashboardPage />} path="trafego-pago/meta/:adAccountId/dashboard" />
            <Route element={<Navigate replace to="/painel/contas-integracao/meta" />} path="contas-integracao" />
            <Route element={<AccountsIntegrationsPage />} path="contas-integracao/meta" />
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

      <Route element={<RequirePanelAuth />}>
        <Route path="auth/meta/callback" element={<MetaCallbackPage />} />
        <Route path="configuracoes/api" element={<Navigate replace to="/painel/contas-integracao/meta" />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
