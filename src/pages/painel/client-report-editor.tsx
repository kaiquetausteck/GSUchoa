import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bold,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  X,
  DollarSign,
  Eye,
  FileText,
  GripVertical,
  Heart,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Link,
  MessageCircle,
  MessageSquare,
  Minus,
  MousePointerClick,
  Percent,
  Phone,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
  Strikethrough,
  Target,
  Trash2,
  TrendingUp,
  Type,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import {
  PanelMetaObjectiveFunnel,
  type PanelMetaObjectiveFunnelStage,
} from "../../components/painel/PanelMetaObjectiveFunnel";
import { LogoIconAnimated } from "../../components/shared/LogoIconAnimated";
import { AppCheckbox } from "../../components/shared/ui/AppCheckbox";
import { AppColorInput } from "../../components/shared/ui/AppColorInput";
import { AppInput } from "../../components/shared/ui/AppInput";
import { AppSelect } from "../../components/shared/ui/AppSelect";
import { AppTextarea } from "../../components/shared/ui/AppTextarea";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import {
  getPanelClientReportById,
  refreshPanelClientReportDataSnapshot,
  type PanelClientReportRecord,
  updatePanelClientReport,
} from "../../services/painel/client-reports-api";

type ReportBlockWidth = "full" | "half" | "third";
type ReportBlockSource = "manual" | "meta_paid" | "google_paid" | "linkedin_paid" | "meta_social" | "linkedin_social";
type ReportImageFormat = "free" | "landscape" | "portrait" | "square" | "story";
type ReportImageSourceMode = "gallery" | "upload";
type ReportImagePropertyTab = "format" | "images";

type ReportBlockBase = {
  id: string;
  showFrame: boolean;
  span?: number;
  type: "text" | "metric" | "image" | "list" | "funnel" | "spacer";
  width: ReportBlockWidth;
};

type ReportTextBlock = ReportBlockBase & {
  body: string;
  title: string;
  type: "text";
};

type ReportMetricBlock = ReportBlockBase & {
  fieldKey: string;
  helper: string;
  icon: string;
  label: string;
  source: ReportBlockSource;
  tone: string;
  type: "metric";
  value: string;
};

type ReportImageBlock = ReportBlockBase & {
  caption: string;
  format: ReportImageFormat;
  images: ReportImageItem[];
  mediaId: string;
  src: string;
  sourceMode: ReportImageSourceMode;
  source: ReportBlockSource;
  title: string;
  type: "image";
};

type ReportImageItem = {
  caption: string;
  id: string;
  mediaId: string;
  metrics: Array<{ label: string; value: string }>;
  showMetrics: boolean;
  source: ReportBlockSource;
  src: string;
  visibleMetricKeys: string[];
};

type ReportListItem = {
  id: string;
  imageUrl: string;
  metrics: Array<{ label: string; value: string }>;
  subtitle: string;
  title: string;
  visible: boolean;
};

type ReportListBlock = ReportBlockBase & {
  items: ReportListItem[];
  listKey: string;
  mode: "image" | "text";
  source: ReportBlockSource;
  title: string;
  type: "list";
};

type ReportFunnelStage = {
  color: string;
  fieldKey: string;
  helper: string;
  id: string;
  name: string;
  source: ReportBlockSource;
  value: string;
};

type ReportFunnelBlock = ReportBlockBase & {
  source: ReportBlockSource;
  stages: ReportFunnelStage[];
  title: string;
  type: "funnel";
};

type ReportSpacerBlock = ReportBlockBase & {
  lineColor: string;
  lineThickness: number;
  showLine: boolean;
  size: number;
  title: string;
  type: "spacer";
};

type ReportBlock =
  | ReportTextBlock
  | ReportMetricBlock
  | ReportImageBlock
  | ReportListBlock
  | ReportFunnelBlock
  | ReportSpacerBlock;

type ReportPageColumns = 3 | 4 | 5;
type ReportPageTheme = "light" | "dark";

type ReportLayout = {
  blocks: ReportBlock[];
  page: {
    columns: ReportPageColumns;
    header: {
      brand: string;
      showLogo: boolean;
      subtitle: string;
      title: string;
    };
    orientation: "portrait";
    size: "A4";
    theme: ReportPageTheme;
  };
  version: 1;
};

type MetricField = {
  helper: string;
  icon?: string;
  key: string;
  label: string;
  source: ReportBlockSource;
  tone: string;
  value: string;
};

type JsonRecord = Record<string, unknown>;

type SnapshotMediaItem = {
  caption: string;
  id: string;
  label: string;
  metrics: Array<{ label: string; value: string }>;
  src: string;
};

type SnapshotList = {
  items: ReportListItem[];
  key: string;
  kind: "image" | "text";
  label: string;
  source: Exclude<ReportBlockSource, "manual">;
};

type ReportDataSnapshotSource = {
  fields: MetricField[];
  label: string;
  lists: SnapshotList[];
  media: SnapshotMediaItem[];
  resources: unknown[];
  tone: string;
};

type ReportDataSnapshot = {
  errors: string[];
  generatedAt: string | null;
  sources: Partial<Record<Exclude<ReportBlockSource, "manual">, ReportDataSnapshotSource>>;
};

type SnapshotGalleryImage = SnapshotMediaItem & {
  source: Exclude<ReportBlockSource, "manual">;
  sourceLabel: string;
};

type EditorSectionKey = "settings" | "insert" | "blocks";
type DropIndicator = {
  blockId: string;
  position: "after" | "before";
  surface: "canvas" | "list";
} | null;
type PendingInsertBlock = {
  listMode?: ReportListBlock["mode"];
  type: ReportBlock["type"];
};

const SOURCE_LABELS: Record<ReportBlockSource, string> = {
  google_paid: "Google Ads",
  linkedin_paid: "LinkedIn Ads",
  linkedin_social: "LinkedIn",
  manual: "Manual",
  meta_paid: "Meta Ads",
  meta_social: "Meta social",
};

const LIST_LABEL_OVERRIDES: Record<string, string> = {
  "meta_paid:ads": "Anúncios",
  "meta_paid:adsets": "Conjuntos de anúncios",
  "meta_paid:campaigns": "Campanhas",
  "linkedin_paid:campaigns": "Campanhas",
  "linkedin_paid:creatives": "Criativos",
  "meta_social:content_types": "Tipos de conteúdo",
  "meta_social:posts": "Posts",
};

const IMAGE_FORMAT_OPTIONS: Array<{ description: string; format: ReportImageFormat; label: string; ratio: string | null }> = [
  { description: "Mantém a proporção original.", format: "free", label: "Livre", ratio: null },
  { description: "Formato 9:16 para criativos de stories.", format: "story", label: "Story vertical", ratio: "9 / 16" },
  { description: "Formato 16:9 para vídeos horizontais.", format: "landscape", label: "Vídeo horizontal", ratio: "16 / 9" },
  { description: "Formato 1:1 para feed quadrado.", format: "square", label: "Quadrado", ratio: "1 / 1" },
  { description: "Formato 4:5 para feed vertical.", format: "portrait", label: "Feed vertical", ratio: "4 / 5" },
];

const METRIC_ICON_OPTIONS: Array<{ Icon: LucideIcon; key: string; label: string }> = [
  { Icon: BarChart3, key: "bar-chart", label: "Gráfico" },
  { Icon: DollarSign, key: "money", label: "Investimento" },
  { Icon: UsersRound, key: "users", label: "Pessoas" },
  { Icon: Eye, key: "eye", label: "Visualizações" },
  { Icon: MousePointerClick, key: "click", label: "Cliques" },
  { Icon: Percent, key: "percent", label: "Percentual" },
  { Icon: Target, key: "target", label: "Resultado" },
  { Icon: TrendingUp, key: "trend", label: "Crescimento" },
  { Icon: MessageCircle, key: "message", label: "Mensagem" },
  { Icon: MessageSquare, key: "comment", label: "Comentário" },
  { Icon: Heart, key: "heart", label: "Curtidas" },
  { Icon: Share2, key: "share", label: "Compartilhar" },
  { Icon: Bookmark, key: "bookmark", label: "Salvos" },
  { Icon: CalendarDays, key: "calendar", label: "Publicações" },
  { Icon: Phone, key: "phone", label: "Ligação" },
  { Icon: Link, key: "link", label: "Link" },
];

const METRIC_ICON_BY_FIELD_KEY: Record<string, string> = {
  clicks: "click",
  comments: "comment",
  content_count: "calendar",
  conversions: "target",
  cost_per_conversion: "money",
  cost_per_result: "money",
  cpc: "money",
  cpm: "money",
  ctr: "percent",
  engagement: "trend",
  engagement_rate: "percent",
  impressions: "eye",
  likes: "heart",
  manual_value: "bar-chart",
  reach: "users",
  results: "target",
  saves: "bookmark",
  shares: "share",
  spend: "money",
  views: "eye",
};

