import Link from "next/link";
import { Product } from "@/types/product";
import { discountRate, nextParticipants, nextPrice, won } from "@/utils/format";

export function ProductCard({ product }: { product: Product }) {
  const isGiveaway = product.type === "FREE_GIVEAWAY";
  const rate = discountRate(product);
  const maxParticipantsReached = product.currentParticipants >= product.maxParticipants;
  const maxDiscountReached = product.currentPrice <= product.minPrice;
  const canParticipate = product.status === "OPEN" && !maxParticipantsReached;
  const canDropFurther = !isGiveaway && canParticipate && !maxDiscountReached;

  const priceGuide = isGiveaway
    ? { title: "상품 가격 0원", description: product.giveaway?.fulfillmentMethods.includes("PICKUP") ? "택배 또는 매장 픽업" : "택배비만 결제" }
    : maxParticipantsReached
    ? { title: "최대 할인 · 마감", description: "최대 인원이 모두 참여했어요" }
    : maxDiscountReached && canParticipate
      ? { title: "최대 할인 적용 중", description: "지금이 기회! 참여하세요!" }
      : canDropFurther
        ? { title: won(nextPrice(product)), description: `${nextParticipants(product)}명 더 참여하면` }
        : { title: "공동구매 마감", description: "더 이상 참여할 수 없어요" };

  return (
    <Link className="product-card" href={`/products/${product.id}`}>
      <div className={`product-visual ${product.visual}`}>
        <div className="badges">
          {product.type === "CLEARANCE" && <span className="badge badge-clear">재고떨이</span>}
          {isGiveaway && <span className="badge badge-event">완전무료!</span>}
          {product.couponEvent && product.couponRate && <span className="badge badge-event">{product.couponRate}% 쿠폰 이벤트</span>}
          {product.status === "OPEN" && <span className="badge badge-live">LIVE</span>}
        </div>
        <span className="visual-icon">{product.icon}</span>
      </div>
      <div className="product-body">
        <span className="seller">{product.sellerName}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="price-line">{isGiveaway ? <span className="discount">무료나눔</span> : <span className="discount">{rate}%</span>}<strong>{isGiveaway ? "0원" : won(product.currentPrice)}</strong></div>
        {!isGiveaway && <del className="original">{won(product.originalPrice)}</del>}
        <div className={`card-next-price ${canDropFurther ? "" : "is-complete"}`}>
          <div>
            <span>{canDropFurther ? "다음 가격" : "가격 안내"}</span>
            <strong>{priceGuide.title}</strong>
          </div>
          <small>{priceGuide.description}</small>
        </div>
        <div className="metric"><span>{product.currentParticipants}명 참여 중</span><span>최대 {product.maxParticipants}명</span></div>
        <div className="progress"><span style={{ width: `${Math.min(100, product.currentParticipants / product.maxParticipants * 100)}%` }} /></div>
        <div className="card-foot">
          <span className="urgent">{isGiveaway && canParticipate ? "완전무료! 신청 가능" : maxParticipantsReached ? "최대 할인 · 마감" : maxDiscountReached && canParticipate ? "최대 할인 · 참여 가능" : canDropFurther ? `다음 할인까지 ${nextParticipants(product)}명` : "참여 마감"}</span>
          <span>{product.currentParticipants} / {product.maxParticipants}명</span>
        </div>
      </div>
    </Link>
  );
}
