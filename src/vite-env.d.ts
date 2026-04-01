/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PANEL_API_URL?: string;
  readonly VITE_PANEL_META_STATUS_PATH?: string;
  readonly VITE_PANEL_META_CONNECT_PATH?: string;
  readonly VITE_PANEL_META_EXCHANGE_PATH?: string;
  readonly VITE_PANEL_META_VALIDATE_PATH?: string;
  readonly VITE_PANEL_META_AD_ACCOUNTS_PATH?: string;
  readonly VITE_PANEL_META_CONNECTION_PATH?: string;
  readonly VITE_PANEL_GOOGLE_STATUS_PATH?: string;
  readonly VITE_PANEL_GOOGLE_CONNECT_PATH?: string;
  readonly VITE_PANEL_GOOGLE_EXCHANGE_PATH?: string;
  readonly VITE_PANEL_GOOGLE_VALIDATE_PATH?: string;
  readonly VITE_PANEL_GOOGLE_CUSTOMERS_PATH?: string;
  readonly VITE_PANEL_GOOGLE_CONNECTION_PATH?: string;
  readonly VITE_PANEL_GOOGLE_FILTER_CAMPAIGNS_PATH?: string;
  readonly VITE_PANEL_GOOGLE_FILTER_AD_GROUPS_PATH?: string;
  readonly VITE_PANEL_GOOGLE_FILTER_ADS_PATH?: string;
  readonly VITE_PANEL_GOOGLE_DASHBOARD_SUMMARY_PATH?: string;
  readonly VITE_PANEL_GOOGLE_DASHBOARD_TIMELINE_PATH?: string;
  readonly VITE_PANEL_GOOGLE_DASHBOARD_FUNNEL_PATH?: string;
  readonly VITE_PANEL_GOOGLE_DASHBOARD_TABLE_PATH?: string;
  readonly VITE_PANEL_META_FILTER_CAMPAIGNS_PATH?: string;
  readonly VITE_PANEL_META_FILTER_ADSETS_PATH?: string;
  readonly VITE_PANEL_META_FILTER_ADS_PATH?: string;
  readonly VITE_PANEL_META_DASHBOARD_SUMMARY_PATH?: string;
  readonly VITE_PANEL_META_DASHBOARD_TIMELINE_PATH?: string;
  readonly VITE_PANEL_META_DASHBOARD_FUNNEL_PATH?: string;
  readonly VITE_PANEL_META_DASHBOARD_TABLE_PATH?: string;
  readonly VITE_PANEL_PAID_MEDIA_CAMPAIGNS_PATH?: string;
  readonly VITE_PANEL_PAID_MEDIA_CAMPAIGN_DETAIL_PATH?: string;
  readonly VITE_PANEL_PAID_MEDIA_CAMPAIGN_SUMMARY_PATH?: string;
  readonly VITE_PANEL_PAID_MEDIA_CAMPAIGN_TIMELINE_PATH?: string;
  readonly VITE_PANEL_PAID_MEDIA_CAMPAIGN_FUNNEL_PATH?: string;
  readonly VITE_PANEL_PAID_MEDIA_CAMPAIGN_TABLE_PATH?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
