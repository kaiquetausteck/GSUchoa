import { BriefcaseBusiness, Globe, Link2, Sparkles } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { Seo } from "../../components/shared/Seo";
import { AppTabs } from "../../components/shared/ui/AppTabs";
import { GoogleTab } from "../settings/api/tabs/GoogleTab";
import { LinkedInTab } from "../settings/api/tabs/LinkedInTab";
import { MetaTab } from "../settings/api/tabs/MetaTab";

type IntegrationProvider = "google" | "linkedin" | "meta";

function resolveProviderFromPath(pathname: string): IntegrationProvider {
  if (pathname.startsWith("/painel/contas-integracao/google")) {
    return "google";
  }

  if (pathname.startsWith("/painel/contas-integracao/linkedin")) {
    return "linkedin";
  }

  return "meta";
}

function ComingSoonCard({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="panel-card rounded-[2rem] border p-6 md:p-8">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-on-surface">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>

        <span className="inline-flex rounded-full border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant">
          Em breve
        </span>
      </div>
    </section>
  );
}

export default function AccountsIntegrationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeProvider = resolveProviderFromPath(location.pathname);
  const callbackConnected = searchParams.get("connected") === "true";
  const callbackError = searchParams.get("error")?.trim() || null;

  const tabs = useMemo(
    () => [
      { key: "meta", label: "Meta", icon: <Link2 className="h-4 w-4" /> },
      { key: "google", label: "Google", icon: <Globe className="h-4 w-4" /> },
      {
        key: "linkedin",
        label: "LinkedIn",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
      },
    ] satisfies Array<{ key: IntegrationProvider; label: string; icon: ReactNode }>,
    [],
  );

  return (
    <>
      <Seo
        description="Status técnico das contas conectadas e integrações externas do painel."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Integrações"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <AppTabs
              activeKey={activeProvider}
              items={tabs}
              onChange={(nextKey) => navigate(`/painel/contas-integracao/${nextKey}`)}
            />
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Contas e integrações" },
          ]}
          description="Gerencie o status das integrações externas e mantenha as conexões operacionais da agência em dia."
          title="Integrações"
        />

        <div className="space-y-5">
          {activeProvider === "meta" ? (
            <MetaTab
              callbackConnected={callbackConnected}
              callbackError={callbackError}
            />
          ) : null}

          {activeProvider === "google" ? (
            <GoogleTab
              callbackConnected={callbackConnected}
              callbackError={callbackError}
            />
          ) : null}

          {activeProvider === "linkedin" ? (
            <LinkedInTab
              callbackConnected={callbackConnected}
              callbackError={callbackError}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
