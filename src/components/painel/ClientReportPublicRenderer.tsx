import {
  BarChart3,
  Bookmark,
  CalendarDays,
  DollarSign,
  Eye,
  Heart,
  ImagePlus,
  Link as LinkIcon,
  MessageCircle,
  MessageSquare,
  MousePointerClick,
  Percent,
  Phone,
  Share2,
  Target,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { PanelMetaObjectiveFunnel, type PanelMetaObjectiveFunnelStage } from "./PanelMetaObjectiveFunnel";
import type { PublicClientReportRecord } from "../../services/painel/client-reports-api";

type ReportPageTheme = "light" | "dark";
type ReportPageColumns = 3 | 4 | 5;
type ReportImageFormat = "free" | "landscape" | "portrait" | "square" | "story";

type JsonRecord = Record<string, unknown>;

const IMAGE_FORMAT_OPTIONS: Array<{ format: ReportImageFormat; ratio: string | null }> = [
  { format: "free", ratio: null },
  { format: "story", ratio: "9 / 16" },
  { format: "landscape", ratio: "16 / 9" },
  { format: "square", ratio: "1 / 1" },
  { format: "portrait", ratio: "4 / 5" },
];

const METRIC_ICON_OPTIONS: Array<{ Icon: LucideIcon; key: string }> = [
  { Icon: BarChart3, key: "bar-chart" },
  { Icon: DollarSign, key: "money" },
  { Icon: UsersRound, key: "users" },
  { Icon: Eye, key: "eye" },
  { Icon: MousePointerClick, key: "click" },
  { Icon: Percent, key: "percent" },
  { Icon: Target, key: "target" },
  { Icon: TrendingUp, key: "trend" },
  { Icon: MessageCircle, key: "message" },
  { Icon: MessageSquare, key: "comment" },
  { Icon: Heart, key: "heart" },
  { Icon: Share2, key: "share" },
  { Icon: Bookmark, key: "bookmark" },
  { Icon: CalendarDays, key: "calendar" },
  { Icon: Phone, key: "phone" },
  { Icon: LinkIcon, key: "link" },
];

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number, options: { max?: number; min?: number } = {}) {
  const numberValue = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  const resolvedValue = Number.isFinite(numberValue) ? numberValue : fallback;
  return Math.min(options.max ?? resolvedValue, Math.max(options.min ?? resolvedValue, resolvedValue));
}

function asColumns(value: unknown): ReportPageColumns {
  if (value === 5 || value === "5") {
    return 5;
  }

  return value === 4 || value === "4" ? 4 : 3;
}

function asTheme(value: unknown): ReportPageTheme {
  return value === "dark" ? "dark" : "light";
}

function asImageFormat(value: unknown): ReportImageFormat {
  return value === "landscape" ||
    value === "portrait" ||
    value === "square" ||
    value === "story" ||
    value === "free"
    ? value
    : "free";
}

function getImageFormatOption(format: ReportImageFormat) {
  return IMAGE_FORMAT_OPTIONS.find((option) => option.format === format) ?? IMAGE_FORMAT_OPTIONS[0]!;
}

