import Link from "next/link";
import { SellerNav } from "@/components/SellerNav";
import { products } from "@/mocks/products";
import { won } from "@/utils/format";

export default function SellerProductsPage() {
  return <div className="seller-shell"><SellerNav/><div className="seller-content"><div className="section-head"><div><span className="eyebrow">Seller center</span><h1 className="page-title">공동구매 상품 관리</h1><p className="page-lead">실시간 참여, 가격, 재고 상태를 관리합니다.</p></div><Link className="btn btn-primary" href="/seller/products/new">새 상품 등록</Link></div><div className="table-wrap"><table><thead><tr><th>상품</th><th>상태</th><th>현재 참여</th><th>현재 가격</th><th>남은 재고</th><th>Q&A</th><th>관리</th></tr></thead><tbody>{products.slice(0,6).map((product)=><tr key={product.id}><td><b>{product.name}</b><br/><span className="seller">{product.type === "CLEARANCE" ? "재고떨이":"일반 공동구매"}</span></td><td><span className="badge badge-live">{product.status}</span></td><td>{product.currentParticipants} / {product.maxParticipants}명</td><td><b>{won(product.currentPrice)}</b></td><td>{product.remainingStock}개</td><td>{product.id % 3}건 미답변</td><td><button className="btn btn-soft">상세 보기</button></td></tr>)}</tbody></table></div></div></div>;
}
