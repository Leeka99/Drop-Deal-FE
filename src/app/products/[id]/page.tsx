import { ProductDetailLive } from "@/components/ProductDetailLive";
import { getSession } from "@/lib/auth";
import { productService } from "@/services/productService";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, session] = await Promise.all([
    productService.getProductById(Number(id)),
    getSession(),
  ]);

  return <ProductDetailLive initialProduct={product} viewerRole={session?.role} />;
}
