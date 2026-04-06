export type PanelMetaObjectiveFunnelStage = {
  color: string;
  helper: string;
  label: string;
  rawValue: number;
  value: string;
};

export type PanelMetaObjectiveFunnelMetric = {
  helper: string;
  label: string;
  value: string;
};

export type PanelMetaObjectiveFunnelKpi = {
  label: string;
  value: string;
};

type PanelMetaObjectiveFunnelProps = {
  kpis: PanelMetaObjectiveFunnelKpi[];
  loading?: boolean;
  metrics: PanelMetaObjectiveFunnelMetric[];
  note?: string | null;
  objectiveLabel: string;
  stages: PanelMetaObjectiveFunnelStage[];
};

const FUNNEL_STAGE_PALETTE = [
  {
    end: "#2563eb",
    glow: "rgba(37, 99, 235, 0.26)",
    start: "#5bd6ff",
  },
  {
    end: "#347dff",
    glow: "rgba(52, 125, 255, 0.24)",
    start: "#62b0ff",
  },
  {
    end: "#5b5ce6",
    glow: "rgba(91, 92, 230, 0.22)",
    start: "#7e86ff",
  },
  {
    end: "#1294c2",
    glow: "rgba(18, 148, 194, 0.22)",
    start: "#4fe4d4",
  },
] as const;

const FUNNEL_SEGMENT_HEIGHT = 76;
const FUNNEL_SEGMENT_GAP = 14;
const FUNNEL_MAX_WIDTH = 336;
const FUNNEL_MIN_WIDTH = 124;
const FUNNEL_VIEWBOX_WIDTH = 420;
const FUNNEL_CENTER_X = FUNNEL_VIEWBOX_WIDTH / 2;

function buildFunnelSegmentPath({
  bottomWidth,
  centerX,
  topWidth,
  y,
}: {
  bottomWidth: number;
  centerX: number;
  topWidth: number;
  y: number;
}) {
  const leftTop = centerX - topWidth / 2;
  const rightTop = centerX + topWidth / 2;
  const leftBottom = centerX - bottomWidth / 2;
  const rightBottom = centerX + bottomWidth / 2;
  const bottomY = y + FUNNEL_SEGMENT_HEIGHT;

  return `M ${leftTop} ${y} L ${rightTop} ${y} L ${rightBottom} ${bottomY} L ${leftBottom} ${bottomY} Z`;
}

function buildStageLabelLines(label: string, maxCharactersPerLine: number) {
  const words = label.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return ["Sem dados"];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidateLine = currentLine ? `${currentLine} ${word}` : word;

    if (candidateLine.length <= maxCharactersPerLine || !currentLine) {
      currentLine = candidateLine;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;

    if (lines.length === 1) {
      continue;
    }

    break;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length <= 2) {
    return lines;
  }

  const [firstLine, secondLine, ...remainingLines] = lines;
  const trailingContent = [secondLine, ...remainingLines].join(" ");
  const truncatedSecondLine =
    trailingContent.length > maxCharactersPerLine
      ? `${trailingContent.slice(0, Math.max(maxCharactersPerLine - 1, 1)).trimEnd()}…`
      : trailingContent;

  return [firstLine, truncatedSecondLine];
}

function PanelMetaObjectiveFunnelSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.95rem] border border-primary/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="panel-skeleton h-4 w-32 rounded-full" />
            <div className="panel-skeleton h-9 w-48 rounded-full" />
          </div>
          <div className="panel-skeleton h-9 w-24 rounded-full" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)]">
          <div className="panel-skeleton h-[25rem] rounded-[1.6rem]" />

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="panel-skeleton h-[92px] rounded-[1.35rem]" key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="panel-skeleton h-[6.1rem] rounded-[1.35rem]" key={index} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="panel-skeleton h-[5.2rem] rounded-[1.2rem]" key={index} />
        ))}
      </div>
    </div>
  );
}

