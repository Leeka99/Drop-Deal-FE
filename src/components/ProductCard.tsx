import Link from "next/link";
import { Product } from "@/types/product";
import { discountRate, nextParticipants, nextPrice, won } from "@/utils/format";

export function ProductCard({ product }: { product: Product }) {
  const rate = discountRate(product);
  const canDropFurther =
    product.status === "OPEN" &&
    product.remainingStock > 0 &&
    product.currentParticipants < product.maxParticipants &&
    product.currentPrice > product.minPrice;
  const lowestPriceReached = product.currentPrice <= product.minPrice;

  return (
    <Link className="product-card" href={`/products/${product.id}`}>
      <div className={`product-visual ${product.visual}`}>
        <div className="badges">
          {product.type === "CLEARANCE" && <span className="badge badge-clear">재고떨이</span>}
          {product.couponEvent && <span className="badge badge-event">50% 쿠폰 이벤트</span>}
          {product.status === "OPEN" && <span className="badge badge-live">LIVE</span>}
        </div>
        <span className="visual-icon">{product.icon}</span>
      </div>
      <div className="product-body">
        <span className="seller">{product.sellerName}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="price-line"><span className="discount">{rate}%</span><strong>{won(product.currentPrice)}</strong></div>
        <del className="original">{won(product.originalPrice)}</del>
        <div className={`card-next-price ${canDropFurther ? "" : "is-complete"}`}>
          <div>
            <span>{canDropFurther ? "다음 가격" : "가격 안내"}</span>
            <strong>{canDropFurther ? won(nextPrice(product)) : lowestPriceReached ? "최저가 달성" : "공동구매 종료"}</strong>
          </div>
          <small>{canDropFurther ? `${nextParticipants(product)}명 더 참여하면` : lowestPriceReached ? "더 이상 내려가지 않아요" : "현재 가격으로 종료됐어요"}</small>
        </div>
        <div className="metric"><span>{product.currentParticipants}명 참여 중</span><span>최대 {product.maxParticipants}명</span></div>
        <div className="progress"><span style={{ width: `${Math.min(100, product.currentParticipants / product.maxParticipants * 100)}%` }} /></div>
        <div className="card-foot">
          <span className="urgent">{canDropFurther ? `다음 할인까지 ${nextParticipants(product)}명` : lowestPriceReached ? "최저가 달성" : product.status}</span>
          <span>재고 {product.remainingStock}개</span>
        </div>
      </div>
    </Link>
  );
}
