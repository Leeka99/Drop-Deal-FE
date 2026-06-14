export type DataMode = "mock" | "api";

export const getDataMode = (): DataMode => {
  const mode = process.env.NEXT_PUBLIC_API_MODE?.toLowerCase();
  return mode === "api" ? "api" : "mock";
};

export const isMockMode = () => getDataMode() === "mock";

export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const resolveApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};