export function PanelMetaObjectiveFunnel({
  kpis,
  loading = false,
  metrics,
  note,
  objectiveLabel,
  stages,
}: PanelMetaObjectiveFunnelProps) {
  if (loading) {
    return <PanelMetaObjectiveFunnelSkeleton />;
  }

  const safeStages = stages.length > 0
    ? stages
    : [
        {
          color: "",
          helper: "Ainda não há etapas disponíveis para o recorte atual.",
          label: "Sem dados",
          rawValue: 0,
          value: "0",
        },
      ];
  const safeMaxValue = Math.max(...safeStages.map((stage) => stage.rawValue), 1);
  const chartHeight =
    safeStages.length * FUNNEL_SEGMENT_HEIGHT + (safeStages.length - 1) * FUNNEL_SEGMENT_GAP;
  const stageWidths = safeStages.map((stage) => {
    if (stage.rawValue <= 0) {
      return FUNNEL_MIN_WIDTH;
    }

    const normalizedValue = stage.rawValue / safeMaxValue;
    const visualRatio = 0.32 + Math.sqrt(normalizedValue) * 0.68;

    return Math.max(FUNNEL_MIN_WIDTH, visualRatio * FUNNEL_MAX_WIDTH);
  });

  return (
    <div className="space-y-5">
      <div
        className="relative overflow-hidden rounded-[1.95rem] border border-sky-300/16 p-5 text-white"
        style={{
          background:
            "linear-gradient(160deg, rgba(4, 47, 87, 0.96) 0%, rgba(13, 28, 51, 0.96) 52%, rgba(10, 96, 141, 0.92) 100%)",
          boxShadow: "0 28px 70px rgba(6, 18, 36, 0.26)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-32 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at top, rgba(96, 165, 250, 0.42) 0%, rgba(96, 165, 250, 0) 72%)",
          }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sky-100/68">
              Objetivo em foco
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-white">{objectiveLabel}</h3>
          </div>

          <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-50/88">
            Gráfico de funil
          </span>
        </div>

        <div className="relative mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,20rem)] xl:items-center">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/8 bg-black/10 p-4 md:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 bottom-0 top-10 rounded-[2rem] opacity-80"
              style={{
                background:
                  "radial-gradient(circle at top, rgba(96, 165, 250, 0.14) 0%, rgba(96, 165, 250, 0) 45%), linear-gradient(180deg, rgba(13, 31, 56, 0.22) 0%, rgba(6, 16, 29, 0.44) 100%)",
              }}
            />

            <div className="relative mx-auto w-full max-w-[43rem]">
              <svg
                aria-hidden="true"
                className="h-auto w-full"
                role="img"
                viewBox={`0 0 ${FUNNEL_VIEWBOX_WIDTH} ${chartHeight}`}
              >
                <defs>
                  <filter id="meta-funnel-shadow" x="-24%" y="-24%" width="148%" height="160%">
                    <feDropShadow dx="0" dy="18" floodColor="#020617" floodOpacity="0.34" stdDeviation="18" />
                  </filter>

                  {safeStages.map((_, index) => {
                    const palette = FUNNEL_STAGE_PALETTE[index % FUNNEL_STAGE_PALETTE.length]!;

                    return (
                      <linearGradient
                        id={`meta-funnel-gradient-${index}`}
                        key={`gradient-${index}`}
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor={palette.start} />
                        <stop offset="100%" stopColor={palette.end} />
                      </linearGradient>
                    );
                  })}
                </defs>

                {safeStages.map((stage, index) => {
                  const palette = FUNNEL_STAGE_PALETTE[index % FUNNEL_STAGE_PALETTE.length]!;
                  const topWidth = stageWidths[index]!;
                  const nextWidth =
                    stageWidths[index + 1] ?? Math.max(FUNNEL_MIN_WIDTH * 0.8, topWidth * 0.74);
                  const y = index * (FUNNEL_SEGMENT_HEIGHT + FUNNEL_SEGMENT_GAP);
                  const centerY = y + FUNNEL_SEGMENT_HEIGHT / 2;
                  const labelCharactersPerLine = topWidth < 170 ? 11 : topWidth < 220 ? 15 : 20;
                  const stageLabelLines = buildStageLabelLines(stage.label, labelCharactersPerLine);
                  const stageLabelBaseY = centerY - (stageLabelLines.length === 2 ? 13 : 8);
                  const stageValueY = centerY + (stageLabelLines.length === 2 ? 16 : 14);

                  return (
                    <g key={`${stage.label}-${index}`}>
                      <path
                        d={buildFunnelSegmentPath({
                          bottomWidth: nextWidth,
                          centerX: FUNNEL_CENTER_X,
                          topWidth,
                          y,
                        })}
                        fill={palette.glow}
                        opacity="0.58"
                        transform="translate(0 12)"
                      />

                      <path
                        d={buildFunnelSegmentPath({
                          bottomWidth: nextWidth,
                          centerX: FUNNEL_CENTER_X,
                          topWidth,
                          y,
                        })}
                        fill={`url(#meta-funnel-gradient-${index})`}
                        filter="url(#meta-funnel-shadow)"
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="1.4"
                      />

                      <path
                        d={`M ${FUNNEL_CENTER_X - topWidth / 2 + 18} ${y + 12} L ${FUNNEL_CENTER_X + topWidth / 2 - 18} ${y + 12}`}
                        opacity="0.42"
                        stroke="rgba(255,255,255,0.72)"
                        strokeLinecap="round"
                        strokeWidth="2"
                      />

                      <text
                        fill="rgba(255,255,255,0.75)"
                        fontSize="10"
                        fontWeight="700"
                        letterSpacing="2"
                        textAnchor="middle"
                        x={FUNNEL_CENTER_X}
                        y={stageLabelBaseY - 16}
                      >
                        {`ETAPA ${index + 1}`}
                      </text>

                      <text
                        fill="#ffffff"
                        fontSize={topWidth < 170 ? "13" : "16"}
                        fontWeight="700"
                        textAnchor="middle"
                        x={FUNNEL_CENTER_X}
                        y={stageLabelBaseY}
                      >
                        {stageLabelLines.map((line, lineIndex) => (
                          <tspan
                            dy={lineIndex === 0 ? 0 : 15}
                            key={`${stage.label}-${lineIndex}`}
                            x={FUNNEL_CENTER_X}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>

                      <text
                        fill="#ffffff"
                        fontSize="20"
                        fontWeight="800"
                        textAnchor="middle"
                        x={FUNNEL_CENTER_X}
                        y={stageValueY}
                      >
                        {stage.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="grid content-start gap-3">
            {safeStages.map((stage, index) => {
              const palette = FUNNEL_STAGE_PALETTE[index % FUNNEL_STAGE_PALETTE.length]!;

              return (
                <article
                  className="rounded-[1.35rem] border border-white/10 bg-white/6 px-4 py-3 shadow-[0_20px_40px_rgba(2,6,23,0.18)]"
                  key={`${stage.label}-summary-${index}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-2.5 w-2.5 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${palette.start} 0%, ${palette.end} 100%)`,
                            boxShadow: `0 0 0 4px ${palette.glow}`,
                          }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/68">
                          Etapa {index + 1}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold leading-tight text-white">{stage.label}</p>
                    </div>

                    <p className="shrink-0 text-right text-lg font-black tracking-tight text-white">
                      {stage.value}
                    </p>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-sky-50/78">{stage.helper}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <article className="panel-card-muted rounded-[1.4rem] border px-4 py-4" key={metric.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-black tracking-tight text-on-surface">{metric.value}</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{metric.helper}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <article className="panel-card-muted rounded-[1.25rem] border px-4 py-3" key={kpi.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              {kpi.label}
            </p>
            <p className="mt-2 text-sm font-bold text-on-surface md:text-base">{kpi.value}</p>
          </article>
        ))}
      </div>

      {note ? (
        <div className="rounded-[1.35rem] border border-amber-500/18 bg-amber-500/8 px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
          {note}
        </div>
      ) : null}
    </div>
  );
}
