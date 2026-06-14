import { ProductCard } from "@/components/ProductCard";
import { productService } from "@/services/productService";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const query = await searchParams;
  const allProducts = await productService.getProducts();
  const products = query.type === "clearance" ? allProducts.filter((p) => p.type === "CLEARANCE") : allProducts;
  return (
    <div className="shell">
      <div className="page-hero"><span className="eyebrow">Explore deals</span><h1 className="page-title">함께 구매하세요</h1><p className="page-lead">참여자가 많아질수록 가격은 더 낮아집니다.</p></div>
      <div className="toolbar">
        <input className="field" placeholder="상품명 또는 판매자 검색" style={{ minWidth:260 }}/>
        {["전체","일반 공동구매","재고떨이","쿠폰 이벤트","마감 임박","할인율 높은순"].map((label,index)=><button className={`filter ${index === (query.type === "clearance" ? 2 : 0) ? "active":""}`} key={label}>{label}</button>)}
        <select className="field" defaultValue="urgent"><option value="urgent">마감 임박순</option><option>할인율 높은순</option><option>참여자 많은순</option><option>최신 등록순</option></select>
      </div>
      <div className="product-grid" style={{ paddingBottom:70 }}>{products.map((product)=><ProductCard key={product.id} product={product}/>)}</div>
    </div>
  );
}
