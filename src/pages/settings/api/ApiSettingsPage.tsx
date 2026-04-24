import {
  BriefcaseBusiness,
  Globe,
  Link2,
  Sparkles,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { PanelPageHeader } from "../../../components/painel/PanelPageHeader";
import { Seo } from "../../../components/shared/Seo";
import { AppTabs } from "../../../components/shared/ui/AppTabs";
import { GoogleTab } from "./tabs/GoogleTab";
import { LinkedInTab } from "./tabs/LinkedInTab";
import { MetaTab } from "./tabs/MetaTab";

const API_SETTINGS_TAB_KEYS = ["meta", "google", "linkedin"] as const;

type ApiSettingsTabKey = (typeof API_SETTINGS_TAB_KEYS)[number];

function resolveApiSettingsTab(value: string | null): ApiSettingsTabKey {
  if (value && API_SETTINGS_TAB_KEYS.includes(value as ApiSettingsTabKey)) {
    return value as ApiSettingsTabKey;
  }

  return "meta";
}

function buildApiSettingsSearchParams(nextTab: ApiSettingsTabKey) {
  const searchParams = new URLSearchParams();
  searchParams.set("tab", nextTab);
  return searchParams;
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

export default function ApiSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveApiSettingsTab(searchParams.get("tab"));
  const callbackConnected = searchParams.get("connected") === "true";
  const callbackError = searchParams.get("error")?.trim() || null;

  const tabs = useMemo(
    () => [
      {
        key: "meta",
        label: "Meta",
        icon: <Link2 className="h-4 w-4" />,
      },
      {
        key: "google",
        label: "Google",
        icon: <Globe className="h-4 w-4" />,
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
      },
    ] satisfies Array<{ key: ApiSettingsTabKey; label: string; icon: ReactNode }>,
    [],
  );

  return (
    <>
      <Seo
        description="Gerencie as integrações externas e o status das conexões de API do painel."
        noindex
        path="/configuracoes/api"
        structuredData={null}
        title="Configurações de API"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <AppTabs
              activeKey={activeTab}
              items={tabs}
              onChange={(nextTab) => {
                setSearchParams(buildApiSettingsSearchParams(resolveApiSettingsTab(nextTab)), {
                  replace: true,
                });
              }}
            />
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Configurações de API" },
          ]}
          description="Acompanhe o estado das integrações externas da operação. Meta e Google já seguem o fluxo OAuth completo conectado ao backend real."
          title="Configurações de API"
        />

        {activeTab === "meta" ? (
          <MetaTab
            callbackConnected={callbackConnected}
            callbackError={callbackError}
          />
        ) : null}

        {activeTab === "google" ? (
          <GoogleTab
            callbackConnected={callbackConnected}
            callbackError={callbackError}
          />
        ) : null}

        {activeTab === "linkedin" ? (
          <LinkedInTab
            callbackConnected={callbackConnected}
            callbackError={callbackError}
          />
        ) : null}
      </div>
    </>
  );
}