const METRIC_FIELDS: MetricField[] = [
  { source: "manual", key: "manual_value", label: "Valor manual", value: "0", helper: "Preenchido manualmente", tone: "#2563eb" },
  { source: "meta_paid", key: "spend", label: "Investimento", value: "R$ 0,00", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "reach", label: "Alcance", value: "0", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "impressions", label: "Impressões", value: "0", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "clicks", label: "Cliques", value: "0", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "ctr", label: "CTR", value: "0%", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "cpc", label: "CPC", value: "R$ 0,00", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "cpm", label: "CPM", value: "R$ 0,00", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "results", label: "Resultados", value: "0", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "meta_paid", key: "cost_per_result", label: "Custo por resultado", value: "R$ 0,00", helper: "Meta Ads - resumo atual", tone: "#2563eb" },
  { source: "google_paid", key: "spend", label: "Investimento", value: "R$ 0,00", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "google_paid", key: "impressions", label: "Impressões", value: "0", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "google_paid", key: "clicks", label: "Cliques", value: "0", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "google_paid", key: "ctr", label: "CTR", value: "0%", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "google_paid", key: "cpc", label: "CPC", value: "R$ 0,00", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "google_paid", key: "conversions", label: "Conversões", value: "0", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "google_paid", key: "cost_per_conversion", label: "Custo por conversão", value: "R$ 0,00", helper: "Google Ads - resumo atual", tone: "#16a34a" },
  { source: "linkedin_paid", key: "spend", label: "Investimento", value: "R$ 0,00", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "impressions", label: "Impressões", value: "0", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "clicks", label: "Cliques", value: "0", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "ctr", label: "CTR", value: "0%", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "cpc", label: "CPC", value: "R$ 0,00", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "cpm", label: "CPM", value: "R$ 0,00", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "results", label: "Resultados", value: "0", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "linkedin_paid", key: "cost_per_result", label: "Custo por resultado", value: "R$ 0,00", helper: "LinkedIn Ads - resumo atual", tone: "#0a66c2" },
  { source: "meta_social", key: "content_count", label: "Publicações", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "views", label: "Visualizações", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "reach", label: "Alcance", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "impressions", label: "Impressões", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "likes", label: "Curtidas", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "comments", label: "Comentários", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "shares", label: "Compartilhamentos", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "saves", label: "Salvamentos", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "engagement", label: "Engajamento", value: "0", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "meta_social", key: "engagement_rate", label: "Taxa de engajamento", value: "0%", helper: "Meta social - dashboard atual", tone: "#7c3aed" },
  { source: "linkedin_social", key: "impressions", label: "Impressões", value: "0", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
  { source: "linkedin_social", key: "clicks", label: "Cliques", value: "0", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
  { source: "linkedin_social", key: "likes", label: "Curtidas", value: "0", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
  { source: "linkedin_social", key: "comments", label: "Comentários", value: "0", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
  { source: "linkedin_social", key: "shares", label: "Compartilhamentos", value: "0", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
  { source: "linkedin_social", key: "engagement", label: "Engajamento", value: "0", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
  { source: "linkedin_social", key: "engagement_rate", label: "Taxa de engajamento", value: "0%", helper: "LinkedIn - dashboard atual", tone: "#0a66c2" },
];

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getFirstStringValue(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function findStringByKey(value: unknown, key: string, depth = 0): string {
  if (depth > 5 || !value) {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findStringByKey(item, key, depth + 1);
      if (match) {
        return match;
      }
    }

    return "";
  }

  if (!isRecord(value)) {
    return "";
  }

  const directValue = value[key];
  if (typeof directValue === "string" && directValue.trim()) {
    return directValue.trim();
  }

  for (const nestedValue of Object.values(value)) {
    if (nestedValue === directValue) {
      continue;
    }

    const match = findStringByKey(nestedValue, key, depth + 1);
    if (match) {
      return match;
    }
  }

  return "";
}

function getFirstNestedString(value: unknown, keys: string[]) {
  for (const key of keys) {
    const match = findStringByKey(value, key);
    if (match) {
      return match;
    }
  }

  return "";
}

function collectIdentifierValues(value: unknown, depth = 0): string[] {
  if (depth > 4 || !value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectIdentifierValues(item, depth + 1));
  }

  if (!isRecord(value)) {
    return [];
  }

  const keys = [
    "id",
    "sourceId",
    "source_id",
    "mediaId",
    "media_id",
    "postId",
    "post_id",
    "pagePostId",
    "page_post_id",
    "instagramMediaId",
    "instagram_media_id",
    "objectStoryId",
    "object_story_id",
    "effectiveObjectStoryId",
    "effective_object_story_id",
    "adId",
    "ad_id",
    "metaAdId",
    "meta_ad_id",
    "creativeId",
    "creative_id",
  ];
  const directValues = keys.map((key) => asString(value[key])).filter(Boolean);
  const nestedValues = Object.values(value).flatMap((nestedValue) => collectIdentifierValues(nestedValue, depth + 1));
  return Array.from(new Set([...directValues, ...nestedValues]));
}

function normalizeTextForImageMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^(post|publicacao|publicação)\s+do\s+instagram:\s*/i, "")
    .replace(/^instagram\s+post:\s*/i, "")
    .replace(/^promovendo\s+o\s+site:\s*/i, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTextImageMatchCandidates(value: unknown) {
  const textKeys = [
    "body",
    "message",
    "text",
    "fullText",
    "full_text",
    "description",
    "copy",
    "primaryText",
    "primary_text",
    "title",
    "name",
    "label",
    "caption",
  ];

  return Array.from(new Set(
    textKeys
      .map((key) => normalizeTextForImageMatch(findStringByKey(value, key)))
      .filter((text) => text.length >= 16),
  ));
}

function buildImageLookup(candidates: unknown[]) {
  const lookup = new Map<string, string>();
  const imageKeys = [
    "imageUrl",
    "image_url",
    "thumbnailUrl",
    "thumbnail_url",
    "src",
    "mediaUrl",
    "media_url",
    "pictureUrl",
    "picture",
    "fullPicture",
    "full_picture",
    "previewUrl",
    "preview_url",
  ];

  candidates.forEach((candidate) => {
    const imageUrl = getFirstNestedString(candidate, imageKeys);
    if (!imageUrl) {
      return;
    }

    collectIdentifierValues(candidate).forEach((identifier) => {
      lookup.set(identifier, imageUrl);
    });

    getTextImageMatchCandidates(candidate).forEach((text) => {
      lookup.set(`text:${text}`, imageUrl);
    });
  });

  return lookup;
}

function findImageByTextMatch(title: string, imageLookup: Map<string, string>) {
  const normalizedTitle = normalizeTextForImageMatch(title);
  if (normalizedTitle.length < 16) {
    return "";
  }

  const exactMatch = imageLookup.get(`text:${normalizedTitle}`);
  if (exactMatch) {
    return exactMatch;
  }

  let prefixMatch = "";
  imageLookup.forEach((imageUrl, key) => {
    if (prefixMatch || !key.startsWith("text:")) {
      return;
    }

    const candidateText = key.slice(5);
    const shorterText = normalizedTitle.length < candidateText.length ? normalizedTitle : candidateText;
    const longerText = normalizedTitle.length < candidateText.length ? candidateText : normalizedTitle;

    if (shorterText.length >= 10 && longerText.startsWith(shorterText)) {
      prefixMatch = imageUrl;
    }
  });

  if (prefixMatch) {
    return prefixMatch;
  }

  const titleWords = normalizedTitle.split(" ").filter((word) => word.length > 3);
  if (titleWords.length < 3) {
    return "";
  }

  let bestMatch = "";
  let bestScore = 0;
  imageLookup.forEach((imageUrl, key) => {
    if (!key.startsWith("text:")) {
      return;
    }

    const candidateText = key.slice(5);
    const candidateWords = new Set(candidateText.split(" ").filter((word) => word.length > 3));
    const sharedWords = titleWords.filter((word) => candidateWords.has(word)).length;
    const score = sharedWords / Math.max(titleWords.length, candidateWords.size);

    if (sharedWords >= 3 && score > bestScore) {
      bestMatch = imageUrl;
      bestScore = score;
    }
  });

  return bestScore >= 0.35 ? bestMatch : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function bodyToEditorHtml(value: string) {
  if (!value.trim()) {
    return "";
  }

  if (looksLikeHtml(value)) {
    return value;
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function asWidth(value: unknown): ReportBlockWidth {
  return value === "half" || value === "third" || value === "full" ? value : "full";
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

function asNumber(value: unknown, fallback: number, options: { max?: number; min?: number } = {}) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  const nextValue = Number.isFinite(parsed) ? parsed : fallback;
  const min = options.min ?? Number.NEGATIVE_INFINITY;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(nextValue, min), max);
}

function asSpan(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.round(value));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(1, Math.round(parsed)) : undefined;
  }

  return undefined;
}

function asSource(value: unknown): ReportBlockSource {
  return value === "meta_paid" ||
    value === "google_paid" ||
    value === "linkedin_paid" ||
    value === "meta_social" ||
    value === "linkedin_social" ||
    value === "manual"
    ? value
    : "manual";
}

function asImageSourceMode(value: unknown): ReportImageSourceMode {
  return value === "upload" ? value : "gallery";
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

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function formatSnapshotMetricValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "";
}

function normalizeMediaMetrics(value: unknown): Array<{ label: string; value: string }> {
  if (Array.isArray(value)) {
    return value
      .map((metric) => normalizeListMetric(metric))
      .filter((metric): metric is ReportListItem["metrics"][number] => metric !== null);
  }

  if (!isRecord(value)) {
    return [];
  }

  const metricOptions = [
    ["likes", "Curtidas"],
    ["comments", "Comentários"],
    ["shares", "Compart."],
    ["saves", "Salvos"],
    ["reach", "Alcance"],
    ["impressions", "Impressões"],
    ["views", "Views"],
    ["clicks", "Cliques"],
    ["engagement", "Engajamento"],
  ] as const;

  return metricOptions
    .map(([key, label]) => ({
      label,
      value: formatSnapshotMetricValue(value[key]),
    }))
    .filter((metric) => metric.value);
}

function getImageMetricKey(metric: { label: string }, index: number) {
  return `${metric.label || "metric"}-${index}`;
}

function getVisibleImageMetrics(image: ReportImageItem) {
  const keys = new Set(image.visibleMetricKeys);
  return image.metrics.filter((metric, index) => keys.has(getImageMetricKey(metric, index)));
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

function normalizeImageItem(value: unknown, index = 0): ReportImageItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const src = asString(value.src);
  if (!src) {
    return null;
  }

  const metrics = normalizeMediaMetrics(value.metrics);
  const savedVisibleMetricKeys = Array.isArray(value.visibleMetricKeys)
    ? value.visibleMetricKeys.map((item) => asString(item)).filter(Boolean)
    : [];
  const showMetrics = asBoolean(value.showMetrics, false);

  return {
    caption: asString(value.caption),
    id: asString(value.id, `image-${index}-${src}`),
    mediaId: asString(value.mediaId),
    metrics,
    showMetrics,
    source: asSource(value.source),
    src,
    visibleMetricKeys: savedVisibleMetricKeys.length
      ? savedVisibleMetricKeys
      : showMetrics
        ? metrics.map((metric, metricIndex) => getImageMetricKey(metric, metricIndex))
        : [],
  };
}

function createImageItem({
  caption = "",
  mediaId = "",
  metrics = [],
  showMetrics = metrics.length > 0,
  source = "manual",
  src,
}: {
  caption?: string;
  mediaId?: string;
  metrics?: Array<{ label: string; value: string }>;
  showMetrics?: boolean;
  source?: ReportBlockSource;
  src: string;
}): ReportImageItem {
  return {
    caption,
    id: createId(),
    mediaId,
    metrics,
    showMetrics,
    source,
    src,
    visibleMetricKeys: showMetrics ? metrics.map((metric, index) => getImageMetricKey(metric, index)) : [],
  };
}

function normalizeListMetric(value: unknown): ReportListItem["metrics"][number] | null {
  if (!isRecord(value)) {
    return null;
  }

  const label = asString(value.label);
  const metricValue = asString(value.value, value.rawValue === null || value.rawValue === undefined ? "" : String(value.rawValue));

  return label || metricValue ? { label: label || "Valor", value: metricValue } : null;
}

function normalizeListItem(value: unknown, index = 0, imageLookup = new Map<string, string>()): ReportListItem | null {
  if (typeof value === "string") {
    const title = value.trim();
    return title
      ? {
          id: `manual-${index}-${title}`,
          imageUrl: "",
          metrics: [],
          subtitle: "",
          title,
          visible: true,
        }
      : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const title = formatListItemTitle(getFirstNestedString(value, [
    "body",
    "message",
    "text",
    "fullText",
    "full_text",
    "description",
    "copy",
    "primaryText",
    "primary_text",
    "title",
    "name",
    "label",
    "caption",
  ]));

  if (!title) {
    return null;
  }

  const metrics = Array.isArray(value.metrics)
    ? value.metrics.map((metric) => normalizeListMetric(metric)).filter((metric): metric is ReportListItem["metrics"][number] => metric !== null)
    : [];

  const directImageUrl = getFirstNestedString(value, [
    "imageUrl",
    "image_url",
    "thumbnailUrl",
    "thumbnail_url",
    "src",
    "mediaUrl",
    "media_url",
    "pictureUrl",
    "picture",
    "fullPicture",
    "full_picture",
    "previewUrl",
    "preview_url",
  ]);
  const matchedImageUrl = collectIdentifierValues(value).map((identifier) => imageLookup.get(identifier)).find(Boolean) ?? "";
  const textMatchedImageUrl = findImageByTextMatch(title, imageLookup);

  return {
    id: asString(value.id, `item-${index}-${title}`),
    imageUrl: directImageUrl || matchedImageUrl || textMatchedImageUrl,
    metrics,
    subtitle: formatListSupportText(asString(value.subtitle, asString(value.publishedAt, asString(value.type)))),
    title,
    visible: asBoolean(value.visible, true),
  };
}

function createManualListItem(title: string, index: number): ReportListItem {
  return {
    id: createId(),
    imageUrl: "",
    metrics: [{ label: "", value: "" }],
    subtitle: "",
    title: title || `Linha ${index + 1}`,
    visible: true,
  };
}

function getDefaultMetricIcon(fieldKey: string) {
  return METRIC_ICON_BY_FIELD_KEY[fieldKey] ?? "bar-chart";
}

function getMetricIconOption(iconKey: string) {
  return METRIC_ICON_OPTIONS.find((option) => option.key === iconKey) ?? METRIC_ICON_OPTIONS[0]!;
}

function ReportMetricIcon({ className, iconKey }: { className?: string; iconKey: string }) {
  const Icon = getMetricIconOption(iconKey).Icon;
  return <Icon className={className} />;
}

function normalizeBlock(value: unknown): ReportBlock | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id, createId());
  const showFrame = asBoolean(value.showFrame, true);
  const span = asSpan(value.span);
  const width = asWidth(value.width);

  if (value.type === "text") {
    return {
      id,
      body: asString(value.body),
      showFrame,
      span,
      title: asString(value.title, "Texto"),
      type: "text",
      width,
    };
  }

  if (value.type === "metric") {
    const source = asSource(value.source);
    const fieldKey = asString(value.fieldKey, source === "manual" ? "manual_value" : "");
    return {
      id,
      fieldKey,
      helper: asString(value.helper),
      icon: asString(value.icon, getDefaultMetricIcon(fieldKey)),
      label: asString(value.label, "Indicador"),
      showFrame,
      span,
      source,
      tone: asString(value.tone, "#2563eb"),
      type: "metric",
      value: asString(value.value, "0"),
      width,
    };
  }

  if (value.type === "image") {
    const source = asSource(value.source);
    const legacySrc = asString(value.src);
    const legacyCaption = asString(value.caption);
    const legacyMediaId = asString(value.mediaId);
    const images = Array.isArray(value.images)
      ? value.images.map((item, index) => normalizeImageItem(item, index)).filter((item): item is ReportImageItem => item !== null)
      : [];
    const normalizedImages = images.length || !legacySrc
      ? images
      : [
          createImageItem({
            caption: legacyCaption,
            mediaId: legacyMediaId,
            source,
            src: legacySrc,
          }),
        ];
    const firstImage = normalizedImages[0];

    return {
      id,
      caption: legacyCaption,
      format: asImageFormat(value.format),
      images: normalizedImages,
      mediaId: firstImage?.mediaId ?? legacyMediaId,
      showFrame,
      span,
      source: firstImage?.source ?? source,
      sourceMode: asImageSourceMode(value.sourceMode),
      src: firstImage?.src ?? legacySrc,
      title: asString(value.title, "Imagem"),
      type: "image",
      width,
    };
  }

  if (value.type === "list") {
    const items = Array.isArray(value.items)
      ? value.items.map((item, index) => normalizeListItem(item, index)).filter((item): item is ReportListItem => item !== null)
      : [];

    return {
      id,
      items,
      listKey: asString(value.listKey),
      mode: value.mode === "image" ? "image" : "text",
      showFrame,
      source: asSource(value.source),
      span,
      title: asString(value.title, "Lista"),
      type: "list",
      width,
    };
  }

  if (value.type === "funnel") {
    return {
      id,
      showFrame,
      span,
      source: asSource(value.source),
      stages: Array.isArray(value.stages)
        ? value.stages
            .filter(isRecord)
            .map((stage) => {
              const stageSource = asSource(stage.source);
              return {
                color: asString(stage.color, "#2563eb"),
                fieldKey: asString(stage.fieldKey, stageSource === "manual" ? "manual_value" : ""),
                helper: asString(stage.helper, "Etapa personalizada do relatório."),
                id: asString(stage.id, createId()),
                name: asString(stage.name, "Etapa"),
                source: stageSource,
                value: asString(stage.value, "0"),
              };
            })
        : [],
      title: asString(value.title, "Funil"),
      type: "funnel",
      width,
    };
  }

  if (value.type === "spacer") {
    return {
      id,
      lineColor: asString(value.lineColor, "#d4d4d8"),
      lineThickness: asNumber(value.lineThickness, 1, { max: 12, min: 1 }),
      showFrame,
      showLine: asBoolean(value.showLine, true),
      size: asNumber(value.size, 32, { max: 240, min: 8 }),
      span,
      title: asString(value.title, "Espaçamento"),
      type: "spacer",
      width,
    };
  }

  return null;
}

function createDefaultLayout(): ReportLayout {
  return {
    blocks: [],
    page: {
      columns: 3,
      header: {
        brand: "GSUCHOA",
        showLogo: true,
        subtitle: "",
        title: "Relatório",
      },
      orientation: "portrait",
      size: "A4",
      theme: "light",
    },
    version: 1,
  };
}

function normalizeLayout(value: unknown): ReportLayout {
  if (!isRecord(value)) {
    return createDefaultLayout();
  }

  const page = isRecord(value.page) ? value.page : {};
  const header = isRecord(page.header) ? page.header : {};

  return {
    blocks: Array.isArray(value.blocks)
      ? value.blocks.map((block) => normalizeBlock(block)).filter((block): block is ReportBlock => block !== null)
      : [],
    page: {
      columns: asColumns(page.columns),
      header: {
        brand: asString(header.brand, "GSUCHOA"),
        showLogo: asBoolean(header.showLogo, true),
        subtitle: asString(header.subtitle),
        title: asString(header.title, "Relatório"),
      },
      orientation: "portrait",
      size: "A4",
      theme: asTheme(page.theme),
    },
    version: 1,
  };
}

function createBlock(type: ReportBlock["type"], options: { listMode?: ReportListBlock["mode"] } = {}): ReportBlock {
  const id = createId();

  if (type === "metric") {
    return {
      id,
      fieldKey: "manual_value",
      helper: "Preenchido manualmente",
      icon: "bar-chart",
      label: "Indicador",
      showFrame: true,
      source: "manual",
      tone: "#2563eb",
      type,
      value: "0",
      width: "third",
    };
  }

  if (type === "image") {
    return {
      id,
      caption: "",
      format: "story",
      images: [],
      mediaId: "",
      showFrame: true,
      src: "",
      source: "manual",
      sourceMode: "gallery",
      title: "Criativo em destaque",
      type,
      width: "full",
    };
  }

  if (type === "list") {
    return {
      id,
      items: ["Resultado observado", "Próxima ação"].map((item, index) => createManualListItem(item, index)),
      listKey: "manual",
      mode: options.listMode ?? "text",
      showFrame: true,
      source: "manual",
      title: options.listMode === "image" ? "Destaques com imagens" : "Pontos principais",
      type,
      width: "full",
    };
  }

  if (type === "funnel") {
    return {
      id,
      showFrame: true,
      source: "manual",
      stages: [
        {
          color: "#2563eb",
          fieldKey: "manual_value",
          helper: "Volume inicial do funil.",
          id: createId(),
          name: "Mensagens",
          source: "manual",
          value: "0",
        },
        {
          color: "#14b8a6",
          fieldKey: "manual_value",
          helper: "Etapa intermediária do funil.",
          id: createId(),
          name: "Reuniões",
          source: "manual",
          value: "0",
        },
        {
          color: "#22c55e",
          fieldKey: "manual_value",
          helper: "Resultado final acompanhado.",
          id: createId(),
          name: "Fechamentos",
          source: "manual",
          value: "0",
        },
      ],
      title: "Funil de vendas",
      type,
      width: "full",
    };
  }

  if (type === "spacer") {
    return {
      id,
      lineColor: "#d4d4d8",
      lineThickness: 1,
      showFrame: false,
      showLine: true,
      size: 32,
      title: "Espaçamento",
      type,
      width: "full",
    };
  }

  return {
    id,
    body: "Escreva aqui a leitura do período e as próximas recomendações.",
    showFrame: true,
    title: "Análise",
    type: "text",
    width: "full",
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getTextLabel(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getBlockName(block: ReportBlock) {
  if (block.type === "metric") {
    return getTextLabel(block.label, "Card de número");
  }

  return "title" in block ? getTextLabel(block.title, "Bloco") : "Bloco";
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function setCompactDragPreview(event: DragEvent<HTMLElement>, label: string) {
  if (typeof document === "undefined") {
    return;
  }

  const preview = document.createElement("div");
  preview.textContent = label;
  preview.style.alignItems = "center";
  preview.style.background = "rgba(24, 24, 27, 0.96)";
  preview.style.border = "1px solid rgba(37, 99, 235, 0.55)";
  preview.style.borderRadius = "14px";
  preview.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.32)";
  preview.style.color = "#ffffff";
  preview.style.display = "flex";
  preview.style.font = "700 12px Inter, ui-sans-serif, system-ui, sans-serif";
  preview.style.height = "44px";
  preview.style.left = "-9999px";
  preview.style.maxWidth = "220px";
  preview.style.overflow = "hidden";
  preview.style.padding = "0 14px";
  preview.style.pointerEvents = "none";
  preview.style.position = "fixed";
  preview.style.textOverflow = "ellipsis";
  preview.style.top = "-9999px";
  preview.style.whiteSpace = "nowrap";
  preview.style.width = "190px";
  preview.style.zIndex = "9999";

  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, 18, 22);
  window.setTimeout(() => preview.remove(), 0);
}

function getLegacyColumnSpan(width: ReportBlockWidth, columns: ReportPageColumns) {
  if (width === "full") {
    return columns;
  }

  if (width === "half") {
    return Math.max(1, Math.ceil(columns / 2));
  }

  return 1;
}

function clampColumnSpan(span: number, columns: ReportPageColumns) {
  return Math.min(Math.max(1, span), columns);
}

function getColumnSpan(block: ReportBlock, columns: ReportPageColumns) {
  if (block.type === "funnel") {
    return columns;
  }

  if (block.type === "spacer") {
    return columns;
  }

  return clampColumnSpan(block.span ?? getLegacyColumnSpan(block.width, columns), columns);
}

function getPendingInsertSpan(block: PendingInsertBlock, columns: ReportPageColumns) {
  const nextBlock = createBlock(block.type, { listMode: block.listMode });
  return getColumnSpan(nextBlock, columns);
}

function getActiveDragSpan(
  blocks: ReportBlock[],
  draggedBlockId: string | null,
  draggedInsertBlock: PendingInsertBlock | null,
  columns: ReportPageColumns,
) {
  if (draggedInsertBlock) {
    return getPendingInsertSpan(draggedInsertBlock, columns);
  }

  const draggedBlock = blocks.find((block) => block.id === draggedBlockId);
  return draggedBlock ? getColumnSpan(draggedBlock, columns) : columns;
}

function getWidthFromSpan(span: number, columns: ReportPageColumns): ReportBlockWidth {
  if (span >= columns) {
    return "full";
  }

  if (span >= Math.ceil(columns / 2)) {
    return "half";
  }

  return "third";
}

function getSizeIcon(span: number, columns: ReportPageColumns) {
  const normalizedSpan = clampColumnSpan(span, columns);
  return (
    <span className="grid h-6 w-10 gap-0.5 rounded-md border border-current/20 p-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <span className={`rounded-sm ${index < normalizedSpan ? "bg-current" : "bg-current/15"}`} key={index} />
      ))}
    </span>
  );
}

function normalizeMetricField(source: Exclude<ReportBlockSource, "manual">, value: unknown): MetricField | null {
  if (!isRecord(value)) {
    return null;
  }

  const key = asString(value.key);
  const label = asString(value.label);

  if (!key || !label) {
    return null;
  }

  return {
    helper: asString(value.helper, `${SOURCE_LABELS[source]} - dados salvos do período`),
    icon: asString(value.icon, getDefaultMetricIcon(key)),
    key,
    label,
    source,
    tone: asString(value.tone, METRIC_FIELDS.find((field) => field.source === source)?.tone ?? "#2563eb"),
    value: asString(value.value, value.rawValue === null || value.rawValue === undefined ? "0" : String(value.rawValue)),
  };
}

function normalizeMediaItem(value: unknown): SnapshotMediaItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstNestedString(value, ["id", "sourceId", "source_id", "mediaId", "media_id"]);
  const src = getFirstNestedString(value, [
    "thumbnailUrl",
    "thumbnail_url",
    "imageUrl",
    "image_url",
    "mediaUrl",
    "media_url",
    "pictureUrl",
    "picture",
    "fullPicture",
    "full_picture",
    "previewUrl",
    "preview_url",
  ]);

  if (!id || !src) {
    return null;
  }

  const caption = asString(value.caption);
  const metrics = normalizeMediaMetrics(value.metrics);
  return {
    caption,
    id,
    label: caption || asString(value.contentType, "Publicação"),
    metrics,
    src,
  };
}

function normalizeSnapshotList(
  source: Exclude<ReportBlockSource, "manual">,
  value: unknown,
  imageLookup = new Map<string, string>(),
): SnapshotList | null {
  if (!isRecord(value)) {
    return null;
  }

  const key = asString(value.key);
  const label = asString(value.label);
  const items = Array.isArray(value.items)
    ? value.items.map((item, index) => normalizeListItem(item, index, imageLookup)).filter((item): item is ReportListItem => item !== null)
    : [];

  if (!key || !label || !items.length) {
    return null;
  }

  const hasImages = items.some((item) => item.imageUrl);

  return {
    items,
    key,
    kind: value.kind === "image" || hasImages ? "image" : "text",
    label,
    source,
  };
}

function normalizeDataSnapshot(value: unknown): ReportDataSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawSources = isRecord(value.sources) ? value.sources : {};
  const sources: ReportDataSnapshot["sources"] = {};
  const globalImageLookup = buildImageLookup(
    Object.values(rawSources).flatMap((source) => {
      if (!isRecord(source)) {
        return [];
      }

      const listItems = Array.isArray(source.lists)
        ? source.lists.flatMap((list) => (isRecord(list) && Array.isArray(list.items) ? list.items : []))
        : [];

      return [
        ...(Array.isArray(source.media) ? source.media : []),
        ...(Array.isArray(source.resources) ? source.resources : []),
        ...(Array.isArray(source.ads) ? source.ads : []),
        ...(Array.isArray(source.creatives) ? source.creatives : []),
        ...listItems,
      ];
    }),
  );

  (["meta_paid", "google_paid", "linkedin_paid", "meta_social", "linkedin_social"] as const).forEach((sourceKey) => {
    const source = rawSources[sourceKey];
    if (!isRecord(source)) {
      return;
    }

    const fallback = METRIC_FIELDS.find((field) => field.source === sourceKey);
    const imageLookup = new Map(globalImageLookup);
    sources[sourceKey] = {
      fields: Array.isArray(source.fields)
        ? source.fields.map((field) => normalizeMetricField(sourceKey, field)).filter((field): field is MetricField => field !== null)
        : [],
      label: asString(source.label, SOURCE_LABELS[sourceKey]),
      lists: Array.isArray(source.lists)
        ? source.lists.map((list) => normalizeSnapshotList(sourceKey, list, imageLookup)).filter((list): list is SnapshotList => list !== null)
        : [],
      media: Array.isArray(source.media)
        ? source.media.map((item) => normalizeMediaItem(item)).filter((item): item is SnapshotMediaItem => item !== null)
        : [],
      resources: Array.isArray(source.resources) ? source.resources : [],
      tone: asString(source.tone, fallback?.tone ?? "#2563eb"),
    };
  });

  return {
    errors: Array.isArray(value.errors)
      ? value.errors.map((error) => (isRecord(error) ? asString(error.message) : asString(error))).filter(Boolean)
      : [],
    generatedAt: asString(value.generatedAt) || null,
    sources,
  };
}

function hasUsableSnapshotData(snapshot: ReportDataSnapshot | null) {
  if (!snapshot) {
    return false;
  }

  return Object.values(snapshot.sources).some((source) =>
    Boolean(source && (source.fields.length || source.lists.length || source.media.length || source.resources.length)),
  );
}

function getMetricFieldsForSource(source: ReportBlockSource, snapshot?: ReportDataSnapshot | null) {
  if (source !== "manual") {
    const snapshotFields = snapshot?.sources[source]?.fields ?? [];
    if (snapshotFields.length) {
      return snapshotFields;
    }
  }

  return METRIC_FIELDS.filter((field) => field.source === source);
}

function findMetricField(source: ReportBlockSource, key: string, snapshot?: ReportDataSnapshot | null) {
  const fields = getMetricFieldsForSource(source, snapshot);
  return fields.find((field) => field.key === key) ?? fields[0] ?? METRIC_FIELDS[0];
}

function getSpanLabel(span: number, columns: ReportPageColumns) {
  if (span >= columns) {
    return "Inteiro";
  }

  return span === 1 ? "1 parte" : `${span} partes`;
}

function getImageFormatOption(format: ReportImageFormat) {
  return IMAGE_FORMAT_OPTIONS.find((option) => option.format === format) ?? IMAGE_FORMAT_OPTIONS[0]!;
}

function getDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getReportPageMaxWidth(columns: ReportPageColumns) {
  if (columns === 3) {
    return "64rem";
  }

  if (columns === 4) {
    return "56rem";
  }

  return "48rem";
}

function getSnapshotGalleryImages(snapshot: ReportDataSnapshot | null): SnapshotGalleryImage[] {
  if (!snapshot) {
    return [];
  }

  return (["meta_paid", "google_paid", "linkedin_paid", "meta_social", "linkedin_social"] as const).flatMap((source) =>
    (snapshot.sources[source]?.media ?? []).map((item) => ({
      ...item,
      source,
      sourceLabel: SOURCE_LABELS[source],
    })),
  );
}

function getSnapshotLists(snapshot: ReportDataSnapshot | null, mode?: ReportListBlock["mode"]) {
  if (!snapshot) {
    return [];
  }

  return (["meta_paid", "google_paid", "linkedin_paid", "meta_social", "linkedin_social"] as const)
    .flatMap((source) => snapshot.sources[source]?.lists ?? [])
    .filter((list) => !mode || list.kind === mode);
}

function isLikelyTruncatedText(value: string) {
  return value.includes("...") || value.includes("…");
}

function formatListSupportText(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "ad") {
    return "Anúncio";
  }

  if (normalizedValue === "adset") {
    return "Conjunto de anúncios";
  }

  if (normalizedValue === "campaign") {
    return "Campanha";
  }

  return value;
}

