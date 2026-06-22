import { ArrowLeft, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ClientReportPublicRenderer } from "../../../components/painel/ClientReportPublicRenderer";
import { usePanelAuth } from "../../../context/painel/PanelAuthContext";
import {
  getPublicClientReportById,
  type PublicClientReportRecord,
} from "../../../services/painel/client-reports-api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getReportTheme(report: PublicClientReportRecord | null) {
  if (!report || !isRecord(report.layout)) {
    return "dark";
  }

  const page = isRecord(report.layout.page) ? report.layout.page : {};
  return page.theme === "light" ? "light" : "dark";
}

function getReportColumns(report: PublicClientReportRecord | null) {
  if (!report || !isRecord(report.layout)) {
    return 3;
  }

  const page = isRecord(report.layout.page) ? report.layout.page : {};

  if (page.columns === 5 || page.columns === "5") {
    return 5;
  }

  return page.columns === 4 || page.columns === "4" ? 4 : 3;
}

function getReportPageMaxWidth(columns: number) {
  if (columns === 3) {
    return "64rem";
  }

  if (columns === 4) {
    return "56rem";
  }

  return "48rem";
}

export default function PublicClientReportDetailsPage() {
  const { clientSlug, reportId } = useParams();
  const { token } = usePanelAuth();
  const [report, setReport] = useState<PublicClientReportRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const reportTheme = getReportTheme(report);
  const isDark = reportTheme === "dark";
  const pageMaxWidth = getReportPageMaxWidth(getReportColumns(report));

  useEffect(() => {
    if (!clientSlug || !reportId) {
      setErrorMessage("Relatório não informado.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void getPublicClientReportById(clientSlug, reportId, token)
      .then((nextReport) => {
        if (!isMounted) {
          return;
        }

        setReport(nextReport);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Não foi possível carregar o relatório.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientSlug, reportId, token]);

  function handleExportPdf() {
    window.print();
  }

  return (
    <main className={isDark ? "min-h-screen bg-neutral-950 px-4 py-6 text-white print:bg-white print:px-0 print:py-0 md:px-8" : "min-h-screen bg-white px-4 py-6 text-neutral-950 print:px-0 print:py-0 md:px-8"}>
      <div className="mx-auto max-w-6xl">
        <header
          className={`mx-auto mb-8 flex flex-col gap-3 border-b pb-4 print:hidden sm:flex-row sm:items-center sm:justify-between ${
            isDark ? "border-white/10" : "border-neutral-200"
          }`}
          style={{ maxWidth: pageMaxWidth }}
        >
          <Link
            className={
              isDark
                ? "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-300/35 hover:text-blue-200"
                : "inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-blue-300 hover:text-blue-700"
            }
            to={`/relatorios/${clientSlug ?? ""}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Todos os relatórios
          </Link>

          <button
            className={
              isDark
                ? "inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-500"
                : "inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-neutral-800"
            }
            onClick={handleExportPdf}
            type="button"
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </button>
        </header>

        {isLoading ? (
          <div className={isDark ? "h-[38rem] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/6" : "h-[38rem] animate-pulse rounded-[1.75rem] border border-neutral-200 bg-white"} />
        ) : errorMessage ? (
          <div className={isDark ? "rounded-2xl border border-red-500/25 bg-red-500/10 p-6 text-sm font-semibold text-red-200" : "rounded-2xl border border-red-500/20 bg-red-50 p-6 text-sm font-semibold text-red-600"}>
            {errorMessage}
          </div>
        ) : report ? (
          <ClientReportPublicRenderer report={report} />
        ) : null}
      </div>
    </main>
  );
}
