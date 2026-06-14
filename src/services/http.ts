import { resolveApiUrl } from "@/services/runtime";

type RequestOptions = RequestInit & {
  authToken?: string;
};

export async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(resolveApiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