function formatListItemTitle(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "image") {
    return "Imagem";
  }

  if (normalizedValue === "carousel" || normalizedValue === "carrossel") {
    return "Carrossel";
  }

  if (normalizedValue === "reel" || normalizedValue === "reels") {
    return "Reels";
  }

  if (normalizedValue === "video") {
    return "Vídeo";
  }

  if (normalizedValue === "story" || normalizedValue === "stories") {
    return "Stories";
  }

  return value;
}

function getSnapshotListDisplayLabel(list: SnapshotList) {
  return LIST_LABEL_OVERRIDES[`${list.source}:${list.key}`] ?? list.label;
}

function normalizeListMatchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatchingSnapshotList(block: ReportListBlock, snapshotLists: SnapshotList[]) {
  if (block.source !== "manual") {
    return snapshotLists.find((list) => list.source === block.source && list.key === block.listKey) ?? null;
  }

  const itemIds = new Set(block.items.map((item) => item.id));
  const listByItemOverlap = snapshotLists.find((list) => list.items.some((item) => itemIds.has(item.id)));
  if (listByItemOverlap) {
    return listByItemOverlap;
  }

  const title = normalizeListMatchText(block.title);
  return snapshotLists.find((list) => {
    const label = normalizeListMatchText(getSnapshotListDisplayLabel(list));
    const rawLabel = normalizeListMatchText(list.label);
    return Boolean(label && title.includes(label)) || Boolean(rawLabel && title.includes(rawLabel));
  }) ?? null;
}

function mergeListItemWithSnapshot(currentItem: ReportListItem, snapshotItem: ReportListItem | undefined): ReportListItem {
  if (!snapshotItem) {
    return currentItem;
  }

  const nextItem = {
    ...currentItem,
    imageUrl: currentItem.imageUrl || snapshotItem.imageUrl,
    metrics: currentItem.metrics.length ? currentItem.metrics : snapshotItem.metrics,
    subtitle: formatListSupportText(
      currentItem.subtitle === "ad" || currentItem.subtitle === "adset" || currentItem.subtitle === "campaign"
        ? snapshotItem.subtitle || currentItem.subtitle
        : currentItem.subtitle || snapshotItem.subtitle,
    ),
    title: isLikelyTruncatedText(currentItem.title) && snapshotItem.title.length > currentItem.title.length
      ? snapshotItem.title
      : currentItem.title,
  };

  return nextItem.imageUrl === currentItem.imageUrl &&
    nextItem.metrics === currentItem.metrics &&
    nextItem.subtitle === currentItem.subtitle &&
    nextItem.title === currentItem.title
    ? currentItem
    : nextItem;
}

