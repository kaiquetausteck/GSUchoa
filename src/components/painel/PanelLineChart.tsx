import { useMemo, useState } from "react";

import type { PanelDashboardRange } from "../../services/painel/dashboard-api";

type PanelLineChartSeries = {
  color: string;
  label: string;
  valueFormatter?: (value: number) => string;
  values: number[];
};

type PanelLineChartProps = {
  labels: string[];
  loading?: boolean;
  range: PanelDashboardRange;
  series: PanelLineChartSeries[];
};

const CHART_HEIGHT = 260;
const CHART_WIDTH = 760;
const PADDING = {
  top: 18,
  right: 18,
  bottom: 36,
  left: 18,
};

function formatTickLabel(rawDate: string, range: PanelDashboardRange) {
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: range === "12m" ? undefined : "2-digit",
    month: range === "12m" ? "short" : "2-digit",
  }).format(date);
}

function formatTooltipDate(rawDate: string) {
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
  }).format(date);
}

function formatTooltipValue(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function buildPath(values: number[], maxValue: number) {
  if (values.length === 0) {
    return "";
  }

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const safeMaxValue = Math.max(maxValue, 1);
  const denominator = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = PADDING.left + (innerWidth * index) / denominator;
      const y = PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getTickIndexes(total: number) {
  if (total <= 6) {
    return Array.from({ length: total }, (_, index) => index);
  }

  return Array.from(new Set([
    0,
    Math.floor((total - 1) * 0.2),
    Math.floor((total - 1) * 0.4),
    Math.floor((total - 1) * 0.6),
    Math.floor((total - 1) * 0.8),
    total - 1,
  ])).sort((first, second) => first - second);
}

export function PanelLineChart({
  labels,
  loading = false,
  range,
  series,
}: PanelLineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 0);
  const hasData = allValues.some((value) => value > 0);
  const tickIndexes = getTickIndexes(labels.length);
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const denominator = Math.max(labels.length - 1, 1);
  const gridValues = Array.from({ length: 4 }, (_, index) => {
    return Math.round((maxValue / 4) * (4 - index));
  });
  const pointXPositions = useMemo(
    () =>
      labels.map((_, index) => {
        return PADDING.left + (innerWidth * index) / denominator;
      }),
    [denominator, innerWidth, labels],
  );
  const hoverSegments = useMemo(
    () =>
      labels.map((label, index) => {
        const currentX = pointXPositions[index] ?? PADDING.left;
        const previousX = pointXPositions[index - 1];
        const nextX = pointXPositions[index + 1];
        const startX = index === 0 ? PADDING.left : (previousX + currentX) / 2;
        const endX = index === labels.length - 1 ? CHART_WIDTH - PADDING.right : (currentX + nextX) / 2;

        return {
          key: `${label}-${index}`,
          width: Math.max(endX - startX, 1),
          x: startX,
        };
      }),
    [labels, pointXPositions],
  );
  const tooltipData = activeIndex === null
    ? null
    : {
        dateLabel: formatTooltipDate(labels[activeIndex] ?? ""),
        rows: series.map((item) => {
          const value = item.values[activeIndex] ?? 0;

          return {
            color: item.color,
            label: item.label,
            value: item.valueFormatter ? item.valueFormatter(value) : formatTooltipValue(value),
          };
        }),
        x: pointXPositions[activeIndex] ?? PADDING.left,
      };
  const tooltipLeft = tooltipData
    ? `${Math.min(Math.max(((tooltipData.x - PADDING.left) / Math.max(innerWidth, 1)) * 100, 6), 94)}%`
    : "50%";
  const tooltipTransform =
    activeIndex === null || labels.length <= 1
      ? "translateX(-50%)"
      : activeIndex === 0
        ? "translateX(0)"
        : activeIndex === labels.length - 1
          ? "translateX(-100%)"
          : "translateX(-50%)";

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="flex items-center gap-2" key={index}>
              <span className="panel-skeleton h-2.5 w-2.5 rounded-full" />
              <span className="panel-skeleton h-3 w-20 rounded-full" />
            </div>
          ))}
        </div>

        <div className="rounded-[1.7rem] border border-outline-variant/10 bg-surface-container-low/55 p-4">
          <div className="panel-skeleton h-[18rem] rounded-[1.35rem]" />
        </div>
      </div>
    );
  }

  if (!labels.length || !series.length) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/20">
        <p className="text-sm text-on-surface-variant">
          Ainda não há pontos suficientes para exibir o gráfico.
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/20 px-6 text-center">
        <p className="text-base font-semibold text-on-surface">
          Nenhuma atividade registrada no período selecionado.
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Assim que a API retornar dados para o recorte atual, a linha do tempo passa a exibir a evolução diária do período.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        {series.map((item) => (
          <div className="flex items-center gap-2" key={item.label}>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-on-surface-variant">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div
        className="relative rounded-[1.7rem] border border-outline-variant/10 bg-surface-container-low/55 p-4 transition-colors duration-300 group-hover:bg-surface-container-low/70"
        onMouseLeave={() => setActiveIndex(null)}
      >
        {tooltipData ? (
          <div
            className="pointer-events-none absolute top-3 z-10 min-w-[13rem] max-w-[18rem] rounded-[1.2rem] border border-outline-variant/14 bg-[#111318]/94 px-4 py-3 shadow-[0_24px_48px_rgba(0,0,0,0.28)] backdrop-blur"
            style={{
              left: tooltipLeft,
              transform: tooltipTransform,
            }}
          >
            <p className="text-xs font-semibold capitalize text-on-surface">
              {tooltipData.dateLabel}
            </p>

            <div className="mt-3 space-y-2">
              {tooltipData.rows.map((row) => (
                <div className="flex items-center justify-between gap-4" key={row.label}>
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="truncate text-xs text-on-surface-variant">{row.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <svg
          aria-label="Gráfico de linha do dashboard"
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          {gridValues.map((value) => {
            const y = PADDING.top + innerHeight - (value / Math.max(maxValue, 1)) * innerHeight;

            return (
              <g key={value}>
                <line
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeDasharray="4 8"
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                />
                <text
                  fill="currentColor"
                  fontSize="10"
                  opacity="0.58"
                  textAnchor="end"
                  x={CHART_WIDTH - PADDING.right}
                  y={Math.max(y - 6, 12)}
                >
                  {value}
                </text>
              </g>
            );
          })}

          {tooltipData ? (
            <line
              stroke="rgba(148, 163, 184, 0.28)"
              strokeDasharray="5 8"
              x1={tooltipData.x}
              x2={tooltipData.x}
              y1={PADDING.top}
              y2={CHART_HEIGHT - PADDING.bottom}
            />
          ) : null}

          {series.map((item) => {
            const path = buildPath(item.values, maxValue);

            return (
              <path
                d={path}
                fill="none"
                key={item.label}
                stroke={item.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            );
          })}

          {series.map((item) => {
            const safeMaxValue = Math.max(maxValue, 1);
            const seriesDenominator = Math.max(item.values.length - 1, 1);

            return item.values.map((value, index) => {
              const x = PADDING.left + (innerWidth * index) / seriesDenominator;
              const y = PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight;
              const isActive = activeIndex === index;
              const isLastPoint = index === item.values.length - 1;

              return (
                <g key={`${item.label}-${labels[index]}`}>
                  {isActive ? (
                    <circle
                      cx={x}
                      cy={y}
                      fill={item.color}
                      opacity="0.22"
                      r={11}
                    />
                  ) : null}
                  <circle
                    cx={x}
                    cy={y}
                    fill={item.color}
                    r={isActive ? 6 : isLastPoint ? 4.5 : 3}
                    stroke="rgba(255,255,255,0.84)"
                    strokeWidth={isActive ? "2" : "1.5"}
                  />
                </g>
              );
            });
          })}

          {tickIndexes.map((index) => {
            const x = PADDING.left + (innerWidth * index) / denominator;

            return (
              <text
                fill="currentColor"
                fontSize="10"
                key={labels[index]}
                opacity="0.62"
                textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"}
                x={x}
                y={CHART_HEIGHT - 8}
              >
                {formatTickLabel(labels[index], range)}
              </text>
            );
          })}

          {hoverSegments.map((segment, index) => (
            <rect
              aria-label={`Exibir detalhes de ${formatTooltipDate(labels[index] ?? "")}`}
              fill="transparent"
              height={innerHeight}
              key={segment.key}
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              rx="8"
              tabIndex={0}
              width={segment.width}
              x={segment.x}
              y={PADDING.top}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
