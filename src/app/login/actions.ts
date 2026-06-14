"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const demoAccounts = {
  "buyer@dropdeal.kr": { password: "buyer123", role: "buyer", name: "구매자 데모" },
  "seller@dropdeal.kr": { password: "seller123", role: "seller", name: "승인 판매자 데모" },
} as const;

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const account = demoAccounts[email as keyof typeof demoAccounts];

  if (!account || account.password !== password) {
    redirect(`/login?error=credentials${next.startsWith("/") ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  if (next.startsWith("/seller") && account.role !== "seller") {
    redirect("/login?reason=seller");
  }

  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };
  cookieStore.set("dropdeal_role", account.role, options);
  cookieStore.set("dropdeal_name", encodeURIComponent(account.name), options);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("dropdeal_role");
  cookieStore.delete("dropdeal_name");
  redirect("/");
}