function hydrateLayoutListsFromSnapshot(layout: ReportLayout, snapshot: ReportDataSnapshot | null): ReportLayout {
  if (!snapshot) {
    return layout;
  }

  const snapshotLists = getSnapshotLists(snapshot);
  if (!snapshotLists.length) {
    return layout;
  }

  let changed = false;
  const nextBlocks = layout.blocks.map((block): ReportBlock => {
    if (block.type !== "list") {
      return block;
    }

    const snapshotList = findMatchingSnapshotList(block, snapshotLists);
    if (!snapshotList) {
      return block;
    }

    const snapshotItemsById = new Map(snapshotList.items.map((item) => [item.id, item] as const));
    const nextItems = block.items.map((item, index) => mergeListItemWithSnapshot(item, snapshotItemsById.get(item.id) ?? snapshotList.items[index]));
    const nextMode = snapshotList.kind === "image" ? "image" : block.mode;
    const blockChanged =
      nextMode !== block.mode ||
      snapshotList.key !== block.listKey ||
      snapshotList.source !== block.source ||
      nextItems.some((item, index) => item !== block.items[index]);

    if (blockChanged) {
      changed = true;
      return {
        ...block,
        items: nextItems,
        mode: nextMode,
        listKey: snapshotList.key,
        source: snapshotList.source,
        title: block.title || getSnapshotListDisplayLabel(snapshotList),
      };
    }

    return block;
  });

  return changed ? { ...layout, blocks: nextBlocks } : layout;
}

function getVisibleListItems(block: ReportListBlock) {
  return block.items.filter((item) => item.visible);
}

function getFilledListMetrics(item: ReportListItem) {
  return item.metrics.filter((metric) => metric.label.trim() && metric.value.trim());
}

