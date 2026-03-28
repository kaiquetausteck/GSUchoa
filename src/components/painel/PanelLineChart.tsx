import type { PanelDashboardRange } from "../../services/painel/dashboard-api";

type PanelLineChartSeries = {
  color: string;
  label: string;
  values: number[];
};

type PanelLineChartProps = {
  labels: string[];
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
  range,
  series,
}: PanelLineChartProps) {
  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 0);
  const hasData = allValues.some((value) => value > 0);
  const tickIndexes = getTickIndexes(labels.length);
  const gridValues = Array.from({ length: 4 }, (_, index) => {
    return Math.round((maxValue / 4) * (4 - index));
  });

  if (!labels.length || !series.length) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/20">
        <p className="text-sm text-on-surface-variant">
          Ainda nao ha pontos suficientes para renderizar o grafico.
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/20 px-6 text-center">
        <p className="text-base font-semibold text-on-surface">
          Nenhuma atividade registrada no periodo selecionado.
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Assim que houver movimentacao no painel, a linha do tempo passa a mostrar a evolucao diaria dos modulos.
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

      <div className="panel-card-muted rounded-[1.5rem] border p-4">
        <svg
          aria-label="Grafico de linha do dashboard"
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          {gridValues.map((value) => {
            const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
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
            const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
            const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
            const safeMaxValue = Math.max(maxValue, 1);
            const denominator = Math.max(item.values.length - 1, 1);

            return item.values.map((value, index) => {
              const x = PADDING.left + (innerWidth * index) / denominator;
              const y = PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight;

              return (
                <circle
                  cx={x}
                  cy={y}
                  fill={item.color}
                  key={`${item.label}-${labels[index]}`}
                  r={index === item.values.length - 1 ? 4.5 : 3}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1.5"
                />
              );
            });
          })}

          {tickIndexes.map((index) => {
            const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
            const denominator = Math.max(labels.length - 1, 1);
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
        </svg>
      </div>
    </div>
  );
}
