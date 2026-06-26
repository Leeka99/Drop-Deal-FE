"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { couponPolicies, couponWinnerCount } from "@/utils/couponPolicy";
import { discountRate, nextParticipants, nextPrice, won } from "@/utils/format";

const reactionLabels = [
  "공감 가는 상품",
  "재참여 의사 있음",
  "가격 만족",
  "조금만 더 내려가면",
  "지금도 괜찮아요",
  "쿠폰 기대 중",
];

const initialFeeds = [
  "방금 1명이 공동구매에 참여했어요.",
  "다음 가격 하락까지 조금 남았어요.",
  "모두가 같은 가격을 보고 있어요.",
  "공동구매 성공 조건이 가까워졌어요.",
];

type Props = {
  initialProduct: Product;
  viewerRole?: "buyer" | "seller";
};

export function ProductDetailLive({ initialProduct, viewerRole }: Props) {
  const product = initialProduct;
  const [feeds, setFeeds] = useState(initialFeeds);
  const [selected, setSelected] = useState("");
  const [counts, setCounts] = useState([24, 18, 7, 11, 15, 9]);
  const [question, setQuestion] = useState("");


  const isSeller = viewerRole === "seller";
  const isGiveaway = product.type === "FREE_GIVEAWAY";
  const maxParticipantsReached = product.currentParticipants >= product.maxParticipants;
  const maxDiscountReached = product.currentPrice <= product.minPrice;
  const canParticipate = !isSeller && product.status === "OPEN" && !maxParticipantsReached;
  const couponPolicy = product.couponRate ? couponPolicies[product.couponRate] : null;
  const couponWinners = couponPolicy ? couponWinnerCount(product.currentParticipants, couponPolicy.winnerRate) : null;
  const rate = useMemo(() => discountRate(product), [product]);

  const currentStep = product.type === "FREE_GIVEAWAY"
    ? product.currentParticipants
    : product.type === "CLEARANCE"
    ? Math.min(product.currentParticipants, product.discountStepParticipants)
    : product.currentParticipants < product.minParticipants
      ? product.currentParticipants
      : (product.currentParticipants - product.minParticipants) % product.discountStepParticipants;
  const currentStepTarget = product.type === "FREE_GIVEAWAY"
    ? Math.max(1, product.maxParticipants)
    : product.type === "CLEARANCE"
    ? Math.max(1, product.discountStepParticipants)
    : product.currentParticipants < product.minParticipants
      ? Math.max(1, product.minParticipants)
      : Math.max(1, product.discountStepParticipants);
  const progress = Math.min(100, (currentStep / currentStepTarget) * 100);
  const couponLeft = Math.max(0, 50 - product.currentParticipants);

  const react = (label: string, index: number) => {
    if (selected === label) return;
    setCounts((prev) => prev.map((count, i) => (i === index ? count + 1 : count)));
    setSelected(label);
    setFeeds((prev) => [`${label} 반응이 추가됐어요.`, ...prev.slice(0, 5)]);
  };

  return (
    <>
      <div className="shell detail-grid">
        <div className={`detail-visual ${product.visual}`}>{product.icon}</div>
        <div>
          <div className="badges" style={{ position: "static" }}>
            {product.type === "CLEARANCE" && <span className="badge badge-clear">재고떨이</span>}
            {isGiveaway && <span className="badge badge-event">완전무료! 상품</span>}
            {product.couponEvent && product.couponRate && <span className="badge badge-event">{product.couponRate}% 쿠폰 이벤트</span>}
            <span className="badge badge-live">실시간 공동구매</span>
          </div>
          <p className="seller" style={{ marginTop: 18 }}>
            {product.sellerName} · ★ {product.rating} ({product.reviewCount})
          </p>
          <h1 className="detail-title">{product.name}</h1>
          <p className="page-lead">{product.description}</p>
          <div className="detail-price">
            {isGiveaway ? (
              <div className="price-line"><span className="discount">무료나눔</span><strong>상품 가격 0원</strong></div>
            ) : <>
            <del className="original">{won(product.originalPrice)}</del>
            <div className="price-line">
              <span className="discount">{rate}%</span>
              <strong>{won(product.currentPrice)}</strong>
            </div>
            <span className="seller">최저 가능가 {won(product.minPrice)}</span>
            </>}
          </div>
          <div className="detail-stat-grid">
            <div className="detail-stat"><span>현재 참여자</span><b>{product.currentParticipants} / {product.maxParticipants}명</b></div>
            <div className="detail-stat"><span>최대 참여 인원</span><b>{product.maxParticipants}명</b></div>
            <div className="detail-stat"><span>마감까지</span><b>05:42:18</b></div>
          </div>
          <div className="notice">
            {isGiveaway
              ? "상품 가격과 사이트 수수료는 0원입니다. 택배는 택배비만 결제하며, 매장 픽업 보증금 2,000원은 수령 완료 시 전액 반환됩니다."
              : "먼저 참여해도 손해 보지 않습니다. 최종 가격이 더 내려가면 차액은 자동 환불됩니다."}
          </div>
          {isGiveaway && product.giveaway && (
            <div className="panel" style={{ marginTop: 16 }}>
              <h3>수령 방법</h3>
              <p className="page-lead">{product.giveaway.reason}{product.giveaway.promotionalPurpose ? " · 가게 홍보 목적 포함" : ""}</p>
              {product.giveaway.fulfillmentMethods.includes("SHIPPING") && <div className="summary-row"><span>택배 수령</span><b>택배비 {won(product.giveaway.shippingFee ?? 0)}</b></div>}
              {product.giveaway.pickup && <>
                <div className="summary-row"><span>매장 직접 픽업</span><b>보증금 {won(product.giveaway.pickup.deposit)} · 수령 후 환불</b></div>
                <div className="summary-row"><span>픽업 장소</span><b>{product.giveaway.pickup.storeName} · {product.giveaway.pickup.address}</b></div>
              </>}
            </div>
          )}
          {!isGiveaway && (
          <div className="price-panel">
            <div className="price-next">
              <div>
                <span className="seller">현재 가격</span>
                <br />
                <b>{won(product.currentPrice)}</b>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="seller">{product.type === "CLEARANCE" ? maxDiscountReached ? "70% 할인 달성" : "70% 할인 도달가" : maxDiscountReached ? "최대 할인 상태" : "다음 가격"}</span>
                <br />
                <strong>{maxParticipantsReached ? "최대 할인 · 마감" : product.type === "CLEARANCE" ? maxDiscountReached ? "70% 할인 적용 중" : won(product.minPrice) : maxDiscountReached ? "최대 할인 적용 중" : won(nextPrice(product))}</strong>
              </div>
            </div>
            <b>
              {maxParticipantsReached
                ? "최대 인원이 모두 참여해 마감되었습니다."
                : product.type === "CLEARANCE" && product.currentParticipants < product.minParticipants
                  ? `최소 주문 인원까지 ${product.minParticipants - product.currentParticipants}명 남았습니다.`
                  : product.type === "CLEARANCE" && !maxDiscountReached
                    ? `총 재고의 70% 참여까지 ${product.discountStepParticipants - product.currentParticipants}명 남았습니다.`
                    : product.type === "CLEARANCE"
                      ? "총 재고의 70%가 참여해 70% 할인이 적용됐습니다."
                : maxDiscountReached
                  ? "지금이 기회! 최대 할인가로 참여하세요!"
                  : `${nextParticipants(product)}명만 더 참여하면 가격이 내려갑니다.`}
            </b>
            <div className="progress" style={{ height: 10 }}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="metric">
              <span>현재 참여 {product.currentParticipants}명</span>
              <span>최대 {product.maxParticipants}명</span>
            </div>
          </div>
          )}
          {isSeller ? (
            <div className="notice" style={{ marginTop: 16 }}>
              판매자 계정은 상품을 구경할 수 있지만 구매는 할 수 없습니다.
              <div className="hero-actions" style={{ marginTop: 12 }}>
                <Link className="btn btn-primary" href="/seller/sales">판매 내역 보기</Link>
                <Link className="btn btn-soft" href="/seller/products">판매자 센터로 이동</Link>
              </div>
            </div>
          ) : canParticipate ? (
            <Link className="btn btn-brand" style={{ width: "100%", marginTop: 16, padding: 16 }} href={`/products/${product.id}/checkout`}>
              {isGiveaway ? "완전무료! 상품 신청하기" : maxDiscountReached ? "최대 할인으로 지금 참여하기" : "현재가로 공동구매 참여하기"}
            </Link>
          ) : (
            <button className="btn btn-brand" style={{ width: "100%", marginTop: 16, padding: 16 }} disabled>
              최대 인원 도달 · 참여 마감
            </button>
          )}
        </div>
      </div>

      <section className="section section-soft">
        <div className="shell">
          <div className="content-grid">
            <div className="panel">
              <h3>실시간 참여 피드 <span className="badge badge-live">LIVE</span></h3>
              <div className="feed-list">
                {feeds.map((feed, index) => (
                  <div className="feed" key={`${feed}-${index}`}>
                    {feed}
                    <time>방금</time>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h3>공감 반응</h3>
              <p className="page-lead">참여자 반응을 바탕으로 상품 분위기를 확인해 보세요.</p>
              <div className="reactions" style={{ marginTop: 18 }}>
                {reactionLabels.map((label, index) => (
                  <button
                    key={label}
                    className={`reaction ${selected === label ? "selected" : ""}`}
                    onClick={() => react(label, index)}
                  >
                    {label} {counts[index]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {product.couponEvent && product.couponRate && couponPolicy && (
            <div className="coupon-box" style={{ marginBottom: 25 }}>
              <span className="eyebrow">Coupon event</span>
              <h3>공동구매 성공 시 {product.couponRate}% 할인 쿠폰 이벤트</h3>
              <p>
                {couponPolicy.target} · 최대 {won(couponPolicy.maxDiscountAmount)} 할인
                {couponWinners ? ` · 현재 참여 기준 ${couponWinners}명 추첨` : ""}. 쿠폰 이벤트 조건까지 <b>{couponLeft}명</b> 남았습니다.
              </p>
            </div>
          )}

          <div className="content-grid">
            <div className="panel">
              <h3>문의 Q&A</h3>
              <div className="qa">
                <b>Q. 유통기한은 어떤가요?</b>
                <p className="qa-answer">A. 상품별 상세 안내를 확인해 주세요.</p>
              </div>
              <div className="qa">
                <b>Q. 배송은 언제 시작되나요?</b>
                <p className="qa-answer">A. 공동구매 종료 후 순차 출고됩니다.</p>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <textarea
                  className="field"
                  maxLength={300}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="판매자에게 궁금한 점을 적어주세요."
                />
                <button className="btn btn-soft" onClick={() => setQuestion("")}>질문 등록</button>
              </div>
            </div>
            <div className="panel">
              <h3>구매 후기 <span className="seller">★ {product.rating} · {product.reviewCount}개</span></h3>
              <div className="qa">
                <b>★★★★★ 구매자 sun***</b>
                <p>가격이 내려가는 과정을 보니 구매하는 재미가 있습니다.</p>
              </div>
              <div className="qa">
                <b>★★★★☆ 구매자 min***</b>
                <p>차액 환불 안내가 명확해서 안심됐습니다.</p>
              </div>
              <button className="btn btn-soft" style={{ marginTop: 16 }}>후기 작성하기</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