function parseReportNumber(value: string) {
  const normalizedValue = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function toObjectiveFunnelStages(stages: ReportFunnelBlock["stages"]): PanelMetaObjectiveFunnelStage[] {
  return stages.map((stage) => ({
    color: stage.color,
    helper: stage.helper || "Etapa personalizada do relatório.",
    label: stage.name,
    rawValue: parseReportNumber(stage.value),
    value: stage.value,
  }));
}

function EditorSection({
  children,
  id,
  isOpen,
  onToggle,
  title,
}: {
  children: ReactNode;
  id: EditorSectionKey;
  isOpen: boolean;
  onToggle: (id: EditorSectionKey) => void;
  title: string;
}) {
  return (
    <section className="border-b border-outline-variant/10 px-3 py-2 last:border-b-0">
      <button
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all ${
          isOpen
            ? "border-primary/35 bg-primary/10 shadow-[0_12px_26px_rgba(37,99,235,0.12)]"
            : "border-outline-variant/10 bg-surface-container-high/35 hover:border-primary/25 hover:bg-surface-container-high/60"
        }`}
        onClick={() => onToggle(id)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-bold uppercase tracking-[0.24em] text-primary">{title}</span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            {isOpen ? "Aberto" : "Fechado"}
          </span>
        </span>
        <span className="flex shrink-0 items-center">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl border transition-all ${
              isOpen
                ? "rotate-180 border-primary/20 bg-primary/12 text-primary"
                : "border-outline-variant/12 bg-surface-container-high text-on-surface-variant group-hover:text-primary"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 px-1 pb-2 pt-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ReportDropPlaceholder({
  columns,
  span,
  surface,
  theme = "light",
}: {
  columns?: ReportPageColumns;
  span?: number;
  surface: "canvas" | "list";
  theme?: ReportPageTheme;
}) {
  if (surface === "canvas") {
    return (
      <div
        aria-hidden="true"
        className={`report-drop-placeholder pointer-events-none min-h-24 rounded-2xl border-2 border-dashed ${
          theme === "dark"
            ? "border-blue-300/70 bg-blue-400/12"
            : "border-blue-500/70 bg-blue-50"
        }`}
        style={{ gridColumn: `span ${span ?? columns ?? 1} / span ${span ?? columns ?? 1}` }}
      >
        <div className="h-full rounded-[inherit] bg-primary/10" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="report-drop-placeholder pointer-events-none h-12 rounded-xl border-2 border-dashed border-primary/70 bg-primary/10"
    />
  );
}

function RichTextToolbarButton({
  children,
  isActive,
  label,
  onClick,
}: {
  children: ReactNode;
  isActive?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-on-surface transition-colors ${
        isActive
          ? "border-primary bg-primary text-white"
          : "border-outline-variant/14 bg-surface-container-high/50 hover:border-primary/30 hover:text-primary"
      }`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function RichTextEditor({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const editor = useEditor({
    content: bodyToEditorHtml(value),
    editorProps: {
      attributes: {
        class:
          "min-h-44 rounded-b-2xl bg-surface-container-high/35 px-4 py-3 text-sm leading-6 text-on-surface outline-none",
      },
    },
    extensions: [StarterKit],
    immediatelyRender: false,
    onUpdate: ({ editor: nextEditor }) => onChange(nextEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = bodyToEditorHtml(value);
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  const runCommand = (command: (editor: Editor) => void) => {
    if (!editor) {
      return;
    }

    command(editor);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/14">
      <div className="flex flex-wrap items-center gap-1 border-b border-outline-variant/10 bg-surface-container-high/70 p-2">
        <RichTextToolbarButton
          isActive={editor?.isActive("bold")}
          label="Negrito"
          onClick={() => runCommand((nextEditor) => nextEditor.chain().focus().toggleBold().run())}
        >
          <Bold className="h-4 w-4" />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          isActive={editor?.isActive("italic")}
          label="Itálico"
          onClick={() => runCommand((nextEditor) => nextEditor.chain().focus().toggleItalic().run())}
        >
          <Italic className="h-4 w-4" />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          isActive={editor?.isActive("strike")}
          label="Tachado"
          onClick={() => runCommand((nextEditor) => nextEditor.chain().focus().toggleStrike().run())}
        >
          <Strikethrough className="h-4 w-4" />
        </RichTextToolbarButton>
        <span className="mx-1 h-6 w-px bg-outline-variant/14" />
        <RichTextToolbarButton
          isActive={editor?.isActive("bulletList")}
          label="Lista"
          onClick={() => runCommand((nextEditor) => nextEditor.chain().focus().toggleBulletList().run())}
        >
          <List className="h-4 w-4" />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          isActive={editor?.isActive("orderedList")}
          label="Lista numerada"
          onClick={() => runCommand((nextEditor) => nextEditor.chain().focus().toggleOrderedList().run())}
        >
          <ListOrdered className="h-4 w-4" />
        </RichTextToolbarButton>
      </div>
      <EditorContent className="report-rich-text-editor" editor={editor} />
    </div>
  );
}

export default function ClientReportEditorPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { token } = usePanelAuth();
  const toast = useToast();
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [report, setReport] = useState<PanelClientReportRecord | null>(null);
  const [layout, setLayout] = useState<ReportLayout>(createDefaultLayout());
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedInsertBlock, setDraggedInsertBlock] = useState<PendingInsertBlock | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const [openSections, setOpenSections] = useState<Record<EditorSectionKey, boolean>>({
    blocks: false,
    insert: true,
    settings: false,
  });
  const [openListItemIds, setOpenListItemIds] = useState<Record<string, boolean>>({});
  const [openImageItemIds, setOpenImageItemIds] = useState<Record<string, boolean>>({});
  const [openFunnelStageIds, setOpenFunnelStageIds] = useState<Record<string, boolean>>({});
  const [imagePropertyTab, setImagePropertyTab] = useState<ReportImagePropertyTab>("images");
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedBlock = useMemo(
    () => layout.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [layout.blocks, selectedBlockId],
  );
  const dataSnapshot = useMemo(() => normalizeDataSnapshot(report?.dataSnapshot), [report?.dataSnapshot]);
  const snapshotGalleryImages = useMemo(() => getSnapshotGalleryImages(dataSnapshot), [dataSnapshot]);
  const snapshotTextLists = useMemo(() => getSnapshotLists(dataSnapshot, "text"), [dataSnapshot]);
  const snapshotImageLists = useMemo(() => getSnapshotLists(dataSnapshot, "image"), [dataSnapshot]);
  const hasUsableSnapshot = hasUsableSnapshotData(dataSnapshot);
  const hasSnapshotWarning = Boolean(
    report && (!hasUsableSnapshot && (!dataSnapshot || report.dataSnapshotStatus !== "ready")),
  );
  const hasPartialSnapshot = Boolean(report && hasUsableSnapshot && report.dataSnapshotStatus === "partial");

  const loadReport = useCallback(async () => {
    if (!token || !reportId) {
      return;
    }

    setIsLoading(true);
    try {
      const nextReport = await getPanelClientReportById(token, reportId);
      const nextSnapshot = normalizeDataSnapshot(nextReport.dataSnapshot);
      const nextLayout = hydrateLayoutListsFromSnapshot(normalizeLayout(nextReport.layout), nextSnapshot);
      setReport(nextReport);
      setLayout(nextLayout);
      setSelectedBlockId(null);
    } catch (error) {
      toast.error({
        title: "Falha ao abrir relatório",
        description: error instanceof Error ? error.message : "Não foi possível carregar o editor.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportId, toast, token]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsImageGalleryOpen(false);
      setSelectedBlockId(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateBlock = useCallback((blockId: string, patch: Partial<ReportBlock>) => {
    setLayout((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === blockId ? ({ ...block, ...patch } as ReportBlock) : block,
      ),
    }));
  }, []);

  const addBlock = useCallback((type: ReportBlock["type"], options?: { listMode?: ReportListBlock["mode"] }) => {
    const block = createBlock(type, options);
    setLayout((current) => ({
      ...current,
      blocks: [...current.blocks, block],
    }));
    setSelectedBlockId(block.id);
  }, []);

  const insertBlock = useCallback((
    insertBlock: PendingInsertBlock,
    targetBlockId?: string,
    position: "after" | "before" = "after",
  ) => {
    const block = createBlock(insertBlock.type, { listMode: insertBlock.listMode });

    setLayout((current) => {
      if (!targetBlockId) {
        return {
          ...current,
          blocks: [...current.blocks, block],
        };
      }

      const targetIndex = current.blocks.findIndex((item) => item.id === targetBlockId);

      if (targetIndex < 0) {
        return {
          ...current,
          blocks: [...current.blocks, block],
        };
      }

      const nextBlocks = [...current.blocks];
      nextBlocks.splice(targetIndex + (position === "after" ? 1 : 0), 0, block);

      return {
        ...current,
        blocks: nextBlocks,
      };
    });

    setSelectedBlockId(block.id);
  }, []);

  const updateImageBlockImages = useCallback((
    block: ReportImageBlock,
    images: ReportImageItem[],
    patch: Partial<ReportImageBlock> = {},
  ) => {
    const firstImage = images[0];
    updateBlock(block.id, {
      caption: firstImage?.caption ?? "",
      images,
      mediaId: firstImage?.mediaId ?? "",
      source: firstImage?.source ?? "manual",
      src: firstImage?.src ?? "",
      ...patch,
    } as Partial<ReportBlock>);
  }, [updateBlock]);

  const updateImageItem = useCallback((block: ReportImageBlock, imageId: string, patch: Partial<ReportImageItem>) => {
    const images = block.images.map((image) => (image.id === imageId ? { ...image, ...patch } : image));
    updateImageBlockImages(block, images);
  }, [updateImageBlockImages]);

  const updateListItem = useCallback((block: ReportListBlock, itemId: string, patch: Partial<ReportListItem>) => {
    updateBlock(block.id, {
      items: block.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    } as Partial<ReportBlock>);
  }, [updateBlock]);

  const updateListItemMetric = useCallback((
    block: ReportListBlock,
    itemId: string,
    index: number,
    patch: Partial<ReportListItem["metrics"][number]>,
  ) => {
    updateBlock(block.id, {
      items: block.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const metrics = item.metrics.length ? item.metrics : [{ label: "", value: "" }];
        return {
          ...item,
          metrics: metrics.map((metric, metricIndex) => (metricIndex === index ? { ...metric, ...patch } : metric)),
        };
      }),
    } as Partial<ReportBlock>);
  }, [updateBlock]);

  const addListItemMetric = useCallback((block: ReportListBlock, itemId: string) => {
    updateBlock(block.id, {
      items: block.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          metrics: [...item.metrics, { label: "", value: "" }],
        };
      }),
    } as Partial<ReportBlock>);
  }, [updateBlock]);

  const removeListItemMetric = useCallback((block: ReportListBlock, itemId: string, index: number) => {
    updateBlock(block.id, {
      items: block.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          metrics: item.metrics.filter((_, metricIndex) => metricIndex !== index),
        };
      }),
    } as Partial<ReportBlock>);
  }, [updateBlock]);

  const addListItem = useCallback((block: ReportListBlock) => {
    const item = createManualListItem("", block.items.length);
    updateBlock(block.id, {
      items: [...block.items, item],
      listKey: block.source === "manual" ? block.listKey : "custom",
      source: "manual",
    } as Partial<ReportBlock>);
    setOpenListItemIds((current) => ({ ...current, [item.id]: true }));
  }, [updateBlock]);

  const removeListItem = useCallback((block: ReportListBlock, itemId: string) => {
    updateBlock(block.id, {
      items: block.items.filter((item) => item.id !== itemId),
    } as Partial<ReportBlock>);
    setOpenListItemIds((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }, [updateBlock]);

  const toggleListItemOpen = useCallback((itemId: string) => {
    setOpenListItemIds((current) => ({ ...current, [itemId]: !current[itemId] }));
  }, []);

  const toggleImageItemOpen = useCallback((imageId: string) => {
    setOpenImageItemIds((current) => ({ ...current, [imageId]: !current[imageId] }));
  }, []);

  const toggleFunnelStageOpen = useCallback((stageId: string) => {
    setOpenFunnelStageIds((current) => ({ ...current, [stageId]: !current[stageId] }));
  }, []);

  const updateListItemImageFromFile = useCallback((block: ReportListBlock, itemId: string, file: File | null) => {
    if (!file) {
      return;
    }

    void readFileAsDataUrl(file).then((imageUrl) => {
      updateListItem(block, itemId, { imageUrl });
    });
  }, [updateListItem]);

  const addUploadedImages = useCallback((block: ReportImageBlock, files: File[]) => {
    if (!files.length) {
      return;
    }

    void Promise.all(files.map((file) => readFileAsDataUrl(file).then((src) => createImageItem({
      caption: file.name,
      showMetrics: false,
      source: "manual",
      src,
    })))).then((newImages) => {
      updateImageBlockImages(block, [...block.images, ...newImages], { sourceMode: "upload" });
    });
  }, [updateImageBlockImages]);

  const toggleGalleryImage = useCallback((block: ReportImageBlock, item: SnapshotGalleryImage) => {
    const isSelected = block.images.some((image) => image.source === item.source && image.mediaId === item.id);
    const nextImages = isSelected
      ? block.images.filter((image) => !(image.source === item.source && image.mediaId === item.id))
      : [
          ...block.images,
          createImageItem({
            caption: item.caption,
            mediaId: item.id,
            metrics: item.metrics,
            showMetrics: item.metrics.length > 0,
            source: item.source,
            src: item.src,
          }),
        ];

    updateImageBlockImages(block, nextImages, { sourceMode: "gallery" });
  }, [updateImageBlockImages]);

  const removeBlock = useCallback((blockId: string) => {
    setLayout((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId),
    }));
    setSelectedBlockId((current) => (current === blockId ? null : current));
  }, []);

  useEffect(() => {
    const handleDeleteSelectedBlock = (event: KeyboardEvent) => {
      if (
        !selectedBlockId ||
        isImageGalleryOpen ||
        isEditableKeyboardTarget(event.target) ||
        (event.key !== "Delete" && event.key !== "Backspace")
      ) {
        return;
      }

      event.preventDefault();
      removeBlock(selectedBlockId);
    };

    window.addEventListener("keydown", handleDeleteSelectedBlock);
    return () => window.removeEventListener("keydown", handleDeleteSelectedBlock);
  }, [isImageGalleryOpen, removeBlock, selectedBlockId]);

  const reorderBlock = useCallback((
    sourceBlockId: string,
    targetBlockId: string,
    position: "after" | "before" = "before",
  ) => {
    if (sourceBlockId === targetBlockId) {
      return;
    }

    setLayout((current) => {
      const sourceIndex = current.blocks.findIndex((block) => block.id === sourceBlockId);
      const originalTargetIndex = current.blocks.findIndex((block) => block.id === targetBlockId);

      if (sourceIndex < 0 || originalTargetIndex < 0) {
        return current;
      }

      const nextBlocks = [...current.blocks];
      const [block] = nextBlocks.splice(sourceIndex, 1);
      const targetIndex = nextBlocks.findIndex((nextBlock) => nextBlock.id === targetBlockId);

      if (targetIndex < 0) {
        return current;
      }

      nextBlocks.splice(targetIndex + (position === "after" ? 1 : 0), 0, block);

      return {
        ...current,
        blocks: nextBlocks,
      };
    });
  }, []);

  const handleDrop = useCallback((targetBlockId: string) => {
    if (draggedInsertBlock) {
      insertBlock(
        draggedInsertBlock,
        dropIndicator?.blockId ?? targetBlockId,
        dropIndicator?.position ?? "before",
      );
    } else
    if (draggedBlockId) {
      reorderBlock(
        draggedBlockId,
        dropIndicator?.blockId ?? targetBlockId,
        dropIndicator?.position ?? "before",
      );
    }
    setDraggedBlockId(null);
    setDraggedInsertBlock(null);
    setDropIndicator(null);
  }, [draggedBlockId, draggedInsertBlock, dropIndicator, insertBlock, reorderBlock]);

  const handleDropOnSurface = useCallback((surface: "canvas" | "list") => {
    if (draggedInsertBlock) {
      insertBlock(
        draggedInsertBlock,
        dropIndicator?.surface === surface ? dropIndicator.blockId : undefined,
        dropIndicator?.surface === surface ? dropIndicator.position : "after",
      );
    } else if (draggedBlockId && dropIndicator?.surface === surface) {
      reorderBlock(draggedBlockId, dropIndicator.blockId, dropIndicator.position);
    }

    setDraggedBlockId(null);
    setDraggedInsertBlock(null);
    setDropIndicator(null);
  }, [draggedBlockId, draggedInsertBlock, dropIndicator, insertBlock, reorderBlock]);

  const handleDragStart = useCallback((event: DragEvent<HTMLElement>, block: ReportBlock) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", block.id);
    setCompactDragPreview(event, `${getBlockName(block)} · ${getSpanLabel(getColumnSpan(block, layout.page.columns), layout.page.columns)}`);
    setDraggedBlockId(block.id);
    setDraggedInsertBlock(null);
    setSelectedBlockId(block.id);
  }, [layout.page.columns]);

  const handleInsertDragStart = useCallback((
    event: DragEvent<HTMLElement>,
    block: PendingInsertBlock,
    label: string,
  ) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", `new:${block.type}`);
    setCompactDragPreview(event, `Adicionar ${label}`);
    setDraggedBlockId(null);
    setDraggedInsertBlock(block);
    setSelectedBlockId(null);
  }, []);

  const handleDragOverBlock = useCallback((
    event: DragEvent<HTMLElement>,
    targetBlockId: string,
    surface: "canvas" | "list",
  ) => {
    event.preventDefault();

    if ((!draggedBlockId && !draggedInsertBlock) || draggedBlockId === targetBlockId) {
      setDropIndicator(null);
      return;
    }

    const targetBounds = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < targetBounds.top + targetBounds.height / 2 ? "before" : "after";

    setDropIndicator((current) => {
      if (
        current?.blockId === targetBlockId &&
        current.position === position &&
        current.surface === surface
      ) {
        return current;
      }

      return { blockId: targetBlockId, position, surface };
    });
  }, [draggedBlockId, draggedInsertBlock]);

  const handleDragEnd = useCallback(() => {
    setDraggedBlockId(null);
    setDraggedInsertBlock(null);
    setDropIndicator(null);
  }, []);

  const updatePageColumns = useCallback((columns: ReportPageColumns) => {
    setLayout((current) => ({
      ...current,
      page: {
        ...current.page,
        columns,
      },
    }));
  }, []);

  const toggleSection = useCallback((id: EditorSectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }, []);

  const updateReportTitle = useCallback((title: string) => {
    setReport((current) => (current ? { ...current, title } : current));
  }, []);

  const updatePageHeader = useCallback((patch: Partial<ReportLayout["page"]["header"]>) => {
    setLayout((current) => ({
      ...current,
      page: {
        ...current.page,
        header: {
          ...current.page.header,
          ...patch,
        },
      },
    }));
  }, []);

  const updateReportPeriod = async (field: "periodStart" | "periodEnd", value: string) => {
    if (!token || !report) {
      return;
    }

    const nextPeriodStart = field === "periodStart" ? value || null : getDateInputValue(report.periodStart) || null;
    const nextPeriodEnd = field === "periodEnd" ? value || null : getDateInputValue(report.periodEnd) || null;

    setReport((current) => (current ? { ...current, [field]: value || null } : current));
    setIsRefreshingData(true);
    try {
      const nextReport = await updatePanelClientReport(token, report.id, {
        periodEnd: nextPeriodEnd,
        periodStart: nextPeriodStart,
      });
      setReport(nextReport);
      toast.success({
        title: "Período atualizado",
        description: "Os dados do relatório foram buscados para o novo recorte.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar período",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o recorte agora.",
      });
    } finally {
      setIsRefreshingData(false);
    }
  };

  const applyMetricField = useCallback((block: ReportMetricBlock, field: MetricField) => {
    updateBlock(block.id, {
      fieldKey: field.key,
      helper: field.helper,
      icon: field.icon ?? getDefaultMetricIcon(field.key),
      label: field.label,
      source: field.source,
      tone: field.tone,
      value: field.value,
    } as Partial<ReportBlock>);
  }, [updateBlock]);

  const refreshDataSnapshot = async () => {
    if (!token || !report) {
      return;
    }

    setIsRefreshingData(true);
    try {
      const nextReport = await refreshPanelClientReportDataSnapshot(token, report.id);
      const nextSnapshot = normalizeDataSnapshot(nextReport.dataSnapshot);
      setReport(nextReport);
      setLayout((current) => hydrateLayoutListsFromSnapshot(current, nextSnapshot));
      toast.success({
        title: "Dados atualizados",
        description: "O pacote das APIs foi salvo para esse relatório.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao buscar dados",
        description: error instanceof Error ? error.message : "Não foi possível consultar as APIs agora.",
      });
    } finally {
      setIsRefreshingData(false);
    }
  };

  const saveLayout = async () => {
    if (!token || !report) {
      return;
    }

    setIsSaving(true);
    try {
      const savedReport = await updatePanelClientReport(token, report.id, {
        layout: layout as unknown as Record<string, unknown>,
        title: report.title,
      });
      setReport(savedReport);
      setLayout(normalizeLayout(savedReport.layout));
      toast.success({
        title: "Relatório salvo",
        description: "A personalização foi atualizada.",
      });
    } catch (error) {
      toast.error({
        title: "Falha ao salvar relatório",
        description: error instanceof Error ? error.message : "Não foi possível salvar o layout.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFunnelStage = (block: ReportFunnelBlock, stageId: string, patch: Partial<ReportFunnelBlock["stages"][number]>) => {
    updateBlock(block.id, {
      stages: block.stages.map((stage) => (stage.id === stageId ? { ...stage, ...patch } : stage)),
    } as Partial<ReportBlock>);
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="panel-card h-full animate-pulse rounded-[1.75rem] border" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="panel-card grid min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border transition-[grid-template-columns] duration-300 ease-out"
        style={{
          gridTemplateColumns: selectedBlock ? "18rem minmax(0, 1fr) 20rem" : "18rem minmax(0, 1fr) 0rem",
        }}
      >
        <aside className="flex min-h-0 flex-col border-r border-outline-variant/10">
          <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          <EditorSection
            id="settings"
            isOpen={openSections.settings}
            onToggle={toggleSection}
            title="Configuração"
          >
            <div className="grid grid-cols-2 gap-2">
              <AppInput
                label="Início"
                onChange={(event) => void updateReportPeriod("periodStart", event.target.value)}
                type="date"
                value={getDateInputValue(report?.periodStart ?? null)}
              />
              <AppInput
                label="Fim"
                onChange={(event) => void updateReportPeriod("periodEnd", event.target.value)}
                type="date"
                value={getDateInputValue(report?.periodEnd ?? null)}
              />
            </div>

            {hasSnapshotWarning ? (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-xs font-black text-on-surface">Dados das APIs não salvos.</p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                      Busque os dados do período para preencher fontes automaticamente.
                    </p>
                  </div>
                </div>
                <button
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRefreshingData}
                  onClick={() => void refreshDataSnapshot()}
                  type="button"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingData ? "animate-spin" : ""}`} />
                  {isRefreshingData ? "Buscando..." : "Buscar dados"}
                </button>
              </div>
            ) : null}

            {hasPartialSnapshot ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/6 p-3">
                <p className="text-xs font-black text-on-surface">Dados parcialmente salvos</p>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  Algumas fontes responderam e já podem ser usadas. Tente atualizar se precisar completar.
                </p>
                <button
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 px-3 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRefreshingData}
                  onClick={() => void refreshDataSnapshot()}
                  type="button"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingData ? "animate-spin" : ""}`} />
                  Atualizar fontes
                </button>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-semibold text-on-surface">Tamanho da página</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { columns: 3 as const, label: "Grande" },
                  { columns: 4 as const, label: "Média" },
                  { columns: 5 as const, label: "Pequena" },
                ].map((option) => (
                  <button
                    className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors ${
                      layout.page.columns === option.columns
                        ? "border-primary bg-primary text-white"
                        : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                    }`}
                    key={option.columns}
                    onClick={() => updatePageColumns(option.columns)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-on-surface">Tema</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Claro", theme: "light" as const },
                  { label: "Escuro", theme: "dark" as const },
                ].map((option) => (
                  <button
                    className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors ${
                      layout.page.theme === option.theme
                        ? "border-primary bg-primary text-white"
                        : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                    }`}
                    key={option.theme}
                    onClick={() =>
                      setLayout((current) => ({
                        ...current,
                        page: {
                          ...current.page,
                          theme: option.theme,
                        },
                      }))}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

          </EditorSection>

          <EditorSection
            id="insert"
            isOpen={openSections.insert}
            onToggle={toggleSection}
            title="Adicionar bloco"
          >
            <div className="grid gap-2">
              {[
                { icon: Type, label: "Texto", type: "text" as const },
                { icon: BarChart3, label: "Card de número", type: "metric" as const },
                { icon: ImagePlus, label: "Imagem", type: "image" as const },
                { icon: List, label: "Lista", type: "list" as const, listMode: "text" as const },
                { icon: Sparkles, label: "Funil", type: "funnel" as const },
                { icon: Minus, label: "Espaçamento", type: "spacer" as const },
              ].map((item) => (
                <button
                  className="panel-card-muted inline-flex cursor-grab items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary active:cursor-grabbing"
                  draggable
                  key={`${item.type}-${item.label}`}
                  onDragEnd={handleDragEnd}
                  onDragStart={(event) => handleInsertDragStart(
                    event,
                    { type: item.type, ...("listMode" in item ? { listMode: item.listMode } : {}) },
                    item.label,
                  )}
                  type="button"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.label}
                </button>
              ))}
            </div>
          </EditorSection>

          <EditorSection
            id="blocks"
            isOpen={openSections.blocks}
            onToggle={toggleSection}
            title="Blocos"
          >
            <div
              className="space-y-2"
              onDragOver={(event) => {
                if (draggedBlockId || draggedInsertBlock) {
                  event.preventDefault();
                }
              }}
              onDrop={() => handleDropOnSurface("list")}
            >
              {layout.blocks.length ? layout.blocks.map((block) => (
                <Fragment key={block.id}>
                  {dropIndicator?.surface === "list" &&
                  dropIndicator.blockId === block.id &&
                  dropIndicator.position === "before" ? (
                    <ReportDropPlaceholder surface="list" />
                  ) : null}
                  <button
                    className={`flex w-full cursor-grab items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all active:cursor-grabbing ${
                      selectedBlockId === block.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                    } ${draggedBlockId === block.id ? "scale-[0.98] opacity-45" : ""}`}
                    draggable
                    onClick={() => setSelectedBlockId(block.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(event: DragEvent<HTMLButtonElement>) => handleDragOverBlock(event, block.id, "list")}
                    onDragStart={(event) => handleDragStart(event, block)}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleDrop(block.id);
                    }}
                    type="button"
                  >
                    <GripVertical className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{getBlockName(block)}</span>
                    {getSizeIcon(getColumnSpan(block, layout.page.columns), layout.page.columns)}
                  </button>
                  {dropIndicator?.surface === "list" &&
                  dropIndicator.blockId === block.id &&
                  dropIndicator.position === "after" ? (
                    <ReportDropPlaceholder surface="list" />
                  ) : null}
                </Fragment>
              )) : (
                <p className="text-sm leading-relaxed text-on-surface-variant">Adicione blocos para começar.</p>
              )}
            </div>
          </EditorSection>
          </div>
          <div className="shrink-0 border-t border-outline-variant/10 bg-surface-container-low/95 p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="panel-card-muted inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => navigate("/painel/relatorios-clientes")}
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving || !report}
                onClick={() => void saveLayout()}
                type="button"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "..." : "Salvar"}
              </button>
            </div>
          </div>
        </aside>

        <main
          className="min-h-0 min-w-0 overflow-y-auto bg-surface-container-low/40 p-4"
          onClick={() => setSelectedBlockId(null)}
        >
          <div className="overflow-x-auto">
            <div
              className={`mx-auto min-h-[70rem] w-full px-14 py-12 shadow-2xl transition-[max-width] ${
                layout.page.theme === "dark" ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"
              }`}
              style={{ maxWidth: getReportPageMaxWidth(layout.page.columns) }}
            >
              <header className={`border-b pb-8 ${layout.page.theme === "dark" ? "border-white/15" : "border-neutral-200"}`}>
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <input
                      aria-label="Título do cabeçalho"
                      className={`block w-full rounded-lg bg-transparent px-0 py-0 text-xs font-bold uppercase outline-none transition-colors placeholder:text-current/35 focus:bg-primary/5 focus:px-2 focus:ring-2 focus:ring-primary/25 ${
                        layout.page.theme === "dark" ? "text-white/55" : "text-neutral-500"
                      }`}
                      onChange={(event) => updatePageHeader({ title: event.target.value })}
                      placeholder="Relatório"
                      value={layout.page.header.title}
                    />
                    <input
                      aria-label="Nome do relatório"
                      className={`mt-2 block w-full rounded-lg bg-transparent px-0 py-0 text-3xl font-black outline-none transition-colors placeholder:text-current/25 focus:bg-primary/5 focus:px-2 focus:ring-2 focus:ring-primary/25 ${
                        layout.page.theme === "dark" ? "text-white" : "text-neutral-950"
                      }`}
                      onChange={(event) => updateReportTitle(event.target.value)}
                      placeholder="Nome do relatório"
                      value={report?.title ?? ""}
                    />
                    <input
                      aria-label="Subtítulo do cabeçalho"
                      className={`mt-2 block w-full rounded-lg bg-transparent px-0 py-0 text-sm outline-none transition-colors placeholder:text-current/35 focus:bg-primary/5 focus:px-2 focus:ring-2 focus:ring-primary/25 ${
                        layout.page.theme === "dark" ? "text-white/55" : "text-neutral-500"
                      }`}
                      onChange={(event) => updatePageHeader({ subtitle: event.target.value })}
                      placeholder={report?.client.name || "Cliente"}
                      value={layout.page.header.subtitle}
                    />
                  </div>
                  {layout.page.header.showLogo ? (
                    <div className="flex shrink-0 items-center gap-3">
                      <LogoIconAnimated animated={false} className="h-9 w-auto" decorative />
                      <input
                        aria-label="Marca do cabeçalho"
                        className="w-32 rounded-lg bg-transparent px-0 py-0 text-sm font-black tracking-[0.18em] outline-none transition-colors placeholder:text-current/30 focus:bg-primary/5 focus:px-2 focus:ring-2 focus:ring-primary/25"
                        onChange={(event) => updatePageHeader({ brand: event.target.value })}
                        placeholder="GSUCHOA"
                        value={layout.page.header.brand}
                      />
                    </div>
                  ) : null}
                </div>
              </header>

              <section
                className="mt-8 grid gap-4"
                onDragOver={(event) => {
                  if (draggedBlockId || draggedInsertBlock) {
                    event.preventDefault();
                  }
                }}
                onDrop={() => handleDropOnSurface("canvas")}
                style={{ gridTemplateColumns: `repeat(${layout.page.columns}, minmax(0, 1fr))` }}
              >
                {layout.blocks.length ? layout.blocks.map((block, index) => {
                  const blockSpan = getColumnSpan(block, layout.page.columns);
                  const placeholderSpan = getActiveDragSpan(
                    layout.blocks,
                    draggedBlockId,
                    draggedInsertBlock,
                    layout.page.columns,
                  );
                  const hasFrame = block.showFrame !== false;
                  const frameClasses = hasFrame
                    ? selectedBlockId === block.id
                      ? layout.page.theme === "dark"
                        ? "border border-blue-400 bg-blue-500/15 p-5"
                        : "border border-blue-500 bg-blue-50 p-5"
                      : layout.page.theme === "dark"
                        ? "border border-white/12 bg-white/6 p-5 hover:border-blue-300"
                        : "border border-neutral-200 bg-white p-5 hover:border-blue-300"
                    : selectedBlockId === block.id
                      ? "border border-transparent bg-transparent p-0 before:pointer-events-none before:absolute before:-inset-3 before:rounded-2xl before:border before:border-blue-500 before:bg-blue-50/55"
                      : "border border-transparent bg-transparent p-0";

                  return (
                    <Fragment key={block.id}>
                      {dropIndicator?.surface === "canvas" &&
                      dropIndicator.blockId === block.id &&
                      dropIndicator.position === "before" ? (
                        <ReportDropPlaceholder
                          columns={layout.page.columns}
                          span={placeholderSpan}
                          surface="canvas"
                          theme={layout.page.theme}
                        />
                      ) : null}
                      <article
                        className={`group relative rounded-2xl transition-all ${frameClasses} ${draggedBlockId === block.id ? "scale-[0.985] opacity-45" : ""}`}
                        draggable
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        onDragEnd={handleDragEnd}
                        onDragOver={(event: DragEvent<HTMLElement>) => handleDragOverBlock(event, block.id, "canvas")}
                        onDragStart={(event) => handleDragStart(event, block)}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleDrop(block.id);
                        }}
                        style={{ gridColumn: `span ${blockSpan} / span ${blockSpan}` }}
                      >
                    <div className="absolute right-3 top-3 z-10 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex cursor-grab items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-500 shadow-sm">
                        <GripVertical className="h-3.5 w-3.5" />
                        {index + 1}
                      </span>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm transition-colors hover:bg-red-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeBlock(block.id);
                        }}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {block.type === "text" ? (
                      <div>
                        <h3 className={`pr-16 text-lg font-black ${layout.page.theme === "dark" ? "text-white" : "text-neutral-950"}`}>{block.title}</h3>
                        <div
                          className={`report-rich-text-content mt-3 text-sm leading-6 ${layout.page.theme === "dark" ? "text-white/75" : "text-neutral-700"}`}
                          dangerouslySetInnerHTML={{ __html: bodyToEditorHtml(block.body) }}
                        />
                      </div>
                    ) : null}

                    {block.type === "metric" ? (
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-xs font-bold uppercase ${layout.page.theme === "dark" ? "text-white/55" : "text-neutral-500"}`}>{block.label}</p>
                            <p className={`mt-3 text-4xl font-black ${layout.page.theme === "dark" ? "text-white" : "text-neutral-950"}`}>{block.value}</p>
                          </div>
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: block.tone }}>
                            <ReportMetricIcon className="h-5 w-5" iconKey={block.icon} />
                          </span>
                        </div>
                        {block.helper ? <p className={`mt-4 text-sm ${layout.page.theme === "dark" ? "text-white/60" : "text-neutral-500"}`}>{block.helper}</p> : null}
                      </div>
                    ) : null}

                    {block.type === "image" ? (
                      <figure>
                        <h3 className={`pr-16 text-lg font-black ${layout.page.theme === "dark" ? "text-white" : "text-neutral-950"}`}>{block.title}</h3>
                        {block.images.length ? (
                          <div
                            className="mt-4 grid gap-3"
                            style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(blockSpan, block.images.length))}, minmax(0, 1fr))` }}
                          >
                            {block.images.map((image, imageIndex) => {
                              const imageFormat = getImageFormatOption(block.format);
                              const visibleMetrics = getVisibleImageMetrics(image);
                              return (
                                <div key={image.id}>
                                  <div
                                    className={`overflow-hidden rounded-xl border ${
                                      layout.page.theme === "dark" ? "border-white/12 bg-white/8" : "border-neutral-200 bg-neutral-50"
                                    }`}
                                    style={imageFormat.ratio ? { aspectRatio: imageFormat.ratio } : undefined}
                                  >
                                    <img
                                      alt={image.caption || `${block.title} ${imageIndex + 1}`}
                                      className={`h-full w-full object-cover ${imageFormat.ratio ? "" : "max-h-[24rem]"}`}
                                      src={image.src}
                                    />
                                  </div>
                                  {image.caption ? (
                                    <figcaption className={`mt-2 text-sm font-bold italic ${layout.page.theme === "dark" ? "text-white/65" : "text-neutral-700"}`}>
                                      {image.caption}
                                    </figcaption>
                                  ) : null}
                                  {visibleMetrics.length ? (
                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                      {visibleMetrics.slice(0, 6).map((metric, metricIndex) => {
                                        const MetricIcon = getImageMetricIcon(metric.label);

                                        return (
                                          <div
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] leading-none ${
                                              layout.page.theme === "dark"
                                                ? "border-[#1877F2]/35 bg-[#1877F2]/12 text-white/75"
                                                : "border-[#1877F2]/25 bg-[#1877F2]/7 text-neutral-700"
                                            }`}
                                            key={`${image.id}-${metric.label}-${metricIndex}`}
                                          >
                                            <MetricIcon className="h-3 w-3 shrink-0 text-[#1877F2]" strokeWidth={2.35} />
                                            <span className={layout.page.theme === "dark" ? "font-black text-white" : "font-black text-neutral-900"}>
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
                        ) : (
                          <div className={`mt-4 flex h-48 items-center justify-center rounded-xl border border-dashed text-sm font-semibold ${
                            layout.page.theme === "dark" ? "border-white/20 bg-white/8 text-white/55" : "border-neutral-300 bg-neutral-50 text-neutral-500"
                          }`}>
                            Sem imagem
                          </div>
                        )}
                      </figure>
                    ) : null}

                    {block.type === "list" ? (
                      <div>
                        <h3 className={`pr-16 text-lg font-black ${layout.page.theme === "dark" ? "text-white" : "text-neutral-950"}`}>{block.title}</h3>
                        {block.mode === "image" ? (
                          <div className="mt-4 grid gap-3">
                            {getVisibleListItems(block).map((item) => (
                              <div className={`flex gap-3 rounded-xl border p-3 ${layout.page.theme === "dark" ? "border-white/12 bg-white/6" : "border-neutral-200 bg-neutral-50"}`} key={item.id}>
                                {item.imageUrl ? (
                                  <img alt={item.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" src={item.imageUrl} />
                                ) : (
                                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                                    <ImagePlus className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm font-bold ${layout.page.theme === "dark" ? "text-white" : "text-neutral-950"}`}>{item.title}</p>
                                  {item.subtitle ? <p className={`mt-1 text-xs ${layout.page.theme === "dark" ? "text-white/55" : "text-neutral-500"}`}>{item.subtitle}</p> : null}
                                  {getFilledListMetrics(item).length ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {getFilledListMetrics(item).map((metric) => (
                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none shadow-sm ${layout.page.theme === "dark" ? "border-blue-300/25 bg-blue-400/12 text-blue-50" : "border-blue-200 bg-blue-100/70 text-blue-700"}`} key={`${item.id}-${metric.label}`}>
                                          <span>{metric.label}: {metric.value}</span>
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ul className="mt-4 w-full space-y-2">
                            {getVisibleListItems(block).map((item) => (
                              <li className={`flex w-full gap-3 text-sm leading-6 ${layout.page.theme === "dark" ? "text-white/75" : "text-neutral-700"}`} key={item.id}>
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                <span className="min-w-0 flex-1 overflow-visible">
                                  <span className="block max-w-full font-semibold">{item.title}</span>
                                  {item.subtitle ? <span className="block text-xs opacity-70">{item.subtitle}</span> : null}
                                  {getFilledListMetrics(item).length ? (
                                    <span className="mt-2 flex flex-wrap gap-1.5">
                                      {getFilledListMetrics(item).map((metric) => (
                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none shadow-sm ${layout.page.theme === "dark" ? "border-blue-300/25 bg-blue-400/12 text-blue-50" : "border-blue-200 bg-blue-100/70 text-blue-700"}`} key={`${item.id}-${metric.label}`}>
                                          <span>{metric.label}: {metric.value}</span>
                                        </span>
                                      ))}
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}

                    {block.type === "funnel" ? (
                      <PanelMetaObjectiveFunnel
                        kpis={[]}
                        metrics={[]}
                        objectiveLabel={block.title}
                        stages={toObjectiveFunnelStages(block.stages)}
                      />
                    ) : null}

                    {block.type === "spacer" ? (
                      <div
                        className="flex items-center"
                        style={{ minHeight: block.size }}
                      >
                        {block.showLine ? (
                          <span
                            className="block rounded-full"
                            style={{
                              backgroundColor: block.lineColor,
                              height: block.lineThickness,
                              width: "100%",
                            }}
                          />
                        ) : null}
                      </div>
                    ) : null}
                      </article>
                      {dropIndicator?.surface === "canvas" &&
                      dropIndicator.blockId === block.id &&
                      dropIndicator.position === "after" ? (
                        <ReportDropPlaceholder
                          columns={layout.page.columns}
                          span={placeholderSpan}
                          surface="canvas"
                          theme={layout.page.theme}
                        />
                      ) : null}
                    </Fragment>
                  );
                }) : (
                  <div
                    className={`rounded-2xl border border-dashed py-16 text-center ${
                      layout.page.theme === "dark"
                        ? "border-white/25 bg-white/5 text-white/65"
                        : "border-neutral-300 bg-neutral-50/60 text-neutral-600"
                    }`}
                    style={{ gridColumn: `span ${layout.page.columns} / span ${layout.page.columns}` }}
                  >
                    <FileText className={`mx-auto h-10 w-10 ${layout.page.theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
                    <p className={`mt-4 text-sm font-semibold ${layout.page.theme === "dark" ? "text-white/70" : "text-neutral-700"}`}>
                      Nenhum bloco no relatório
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>

        <div
          className={`min-h-0 overflow-hidden border-l transition-colors duration-300 ease-out ${
            selectedBlock ? "border-outline-variant/10" : "border-transparent"
          }`}
        >
        <aside
          className={`h-full w-80 overflow-x-hidden overflow-y-auto p-4 transition-[opacity,transform] duration-300 ease-out ${
            selectedBlock
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-full opacity-0"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Propriedades</p>
              <h3 className="mt-2 truncate text-lg font-black text-on-surface">
                {selectedBlock ? getBlockName(selectedBlock) : "Nenhum bloco"}
              </h3>
            </div>
            {selectedBlock ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/14 text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  onClick={() => setSelectedBlockId(null)}
                  title="Fechar propriedades"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 transition-colors hover:bg-red-500/14"
                  onClick={() => removeBlock(selectedBlock.id)}
                  title="Excluir bloco"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          {selectedBlock ? (
            <div className="mt-6 space-y-6">
              {selectedBlock.type !== "funnel" && selectedBlock.type !== "spacer" ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-on-surface">Tamanho</p>
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${layout.page.columns}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: layout.page.columns }, (_, index) => index + 1).map((span) => (
                      <button
                        className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition-colors ${
                          getColumnSpan(selectedBlock, layout.page.columns) === span
                            ? "border-primary bg-primary text-white"
                            : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                        }`}
                        key={span}
                        onClick={() => updateBlock(selectedBlock.id, {
                          span,
                          width: getWidthFromSpan(span, layout.page.columns),
                        })}
                        type="button"
                      >
                        {getSizeIcon(span, layout.page.columns)}
                        <span>{getSpanLabel(span, layout.page.columns)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedBlock.type !== "spacer" ? (
                <div className="rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-3">
                  <AppCheckbox
                    checked={selectedBlock.showFrame !== false}
                    className="text-sm font-semibold text-on-surface"
                    label="Manter borda e espaçamento do card"
                    onChange={(event) =>
                      updateBlock(selectedBlock.id, {
                        showFrame: event.target.checked,
                      } as Partial<ReportBlock>)
                    }
                  />
                </div>
              ) : null}

              {selectedBlock.type === "spacer" ? (
                <div className="grid gap-6">
                  <AppInput
                    label="Nome"
                    onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.title}
                  />

                  <AppInput
                    label="Espaçamento"
                    min={8}
                    max={240}
                    onChange={(event) =>
                      updateBlock(selectedBlock.id, {
                        size: asNumber(event.target.value, selectedBlock.size, { max: 240, min: 8 }),
                      } as Partial<ReportBlock>)
                    }
                    type="number"
                    value={String(selectedBlock.size)}
                  />

                  <div className="rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-3">
                    <AppCheckbox
                      checked={selectedBlock.showLine}
                      className="text-sm font-semibold text-on-surface"
                      label="Usar como linha"
                      onChange={(event) => updateBlock(selectedBlock.id, { showLine: event.target.checked } as Partial<ReportBlock>)}
                    />
                  </div>

                  {selectedBlock.showLine ? (
                    <div className="grid gap-4">
                      <AppInput
                        label="Espessura da linha"
                        min={1}
                        max={12}
                        onChange={(event) =>
                          updateBlock(selectedBlock.id, {
                            lineThickness: asNumber(event.target.value, selectedBlock.lineThickness, { max: 12, min: 1 }),
                          } as Partial<ReportBlock>)
                        }
                        type="number"
                        value={String(selectedBlock.lineThickness)}
                      />
                      <AppColorInput
                        label="Cor da linha"
                        onChange={(lineColor) => updateBlock(selectedBlock.id, { lineColor } as Partial<ReportBlock>)}
                        value={selectedBlock.lineColor}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedBlock.type === "text" ? (
                <div className="grid gap-6">
                  <AppInput
                    label="Título"
                    onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.title}
                  />
                  <div>
                    <p className="mb-2 text-xs font-semibold text-on-surface">Texto</p>
                    <RichTextEditor
                      onChange={(body) => updateBlock(selectedBlock.id, { body } as Partial<ReportBlock>)}
                      value={selectedBlock.body}
                    />
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === "metric" ? (
                <div className="grid gap-6">
                  <AppSelect
                    label="Fonte"
                    onChange={(event) => {
                      const source = event.target.value as ReportBlockSource;
                      applyMetricField(selectedBlock, getMetricFieldsForSource(source, dataSnapshot)[0] ?? METRIC_FIELDS[0]);
                    }}
                    value={selectedBlock.source}
                  >
                    <option value="manual">Manual</option>
                    <option value="meta_paid">Meta Ads</option>
                    <option value="google_paid">Google Ads</option>
                    <option value="linkedin_paid">LinkedIn Ads</option>
                    <option value="meta_social">Meta social</option>
                    <option value="linkedin_social">LinkedIn</option>
                  </AppSelect>

                  {selectedBlock.source !== "manual" ? (
                    <AppSelect
                      label="Campo"
                      onChange={(event) => applyMetricField(selectedBlock, findMetricField(selectedBlock.source, event.target.value, dataSnapshot))}
                      value={selectedBlock.fieldKey || getMetricFieldsForSource(selectedBlock.source, dataSnapshot)[0]?.key}
                    >
                      {getMetricFieldsForSource(selectedBlock.source, dataSnapshot).map((field) => (
                        <option key={`${field.source}-${field.key}`} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </AppSelect>
                  ) : null}

                  <div className="rounded-2xl border border-outline-variant/12 bg-surface-container-high/40 p-3">
                    <p className="text-xs font-semibold text-on-surface-variant">Valor atual selecionado</p>
                    <p className="mt-1 text-2xl font-black text-on-surface">{selectedBlock.value}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{selectedBlock.helper}</p>
                  </div>

                  <AppInput
                    label="Nome"
                    onChange={(event) => updateBlock(selectedBlock.id, { label: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.label}
                  />
                  <AppInput
                    label="Valor editável"
                    onChange={(event) => updateBlock(selectedBlock.id, { value: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.value}
                  />
                  <div className="rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-3">
                    <p className="mb-2 text-xs font-semibold text-on-surface">Ícone</p>
                    <div className="grid grid-cols-4 gap-2">
                      {METRIC_ICON_OPTIONS.map((option) => (
                        <button
                          className={`flex h-12 items-center justify-center rounded-2xl border transition-colors ${
                            selectedBlock.icon === option.key
                              ? "border-primary bg-primary text-white"
                              : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                          }`}
                          key={option.key}
                          onClick={() => updateBlock(selectedBlock.id, { icon: option.key } as Partial<ReportBlock>)}
                          title={option.label}
                          type="button"
                        >
                          <option.Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <AppInput
                    label="Apoio"
                    onChange={(event) => updateBlock(selectedBlock.id, { helper: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.helper}
                  />
                  <AppColorInput
                    label="Cor"
                    onChange={(tone) => updateBlock(selectedBlock.id, { tone } as Partial<ReportBlock>)}
                    value={selectedBlock.tone}
                  />
                </div>
              ) : null}

              {selectedBlock.type === "image" ? (
                <div className="space-y-4">
                  <AppInput
                    label="Título"
                    onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.title}
                  />

                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-1">
                    {[
                      { key: "images" as const, label: "Imagem" },
                      { key: "format" as const, label: "Formato" },
                    ].map((tab) => (
                      <button
                        className={`rounded-xl px-3 py-2 text-xs font-black transition-colors ${
                          imagePropertyTab === tab.key
                            ? "bg-primary text-white"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                        }`}
                        key={tab.key}
                        onClick={() => setImagePropertyTab(tab.key)}
                        type="button"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {imagePropertyTab === "images" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className="panel-card-muted inline-flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-xs font-black text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          onClick={() => {
                            updateBlock(selectedBlock.id, { sourceMode: "gallery" } as Partial<ReportBlock>);
                            setIsImageGalleryOpen(true);
                          }}
                          type="button"
                        >
                          <ImagePlus className="h-4 w-4 text-primary" />
                          Galeria
                          <span className="text-[10px] font-semibold text-on-surface-variant">{snapshotGalleryImages.length} imagens</span>
                        </button>
                        <button
                          className="panel-card-muted inline-flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-xs font-black text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          onClick={() => {
                            updateBlock(selectedBlock.id, { sourceMode: "upload" } as Partial<ReportBlock>);
                            imageFileInputRef.current?.click();
                          }}
                          type="button"
                        >
                          <ImagePlus className="h-4 w-4 text-primary" />
                          PC
                          <span className="text-[10px] font-semibold text-on-surface-variant">Selecionar arquivos</span>
                        </button>
                      </div>
                      <input
                        accept="image/*"
                        className="hidden"
                        multiple
                        onChange={(event) => {
                          addUploadedImages(selectedBlock, Array.from(event.target.files ?? []));
                          event.currentTarget.value = "";
                        }}
                        ref={imageFileInputRef}
                        type="file"
                      />
                    </>
                  ) : null}

                  {imagePropertyTab === "format" ? (
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                      {IMAGE_FORMAT_OPTIONS.map((option) => (
                        <button
                          className={`rounded-2xl border p-3 text-left transition-colors ${
                            selectedBlock.format === option.format
                              ? "border-primary bg-primary text-white"
                              : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                          }`}
                          key={option.format}
                          onClick={() => updateBlock(selectedBlock.id, { format: option.format } as Partial<ReportBlock>)}
                          type="button"
                        >
                          <span
                            className={`mb-2 block rounded-lg border ${
                              selectedBlock.format === option.format ? "border-white/35 bg-white/20" : "border-outline-variant/20 bg-surface-container-high"
                            }`}
                            style={{
                              aspectRatio: option.ratio ?? "16 / 10",
                              width: option.format === "story" ? "2.25rem" : option.format === "portrait" ? "2.75rem" : "3.5rem",
                            }}
                          />
                          <span className="block text-xs font-black">{option.label}</span>
                          <span className={`mt-1 block text-[10px] leading-snug ${selectedBlock.format === option.format ? "text-white/75" : "text-on-surface-variant"}`}>
                            {option.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {imagePropertyTab === "images" ? (
                  <div className="rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Imagens selecionadas</p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {selectedBlock.images.length ? `${selectedBlock.images.length} imagem(ns) no bloco.` : "Adicione imagens por uma das origens acima."}
                        </p>
                      </div>
                    </div>

                    {selectedBlock.images.length ? (
                      <div className="space-y-3">
                        {selectedBlock.images.map((image, imageIndex) => {
                          const isImageOpen = Boolean(openImageItemIds[image.id]);

                          return (
                          <div className="overflow-hidden rounded-2xl border border-outline-variant/12 bg-surface-container-low/50" key={image.id}>
                            <button
                              aria-expanded={isImageOpen}
                              className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
                                isImageOpen ? "border-b border-outline-variant/10" : ""
                              } hover:text-primary`}
                              onClick={() => toggleImageItemOpen(image.id)}
                              type="button"
                            >
                              <img alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" src={image.src} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-black text-on-surface">Imagem {imageIndex + 1}</span>
                                <span className="mt-1 block truncate text-[11px] text-on-surface-variant">
                                  {SOURCE_LABELS[image.source]} · {image.visibleMetricKeys.length}/{image.metrics.length} métricas
                                </span>
                              </span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform ${isImageOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isImageOpen ? (
                            <div className="p-3">
                              <div className="flex gap-3">
                                <img alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" src={image.src} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-black text-on-surface">Imagem {imageIndex + 1}</p>
                                  <p className="mt-1 text-[11px] text-on-surface-variant">{SOURCE_LABELS[image.source]}</p>
                                  <div className="mt-2 flex gap-2">
                                  <a
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-outline-variant/14 text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                                    href={image.src}
                                    rel="noreferrer"
                                    target="_blank"
                                    title="Visualizar imagem"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </a>
                                  <button
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 transition-colors hover:bg-red-500/14"
                                    onClick={() => updateImageBlockImages(selectedBlock, selectedBlock.images.filter((item) => item.id !== image.id))}
                                    title="Remover imagem"
                                    type="button"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  </div>
                                </div>
                              </div>
                            <AppInput
                              label="Legenda"
                              onChange={(event) => updateImageItem(selectedBlock, image.id, { caption: event.target.value })}
                              value={image.caption}
                              wrapperClassName="mt-2"
                            />
                            {image.metrics.length ? (
                              <div className="mt-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                                    Métricas visíveis
                                  </p>
                                  <span className="text-[10px] font-bold text-on-surface-variant">
                                    {image.visibleMetricKeys.length}/{image.metrics.length}
                                  </span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {image.metrics.map((metric, metricIndex) => {
                                    const metricKey = getImageMetricKey(metric, metricIndex);
                                    const isVisible = image.visibleMetricKeys.includes(metricKey);
                                    const MetricIcon = getImageMetricIcon(metric.label);
                                    const nextMetricKeys = isVisible
                                      ? image.visibleMetricKeys.filter((key) => key !== metricKey)
                                      : [...image.visibleMetricKeys, metricKey];

                                    return (
                                      <button
                                        aria-label={`${isVisible ? "Ocultar" : "Mostrar"} ${metric.label}`}
                                        className={`relative inline-flex h-11 items-center justify-center rounded-2xl border transition-all ${
                                          isVisible
                                            ? "border-[#1877F2]/55 bg-[#1877F2]/12 text-[#1877F2] shadow-[inset_0_0_0_1px_rgba(24,119,242,0.18)]"
                                            : "border-outline-variant/12 bg-surface-container-high/45 text-on-surface-variant hover:border-[#1877F2]/35 hover:bg-[#1877F2]/8 hover:text-[#1877F2]"
                                        }`}
                                        key={metricKey}
                                        onClick={() =>
                                          updateImageItem(selectedBlock, image.id, {
                                            showMetrics: nextMetricKeys.length > 0,
                                            visibleMetricKeys: nextMetricKeys,
                                          })
                                        }
                                        title={`${metric.label}: ${metric.value}`}
                                        type="button"
                                      >
                                        <MetricIcon className="h-[18px] w-[18px]" strokeWidth={2.35} />
                                        {isVisible ? (
                                          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-surface-container-low bg-[#00A400] text-white shadow-sm">
                                            <Check className="h-2.5 w-2.5" />
                                          </span>
                                        ) : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                            </div>
                            ) : null}
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-outline-variant/18 px-3 py-5 text-center text-xs leading-relaxed text-on-surface-variant">
                        Nenhuma imagem selecionada.
                      </div>
                    )}
                  </div>
                  ) : null}
                </div>
              ) : null}

              {selectedBlock.type === "list" ? (
                <div className="grid min-w-0 gap-6 overflow-hidden">
                  <AppInput
                    label="Título"
                    onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.title}
                  />
                  <div className="min-w-0 overflow-hidden">
                    <p className="mb-2 text-xs font-semibold text-on-surface">Tipo de lista</p>
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                      {[
                        { label: "Somente lista", mode: "text" as const },
                        { label: "Com imagens", mode: "image" as const },
                      ].map((option) => (
                        <button
                          className={`min-w-0 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                            selectedBlock.mode === option.mode
                              ? "border-primary bg-primary text-white"
                              : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                          }`}
                          key={option.mode}
                          onClick={() => {
                            setLayout((current) => {
                              const currentBlock = current.blocks.find((block) => block.id === selectedBlock.id);
                              if (!currentBlock || currentBlock.type !== "list") {
                                return current;
                              }

                              const hydratedBlock = hydrateLayoutListsFromSnapshot(
                                { ...current, blocks: [currentBlock] },
                                dataSnapshot,
                              ).blocks[0];

                              return {
                                ...current,
                                blocks: current.blocks.map((block) =>
                                  block.id === selectedBlock.id && hydratedBlock?.type === "list"
                                    ? ({ ...hydratedBlock, mode: option.mode } as ReportBlock)
                                    : block,
                                ),
                              };
                            });
                          }}
                          type="button"
                        >
                          <span className="block truncate">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <AppSelect
                    label="Lista salva das APIs"
                    onChange={(event) => {
                      if (event.target.value === "manual") {
                        updateBlock(selectedBlock.id, {
                          listKey: "manual",
                          source: "manual",
                        } as Partial<ReportBlock>);
                        setOpenListItemIds({});
                        return;
                      }

                      const list = [...snapshotTextLists, ...snapshotImageLists].find(
                        (item) => `${item.source}:${item.key}` === event.target.value,
                      );
                      if (!list) {
                        return;
                      }

                      updateBlock(selectedBlock.id, {
                        items: list.items.map((item) => ({ ...item, visible: true })),
                        listKey: list.key,
                        mode: list.kind,
                        source: list.source,
                        title: selectedBlock.title || getSnapshotListDisplayLabel(list),
                      } as Partial<ReportBlock>);
                      setOpenListItemIds({});
                    }}
                    value={selectedBlock.source === "manual" ? "manual" : `${selectedBlock.source}:${selectedBlock.listKey}`}
                  >
                    <option value="manual">Manual do zero</option>
                    {[...snapshotTextLists, ...snapshotImageLists].map((list) => (
                      <option key={`${list.source}:${list.key}`} value={`${list.source}:${list.key}`}>
                        {SOURCE_LABELS[list.source]} - {getSnapshotListDisplayLabel(list)} ({list.items.length})
                      </option>
                    ))}
                  </AppSelect>
                  <div className="min-w-0 overflow-hidden">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Linhas da lista</p>
                        <p className="mt-1 text-[11px] text-on-surface-variant">
                          {getVisibleListItems(selectedBlock).length}/{selectedBlock.items.length} visíveis
                        </p>
                      </div>
                      <button
                        className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                        onClick={() => addListItem(selectedBlock)}
                        type="button"
                      >
                        Adicionar linha
                      </button>
                    </div>

                    <div className="min-w-0 space-y-3 overflow-hidden">
                      {selectedBlock.items.length ? selectedBlock.items.map((item, itemIndex) => {
                        const filledMetrics = getFilledListMetrics(item);
                        const firstFilledMetric = filledMetrics[0];
                        const isItemOpen = Boolean(openListItemIds[item.id]);
                        const rowSummary = [
                          item.visible ? "Visível" : "Oculta",
                          item.title || "Sem texto",
                          firstFilledMetric ? `${firstFilledMetric.label}: ${firstFilledMetric.value}` : null,
                          filledMetrics.length > 1 ? `+${filledMetrics.length - 1} badge(s)` : null,
                        ].filter(Boolean).join(" · ");

                        return (
                          <div className="panel-card-muted min-w-0 overflow-hidden rounded-2xl border p-3" key={item.id}>
                            <div className="flex min-w-0 items-center gap-2">
                              <AppCheckbox
                                checked={item.visible}
                                className="shrink-0"
                                title={item.visible ? "Ocultar no relatório" : "Mostrar no relatório"}
                                onChange={(event) => updateListItem(selectedBlock, item.id, { visible: event.target.checked })}
                              />
                              <button
                                aria-expanded={isItemOpen}
                                className="min-w-0 flex-1 overflow-hidden rounded-xl px-1 py-1 text-left transition-colors hover:text-primary"
                                onClick={() => toggleListItemOpen(item.id)}
                                type="button"
                              >
                                <span className="flex min-w-0 items-center gap-2 overflow-hidden">
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-black text-on-surface">Linha {itemIndex + 1}</span>
                                    <span className="block truncate text-[11px] text-on-surface-variant">
                                      {rowSummary}
                                    </span>
                                  </span>
                                  <ChevronDown className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform ${isItemOpen ? "rotate-180" : ""}`} />
                                </span>
                              </button>
                              <button
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 transition-colors hover:bg-red-500/14"
                                onClick={() => removeListItem(selectedBlock, item.id)}
                                title="Remover linha"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {isItemOpen ? (
                            <div className="mt-3 grid min-w-0 gap-3 overflow-hidden">
                              {selectedBlock.mode === "image" ? (
                                <div className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    {item.imageUrl ? (
                                      <img alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" src={item.imageUrl} />
                                    ) : (
                                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <ImagePlus className="h-5 w-5" />
                                      </span>
                                    )}
                                    <p className="min-w-0 flex-1 truncate text-xs font-bold text-on-surface">
                                      {item.imageUrl ? "Imagem selecionada" : "Sem imagem"}
                                    </p>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-outline-variant/14 px-3 text-xs font-bold text-on-surface transition-colors hover:border-primary/30 hover:text-primary">
                                        <ImagePlus className="h-3.5 w-3.5 text-primary" />
                                        Enviar
                                        <input
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(event) => {
                                            updateListItemImageFromFile(selectedBlock, item.id, event.target.files?.[0] ?? null);
                                            event.currentTarget.value = "";
                                          }}
                                          type="file"
                                        />
                                      </label>
                                      {item.imageUrl ? (
                                        <button
                                          className="inline-flex h-9 items-center rounded-xl border border-red-500/20 bg-red-500/8 px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/14"
                                          onClick={() => updateListItem(selectedBlock, item.id, { imageUrl: "" })}
                                          type="button"
                                        >
                                          Remover
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              <AppInput
                                label="Texto"
                                onChange={(event) => updateListItem(selectedBlock, item.id, { title: event.target.value })}
                                value={item.title}
                              />
                              <AppInput
                                label="Apoio"
                                onChange={(event) => updateListItem(selectedBlock, item.id, { subtitle: event.target.value })}
                                value={item.subtitle}
                              />
                              <div className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant/12 bg-surface-container-high/35 p-3">
                                <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-on-surface">Badges</p>
                                    <p className="mt-1 text-[11px] text-on-surface-variant">
                                      {filledMetrics.length}/{item.metrics.length} preenchidos
                                    </p>
                                  </div>
                                  <button
                                    className="shrink-0 rounded-xl border border-outline-variant/14 px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                                    onClick={() => addListItemMetric(selectedBlock, item.id)}
                                    type="button"
                                  >
                                    Adicionar
                                  </button>
                                </div>
                                {item.metrics.length ? (
                                  <div className="space-y-2">
                                    {item.metrics.map((metric, metricIndex) => (
                                      <div
                                        className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-end gap-2"
                                        key={`${item.id}-metric-${metricIndex}`}
                                      >
                                        <AppInput
                                          label="Nome"
                                          onChange={(event) =>
                                            updateListItemMetric(selectedBlock, item.id, metricIndex, { label: event.target.value })
                                          }
                                          value={metric.label}
                                        />
                                        <AppInput
                                          label="Valor"
                                          onChange={(event) =>
                                            updateListItemMetric(selectedBlock, item.id, metricIndex, { value: event.target.value })
                                          }
                                          value={metric.value}
                                        />
                                        <button
                                          aria-label="Remover badge"
                                          className="mb-0.5 inline-flex h-11 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 transition-colors hover:bg-red-500/14"
                                          onClick={() => removeListItemMetric(selectedBlock, item.id, metricIndex)}
                                          type="button"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="rounded-xl border border-dashed border-outline-variant/18 px-3 py-4 text-center text-xs text-on-surface-variant">
                                    Nenhum badge configurado.
                                  </p>
                                )}
                              </div>
                            </div>
                            ) : null}
                          </div>
                        );
                      }) : (
                        <div className="rounded-2xl border border-dashed border-outline-variant/18 px-3 py-6 text-center text-xs leading-relaxed text-on-surface-variant">
                          Nenhuma linha criada.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === "funnel" ? (
                <div className="grid gap-6">
                  <AppInput
                    label="Título"
                    onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value } as Partial<ReportBlock>)}
                    value={selectedBlock.title}
                  />
                  <div className="space-y-3">
                    {selectedBlock.stages.map((stage) => {
                      const stageSource = stage.source ?? "manual";
                      const stageFields = getMetricFieldsForSource(stageSource, dataSnapshot);
                      const isStageOpen = Boolean(openFunnelStageIds[stage.id]);

                      return (
                        <div className="panel-card-muted overflow-hidden rounded-2xl border" key={stage.id}>
                          <button
                            aria-expanded={isStageOpen}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                              isStageOpen ? "border-b border-outline-variant/10" : ""
                            } hover:text-primary`}
                            onClick={() => toggleFunnelStageOpen(stage.id)}
                            type="button"
                          >
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-black text-on-surface">
                                {stage.name || "Etapa do funil"}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-on-surface-variant">
                                {SOURCE_LABELS[stageSource]} · {stage.value || "0"}
                              </span>
                            </span>
                            <ChevronDown className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform ${isStageOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isStageOpen ? (
                          <div className="grid gap-3 p-4">
                            <AppSelect
                              label="Fonte do valor"
                              onChange={(event) => {
                                const source = event.target.value as ReportBlockSource;
                                if (source === "manual") {
                                  updateFunnelStage(selectedBlock, stage.id, {
                                    fieldKey: "manual_value",
                                    source,
                                  });
                                  return;
                                }

                                const field = getMetricFieldsForSource(source, dataSnapshot)[0] ?? METRIC_FIELDS[0];
                                updateFunnelStage(selectedBlock, stage.id, {
                                  color: field.tone,
                                  fieldKey: field.key,
                                  helper: field.helper,
                                  name: field.label,
                                  source,
                                  value: field.value,
                                });
                              }}
                              value={stageSource}
                            >
                              <option value="manual">Manual</option>
                              <option value="meta_paid">Meta Ads</option>
                              <option value="google_paid">Google Ads</option>
                              <option value="linkedin_paid">LinkedIn Ads</option>
                              <option value="meta_social">Meta social</option>
                              <option value="linkedin_social">LinkedIn</option>
                            </AppSelect>

                            {stageSource !== "manual" ? (
                              <AppSelect
                                label="Campo"
                                onChange={(event) => {
                                  const field = findMetricField(stageSource, event.target.value, dataSnapshot);
                                  updateFunnelStage(selectedBlock, stage.id, {
                                    color: field.tone,
                                    fieldKey: field.key,
                                    helper: field.helper,
                                    name: field.label,
                                    source: field.source,
                                    value: field.value,
                                  });
                                }}
                                value={stage.fieldKey || stageFields[0]?.key}
                              >
                                {stageFields.map((field) => (
                                  <option key={`${field.source}-${field.key}`} value={field.key}>
                                    {field.label}
                                  </option>
                                ))}
                              </AppSelect>
                            ) : null}

                            <AppInput
                              label="Nome"
                              onChange={(event) => updateFunnelStage(selectedBlock, stage.id, { name: event.target.value })}
                              value={stage.name}
                            />
                            <AppTextarea
                              label="Descrição"
                              onChange={(event) => updateFunnelStage(selectedBlock, stage.id, { helper: event.target.value })}
                              rows={2}
                              value={stage.helper}
                            />
                            <div className="grid gap-3">
                              <AppInput
                                label="Valor"
                                onChange={(event) => updateFunnelStage(selectedBlock, stage.id, { value: event.target.value })}
                                value={stage.value}
                              />
                              <AppColorInput
                                label="Cor"
                                onChange={(color) => updateFunnelStage(selectedBlock, stage.id, { color })}
                                value={stage.color}
                              />
                            </div>
                            {selectedBlock.stages.length > 1 ? (
                              <button
                                className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/14"
                                onClick={() =>
                                  updateBlock(selectedBlock.id, {
                                    stages: selectedBlock.stages.filter((item) => item.id !== stage.id),
                                  } as Partial<ReportBlock>)}
                                type="button"
                              >
                                Remover etapa
                              </button>
                            ) : null}
                          </div>
                          ) : null}
                        </div>
                      );
                    })}
                    <button
                      className="panel-card-muted w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                      onClick={() =>
                        updateBlock(selectedBlock.id, {
                          stages: [
                            ...selectedBlock.stages,
                            {
                              color: "#2563eb",
                              fieldKey: "manual_value",
                              helper: "Etapa personalizada do relatório.",
                              id: createId(),
                              name: "Nova etapa",
                              source: "manual",
                              value: "0",
                            },
                          ],
                        } as Partial<ReportBlock>)}
                      type="button"
                    >
                      Adicionar etapa
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
              Selecione um bloco no canvas ou adicione um novo item pela barra lateral.
            </p>
          )}
        </aside>
        </div>
      </div>
      {isImageGalleryOpen && selectedBlock?.type === "image" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="panel-card flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Galeria das APIs</p>
                <h3 className="mt-2 text-xl font-black text-on-surface">Selecionar imagens</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Clique nos criativos para adicionar ou remover do bloco.
                </p>
              </div>
              <button
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant/14 text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => setIsImageGalleryOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {snapshotGalleryImages.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {snapshotGalleryImages.map((item) => {
                    const isSelected = selectedBlock.images.some((image) => image.source === item.source && image.mediaId === item.id);

                    return (
                      <button
                        className={`group overflow-hidden rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-outline-variant/12 bg-surface-container-high/45 hover:border-primary/30"
                        }`}
                        key={`${item.source}-${item.id}`}
                        onClick={() => toggleGalleryImage(selectedBlock, item)}
                        type="button"
                      >
                        <div className="relative aspect-square overflow-hidden bg-surface-container-high">
                          <img
                            alt={item.label}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            src={item.src}
                          />
                          <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                            {item.sourceLabel}
                          </span>
                          <span className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                            isSelected ? "bg-primary text-white" : "bg-black/65 text-white"
                          }`}>
                            {isSelected ? "Adicionada" : "Adicionar"}
                          </span>
                        </div>
                        <div className="space-y-2 p-3">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug text-on-surface">
                            {item.label || "Imagem da API"}
                          </p>
                          {item.metrics.length ? (
                            <div className="flex flex-wrap gap-1">
                              {item.metrics.slice(0, 4).map((metric) => (
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/8 px-2.5 py-1 text-[10px] font-black text-on-surface"
                                  key={`${item.id}-${metric.label}`}
                                >
                                  <span className="text-primary">{metric.label}</span>
                                  <span>{metric.value}</span>
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-outline-variant/18 px-4 py-12 text-center text-sm leading-relaxed text-on-surface-variant">
                  Nenhuma imagem das APIs foi salva para esse período.
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 p-4">
              <p className="text-xs font-semibold text-on-surface-variant">
                {selectedBlock.images.length} imagem(ns) selecionada(s)
              </p>
              <button
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => setIsImageGalleryOpen(false)}
                type="button"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
