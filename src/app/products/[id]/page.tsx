import { ProductDetailLive } from "@/components/ProductDetailLive";
import { productService } from "@/services/productService";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await productService.getProductById(Number(id));
  return <ProductDetailLive initialProduct={product}/>;
}
