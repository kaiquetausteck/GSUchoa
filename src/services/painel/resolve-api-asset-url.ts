export function resolveApiAssetUrl(baseUrl: string, value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  if (
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://") ||
    normalizedValue.startsWith("data:") ||
    normalizedValue.startsWith("blob:")
  ) {
    return normalizedValue;
  }

  try {
    return new URL(normalizedValue, `${baseUrl.replace(/\/$/, "")}/`).toString();
  } catch {
    return normalizedValue;
  }
}
