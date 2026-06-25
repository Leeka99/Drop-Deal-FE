export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PUBLIC_API_MODE !== "prod") {
    const { server } = await import("@/mocks/node");
    server.listen({ onUnhandledRequest: "bypass" });
  }
}