function getCenteredImageItemStyle(span: number): CSSProperties {
  const normalizedSpan = Math.max(1, span);
  const availableWidth = `calc((100% - ${(normalizedSpan - 1) * 0.75}rem) / ${normalizedSpan})`;

  return {
    flex: `0 1 ${availableWidth}`,
    maxWidth: availableWidth,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function bodyToHtml(value: string) {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    return value;
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function formatPeriod(report: PublicClientReportRecord) {
  if (!report.periodStart && !report.periodEnd) {
    return "Sem período definido";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
  const start = report.periodStart ? formatter.format(new Date(report.periodStart)) : "Início aberto";
  const end = report.periodEnd ? formatter.format(new Date(report.periodEnd)) : "Fim aberto";
  return `${start} - ${end}`;
}

function getPageMaxWidth(columns: ReportPageColumns) {
  if (columns === 3) {
    return "64rem";
  }

  if (columns === 4) {
    return "56rem";
  }

  return "48rem";
}

function getSpan(block: JsonRecord, columns: ReportPageColumns) {
  if (block.type === "funnel" || block.type === "spacer") {
    return columns;
  }

  const span = typeof block.span === "number" ? block.span : Number.NaN;
  if (Number.isFinite(span)) {
    return Math.min(Math.max(1, Math.round(span)), columns);
  }

  if (block.width === "third") {
    return 1;
  }

  if (block.width === "half") {
    return Math.max(1, Math.ceil(columns / 2));
  }

  return columns;
}

function getMetricPairs(item: JsonRecord) {
  const metrics = Array.isArray(item.metrics) ? item.metrics : [];
  return metrics
    .filter(isRecord)
    .map((metric) => ({
      label: asString(metric.label),
      value: asString(metric.value),
    }))
    .filter((metric) => metric.label && metric.value);
}

function getImageMetricKey(metric: { label: string }, index: number) {
  return `${metric.label || "metric"}-${index}`;
}

function getImageMetricPairs(image: JsonRecord) {
  const metrics = Array.isArray(image.metrics) ? image.metrics.filter(isRecord) : [];
  const visibleMetricKeys = Array.isArray(image.visibleMetricKeys)
    ? new Set(image.visibleMetricKeys.map((item) => asString(item)).filter(Boolean))
    : null;
  const showMetrics = asBoolean(image.showMetrics, false);

  return metrics
    .map((metric, index) => ({
      key: getImageMetricKey({ label: asString(metric.label) }, index),
      label: asString(metric.label),
      value: asString(metric.value),
    }))
    .filter((metric) => metric.label && metric.value)
    .filter((metric) => {
      if (visibleMetricKeys) {
        return visibleMetricKeys.has(metric.key);
      }

      return showMetrics;
    });
}

function getImageMetricIcon(label: string): LucideIcon {
  const normalizedLabel = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedLabel.includes("coment")) {
    return MessageSquare;
  }

  if (normalizedLabel.includes("compart") || normalizedLabel.includes("share")) {
    return Share2;
  }

  if (normalizedLabel.includes("salv")) {
    return Bookmark;
  }

  if (normalizedLabel.includes("alcance") || normalizedLabel.includes("reach")) {
    return UsersRound;
  }

  if (normalizedLabel.includes("view") || normalizedLabel.includes("visual") || normalizedLabel.includes("impress")) {
    return Eye;
  }

  if (normalizedLabel.includes("clique") || normalizedLabel.includes("click")) {
    return MousePointerClick;
  }

  if (normalizedLabel.includes("engaj")) {
    return TrendingUp;
  }

  return Heart;
}

function getMetricIconOption(iconKey: string) {
  return METRIC_ICON_OPTIONS.find((option) => option.key === iconKey) ?? METRIC_ICON_OPTIONS[0]!;
}

function ReportMetricIcon({ className, iconKey }: { className?: string; iconKey: string }) {
  const Icon = getMetricIconOption(iconKey).Icon;
  return <Icon className={className} strokeWidth={2.35} />;
}

function toFunnelStages(value: unknown): PanelMetaObjectiveFunnelStage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((stage) => ({
    color: asString(stage.color, "#2563eb"),
    helper: asString(stage.helper, "Etapa personalizada do relatório."),
    label: asString(stage.name, "Etapa"),
    rawValue: Number.parseFloat(asString(stage.value, "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
    value: asString(stage.value, "0"),
  }));
}

export function ClientReportPublicRenderer({ report }: { report: PublicClientReportRecord }) {
  const layout = isRecord(report.layout) ? report.layout : {};
  const page = isRecord(layout.page) ? layout.page : {};
  const header = isRecord(page.header) ? page.header : {};
  const columns = asColumns(page.columns);
  const theme = asTheme(page.theme);
  const blocks = Array.isArray(layout.blocks) ? layout.blocks.filter(isRecord) : [];
  const isDark = theme === "dark";

  return (
    <article className={isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"}>
      <div
        className="mx-auto min-h-screen w-full px-6 py-10 md:px-14 md:py-12"
        style={{ maxWidth: getPageMaxWidth(columns) }}
      >
        <header className={`border-b pb-8 ${isDark ? "border-white/15" : "border-neutral-200"}`}>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className={`text-xs font-bold uppercase ${isDark ? "text-white/55" : "text-neutral-500"}`}>
                {asString(header.title, "Relatório")}
              </p>
              <h1 className={`mt-2 text-3xl font-black ${isDark ? "text-white" : "text-neutral-950"}`}>
                {report.title}
              </h1>
              <p className={`mt-2 text-sm ${isDark ? "text-white/55" : "text-neutral-500"}`}>
                {asString(header.subtitle, report.client.name)}
              </p>
              <p className={`mt-1 text-xs ${isDark ? "text-white/40" : "text-neutral-400"}`}>
                {formatPeriod(report)}
              </p>
            </div>
            {asBoolean(header.showLogo, true) ? (
              <div className="flex shrink-0 items-center gap-3">
                <LogoIconAnimated animated={false} className="h-9 w-auto" decorative />
                <span className="text-sm font-black tracking-[0.18em]">{asString(header.brand, "GSUCHOA")}</span>
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-8 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {blocks.map((block, index) => {
            const span = getSpan(block, columns);
            const showFrame = asBoolean(block.showFrame, true);
            const type = asString(block.type);

            return (
              <section
                className={`rounded-2xl ${showFrame ? isDark ? "border border-white/12 bg-white/6 p-5" : "border border-neutral-200 bg-white p-5" : ""}`}
                key={asString(block.id, `block-${index}`)}
                style={{ gridColumn: `span ${span} / span ${span}` }}
              >
                {type === "text" ? (
                  <div>
                    <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-neutral-950"}`}>{asString(block.title, "Análise")}</h2>
                    <div
                      className={`report-rich-text-content mt-3 text-sm leading-6 ${isDark ? "text-white/75" : "text-neutral-700"}`}
                      dangerouslySetInnerHTML={{ __html: bodyToHtml(asString(block.body)) }}
                    />
                  </div>
                ) : null}

                {type === "metric" ? (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-bold uppercase ${isDark ? "text-white/55" : "text-neutral-500"}`}>{asString(block.label, "Indicador")}</p>
                        <p className={`mt-3 text-4xl font-black ${isDark ? "text-white" : "text-neutral-950"}`}>{asString(block.value, "0")}</p>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: asString(block.tone, "#2563eb") }}>
                        <ReportMetricIcon className="h-5 w-5" iconKey={asString(block.icon, "bar-chart")} />
                      </span>
                    </div>
                    {asString(block.helper) ? <p className={`mt-4 text-sm ${isDark ? "text-white/60" : "text-neutral-500"}`}>{asString(block.helper)}</p> : null}
                  </div>
                ) : null}

                {type === "image" ? (
                  <figure>
                    <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-neutral-950"}`}>{asString(block.title, "Imagem")}</h2>
                    <div
                      className={asBoolean(block.centerImages, false) ? "mt-4 flex flex-wrap justify-center gap-3" : "mt-4 grid gap-3"}
                      style={
                        asBoolean(block.centerImages, false)
                          ? undefined
                          : { gridTemplateColumns: `repeat(${Math.max(1, Math.min(span, Array.isArray(block.images) ? block.images.length : 1))}, minmax(0, 1fr))` }
                      }
                    >
                      {(Array.isArray(block.images) ? block.images.filter(isRecord) : []).map((image, imageIndex) => {
                        const visibleMetrics = getImageMetricPairs(image);
                        const imageFormat = getImageFormatOption(asImageFormat(block.format));

                        return (
                          <div
                            key={asString(image.id, `image-${imageIndex}`)}
                            style={asBoolean(block.centerImages, false) ? getCenteredImageItemStyle(span) : undefined}
                          >
                            <div
                              className={`overflow-hidden rounded-xl border ${isDark ? "border-white/12 bg-white/8" : "border-neutral-200 bg-neutral-50"}`}
                              style={imageFormat.ratio ? { aspectRatio: imageFormat.ratio } : undefined}
                            >
                              <img
                                alt={asString(image.caption, asString(block.title, "Imagem"))}
                                className={`h-full w-full object-cover ${imageFormat.ratio ? "" : "max-h-[24rem]"}`}
                                src={asString(image.src)}
                              />
                            </div>
                            {asString(image.caption) ? (
                              <figcaption className={`mt-2 text-sm font-bold italic ${isDark ? "text-white/65" : "text-neutral-700"}`}>{asString(image.caption)}</figcaption>
                            ) : null}
                            {visibleMetrics.length ? (
                              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                {visibleMetrics.slice(0, 6).map((metric, metricIndex) => {
                                  const MetricIcon = getImageMetricIcon(metric.label);

                                  return (
                                    <div
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] leading-none ${
                                        isDark
                                          ? "border-[#1877F2]/35 bg-[#1877F2]/12 text-white/75"
                                          : "border-[#1877F2]/25 bg-[#1877F2]/7 text-neutral-700"
                                      }`}
                                      key={`${metric.key}-${metricIndex}`}
                                    >
                                      <MetricIcon className="h-3 w-3 shrink-0 text-[#1877F2]" strokeWidth={2.35} />
                                      <span className={isDark ? "font-black text-white" : "font-black text-neutral-900"}>
                                        {metric.value}
                                      </span>
                                      <span className="font-medium">{metric.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </figure>
                ) : null}

                {type === "list" ? (
                  <div>
                    <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-neutral-950"}`}>{asString(block.title, "Lista")}</h2>
                    {block.mode === "image" ? (
                      <div className="mt-4 grid gap-3">
                        {(Array.isArray(block.items) ? block.items.filter(isRecord) : []).filter((item) => asBoolean(item.visible, true)).map((item, itemIndex) => {
                          const metrics = getMetricPairs(item);
                          const imageUrl = asString(item.imageUrl);
                          return (
                            <div className={`flex gap-3 rounded-xl border p-3 ${isDark ? "border-white/12 bg-white/6" : "border-neutral-200 bg-neutral-50"}`} key={asString(item.id, `item-${itemIndex}`)}>
                              {imageUrl ? (
                                <img alt={asString(item.title)} className="h-16 w-16 shrink-0 rounded-lg object-cover" src={imageUrl} />
                              ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                                  <ImagePlus className="h-5 w-5" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-neutral-950"}`}>{asString(item.title)}</p>
                                {asString(item.subtitle) ? <p className={`mt-1 text-xs ${isDark ? "text-white/55" : "text-neutral-500"}`}>{asString(item.subtitle)}</p> : null}
                                {metrics.length ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {metrics.slice(0, 4).map((metric) => (
                                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none ${isDark ? "border-blue-300/25 bg-blue-400/12 text-blue-50" : "border-blue-200 bg-blue-100/70 text-blue-700"}`} key={`${metric.label}-${metric.value}`}>
                                        {metric.label}: {metric.value}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <ul className="mt-4 w-full space-y-2">
                        {(Array.isArray(block.items) ? block.items.filter(isRecord) : []).filter((item) => asBoolean(item.visible, true)).map((item, itemIndex) => {
                          const metrics = getMetricPairs(item);

                          return (
                            <li className={`flex w-full gap-3 text-sm leading-6 ${isDark ? "text-white/75" : "text-neutral-700"}`} key={asString(item.id, `item-${itemIndex}`)}>
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                              <span className="min-w-0 flex-1 overflow-visible">
                                <span className="block max-w-full font-semibold">{asString(item.title)}</span>
                                {asString(item.subtitle) ? <span className="block text-xs opacity-70">{asString(item.subtitle)}</span> : null}
                                {metrics.length ? (
                                  <span className="mt-2 flex flex-wrap gap-1.5">
                                    {metrics.map((metric) => (
                                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none shadow-sm ${isDark ? "border-blue-300/25 bg-blue-400/12 text-blue-50" : "border-blue-200 bg-blue-100/70 text-blue-700"}`} key={`${metric.label}-${metric.value}`}>
                                        {metric.label}: {metric.value}
                                      </span>
                                    ))}
                                  </span>
                                ) : null}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}

                {type === "funnel" ? (
                  <PanelMetaObjectiveFunnel kpis={[]} metrics={[]} objectiveLabel={asString(block.title, "Funil")} stages={toFunnelStages(block.stages)} />
                ) : null}

                {type === "spacer" ? (
                  <div className="flex items-center" style={{ minHeight: asNumber(block.size, 32, { max: 240, min: 8 }) }}>
                    {asBoolean(block.showLine, true) ? (
                      <span
                        className="block rounded-full"
                        style={{
                          backgroundColor: asString(block.lineColor, isDark ? "rgba(255,255,255,0.18)" : "#d4d4d8"),
                          height: asNumber(block.lineThickness, 1, { max: 12, min: 1 }),
                          width: "100%",
                        }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}
        </section>
      </div>
    </article>
  );
}
