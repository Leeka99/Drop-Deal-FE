import { isMockMode } from "@/services/runtime";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && isMockMode()) {
    const { server } = await import("@/mocks/node");
    server.listen({ onUnhandledRequest: "bypass" });
  }
}
