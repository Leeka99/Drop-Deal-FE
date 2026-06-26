export type DataMode = "mock" | "prod";

export const getDataMode = (): DataMode => {
  const mode = process.env.NEXT_PUBLIC_API_MODE?.toLowerCase();
  if (mode === "mock") return "mock";
  if (mode === "prod" || mode === "api") return "prod";
  return process.env.NODE_ENV === "production" ? "prod" : "mock";
};

export const isMockMode = () => getDataMode() === "mock";

export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const resolveApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (baseUrl) return `${baseUrl}${normalizedPath}`;
  if (typeof window === "undefined" && isMockMode()) return `http://mock.dropdeal.local${normalizedPath}`;
  return normalizedPath;
};
