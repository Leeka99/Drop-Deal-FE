export type DataMode = "prod";

export const getDataMode = (): DataMode => "prod";

export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const resolveApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (baseUrl) return `${baseUrl}${normalizedPath}`;
  return normalizedPath;
};