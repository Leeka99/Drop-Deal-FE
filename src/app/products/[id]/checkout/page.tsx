import { getSession } from "@/lib/auth";
import { productService } from "@/services/productService";
import { CheckoutClient } from "@/components/CheckoutClient";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, session] = await Promise.all([
    productService.getProductById(Number(id)),
    getSession(),
  ]);
  const canParticipate = product.status === "OPEN" && product.currentParticipants < product.maxParticipants;

  return <CheckoutClient product={product} viewerRole={session?.role} canParticipate={canParticipate} />;
}
