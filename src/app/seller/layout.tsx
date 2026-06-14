import { requireApprovedSeller } from "@/lib/auth";

export default async function SellerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireApprovedSeller();
  return children;
}
