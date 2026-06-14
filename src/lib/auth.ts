import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "buyer" | "seller";

export type Session = {
  role: UserRole;
  name: string;
};

export const getSession = async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const role = cookieStore.get("dropdeal_role")?.value;
  const name = cookieStore.get("dropdeal_name")?.value;

  if ((role !== "buyer" && role !== "seller") || !name) return null;
  return { role, name: decodeURIComponent(name) };
};

export const requireApprovedSeller = async () => {
  const session = await getSession();
  if (!session) redirect("/login?next=/seller/products");
  if (session.role !== "seller") redirect("/login?reason=seller");
  return session;
};
