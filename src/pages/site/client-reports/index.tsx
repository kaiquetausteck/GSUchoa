import { ArrowRight, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { usePanelAuth } from "../../../context/painel/PanelAuthContext";
import {
  listPublicClientReportsByClient,
  type PanelClientReportRecord,
} from "../../../services/painel/client-reports-api";

function formatDate(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(parsedDate);
}

function formatPeriod(report: PanelClientReportRecord) {
  if (!report.periodStart && !report.periodEnd) {
    return "Sem período definido";
  }

  return `${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`;
}

export default function PublicClientReportsPage() {
  const { clientSlug } = useParams();
  const { token } = usePanelAuth();
  const [reports, setReports] = useState<PanelClientReportRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const clientName = useMemo(() => reports[0]?.client.name ?? "Cliente", [reports]);

  useEffect(() => {
    if (!clientSlug) {
      setErrorMessage("Cliente não informado.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void listPublicClientReportsByClient(clientSlug, token)
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setReports(items);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Não foi possível carregar os relatórios.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientSlug, token]);

  return (
    <main className="min-h-screen bg-white px-6 py-14 text-neutral-950 md:px-8">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Relatórios</p>
        <h1 className="mt-3 text-3xl font-black text-neutral-950 md:text-5xl">{clientName}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-500">
          Acompanhe os relatórios compartilhados pela GSUCHOA para este cliente.
        </p>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-28 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50" key={index} />
              ))}
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-50 p-6 text-sm font-semibold text-red-600">
              {errorMessage}
            </div>
          ) : reports.length ? (
            <div className="grid gap-3">
              {reports.map((report) => (
                <Link
                  className="group rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  key={report.id}
                  to={`/relatorios/${report.client.slug}/${report.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-neutral-950">{report.title}</p>
                      <p className="mt-2 text-sm text-neutral-600">{formatPeriod(report)}</p>
                      <p className="mt-2 text-xs text-neutral-400">Atualizado em {formatDate(report.updatedAt)}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center">
              <FileText className="mx-auto h-10 w-10 text-blue-600" />
              <p className="mt-4 text-sm font-semibold text-neutral-800">Nenhum relatório compartilhado</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
