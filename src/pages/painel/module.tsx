import { ArrowUpRight, Construction, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import type { PanelNavItem } from "../../config/painel/navigation";

export default function ModulePage({
  item,
}: {
  item: PanelNavItem;
}) {
  const Icon = item.icon;

  return (
    <div className="space-y-8">
      <PanelPageHeader
        breadcrumbs={[
          { label: "Painel", to: "/painel/dashboard" },
          { label: item.label },
        ]}
        description={item.description}
        title={item.title}
      />

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel-card rounded-[2rem] border p-8 md:p-10">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-primary">
            404 interno
          </p>
          <h2 className="max-w-3xl text-4xl font-black tracking-tight text-on-surface md:text-5xl">
            O modulo {item.title} ainda nao foi implementado.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Mantivemos a navegacao pronta para a arquitetura do painel, mas essa area ainda vai ser
            construida nas proximas etapas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              to="/painel/dashboard"
            >
              Voltar ao dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              to="/painel/usuarios"
            >
              Abrir usuarios
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <aside className="grid gap-5">
          <div className="panel-card rounded-[2rem] border p-8">
            <div className="panel-card-muted mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-primary">
              <SearchX className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
              Estado atual
            </p>
            <p className="mt-4 text-lg font-semibold text-on-surface">Rota existente, modulo em aberto</p>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Isso garante consistencia no menu e permite evoluir o painel sem refazer navegacao depois.
            </p>
          </div>

          <div className="panel-card rounded-[2rem] border p-8">
            <div className="panel-card-muted mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-primary">
              <Construction className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
              Proxima etapa
            </p>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Quando voce quiser, eu transformo esse modulo em tabelas, cards, filtros ou fluxos reais.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
