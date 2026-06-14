"use client";

import { FormEvent, useMemo, useState } from "react";
import { SellerNav } from "@/components/SellerNav";
import { clearanceReasons, giveawayReasons, productTypePolicy } from "@/constants/productPolicy";
import { ProductType } from "@/types/product";
import { couponPolicies, couponWinnerCount, recommendCoupon } from "@/utils/couponPolicy";
import { won } from "@/utils/format";
import { calculateProductPricing, calculateSalesForecast, MIN_GROUP_BUY_STOCK, MIN_ORIGINAL_PRICE } from "@/utils/productPricing";
import { calculateSettlement, commissionTiers, platformCommissionRate } from "@/utils/settlement";

export default function NewSellerProductPage() {
  const [type, setType] = useState<ProductType>("NORMAL");
  const [values, setValues] = useState({ original:"30000", stock:"50" });
  const [saved, setSaved] = useState(false);
  const [giveawayFulfillment, setGiveawayFulfillment] = useState({ shipping:true, pickup:true });
  const policy = productTypePolicy[type];
  const originalPrice = Math.max(MIN_ORIGINAL_PRICE, Number(values.original) || MIN_ORIGINAL_PRICE);
  const stock = Math.max(MIN_GROUP_BUY_STOCK, Number(values.stock) || MIN_GROUP_BUY_STOCK);
  const pricing = useMemo(
    () => calculateProductPricing(type, originalPrice, stock),
    [type, originalPrice, stock],
  );
  const steps = useMemo(() => {
    if (type === "FREE_GIVEAWAY") {
      return [
        { people:0, price:0, label:"완전무료! 나눔 시작" },
        { people:pricing.maxParticipants, price:0, label:"나눔 가능 수량" },
      ];
    }

    if (type === "CLEARANCE") {
      return [
        { people:0, price:pricing.startPrice, label:"50% 할인가 주문 시작" },
        { people:pricing.minParticipants, price:pricing.startPrice, label:"최소 주문 인원 충족" },
        { people:pricing.clearanceDeepDiscountParticipants, price:pricing.minPrice, label:"총 재고 70% 참여 · 70% 할인" },
      ];
    }

    const allSteps = [
      { people:0, price:originalPrice, label:"할인 시작 전" },
      { people:pricing.discountStartParticipants, price:pricing.startPrice, label:"첫 할인 시작" },
      ...Array.from(
        { length:pricing.stepCount },
        (_, index) => ({
          people:Math.min(pricing.maxParticipants, pricing.discountStartParticipants + (index + 1) * pricing.stepParticipants),
          price:Math.max(pricing.minPrice, pricing.startPrice - (index + 1) * pricing.stepAmount),
          label:`${index + 1}단계 추가 할인`,
        }),
      ),
    ];

    return [...new Map(allSteps.map((step) => [step.people, step])).values()];
  }, [pricing, originalPrice, type]);
  const estimate = useMemo(() => {
    const forecast = calculateSalesForecast({
      type,
      originalPrice,
      stock,
      minParticipants: pricing.minParticipants,
      pricing,
    });
    const grossAmount = forecast.expectedGrossAmount;
    const commissionRate = type === "FREE_GIVEAWAY" ? 0 : platformCommissionRate(grossAmount);
    return { grossAmount, commissionRate, ...forecast, ...calculateSettlement(grossAmount, commissionRate) };
  }, [originalPrice, pricing, stock, type]);
  const couponRecommendation = useMemo(() => recommendCoupon({
    type,
    participationRate: estimate.expectedSellThroughRate,
    maxDiscountReached: estimate.expectedFinalPrice <= pricing.minPrice,
  }), [estimate.expectedFinalPrice, estimate.expectedSellThroughRate, pricing.minPrice, type]);
  const recommendedCouponPolicy = couponRecommendation.rate ? couponPolicies[couponRecommendation.rate] : null;
  const expectedCouponWinners = recommendedCouponPolicy
    ? couponWinnerCount(estimate.expectedParticipants, recommendedCouponPolicy.winnerRate)
    : null;
  const commissionPercent = estimate.commissionRate * 100;
  const number = (key:keyof typeof values) => (event:React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [key]:event.target.value }));
  };
  const normalizeNumber = (key:keyof typeof values, minimum:number) => () => {
    setValues((current) => ({ ...current, [key]:String(Math.max(minimum, Number(current[key]) || minimum)) }));
  };
  const submit = (event:FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="seller-shell">
      <SellerNav/>
      <div className="seller-content">
        <span className="eyebrow">Create group deal</span>
        <h1 className="page-title">새 공동구매 등록</h1>
        <p className="page-lead">정가와 총 재고를 입력하면 상품 유형에 맞는 공동구매 가격 정책과 최대 참여 인원을 자동으로 계산합니다.</p>

        <section className="type-policy-guide">
          {(Object.entries(productTypePolicy) as [ProductType, typeof policy][]).map(([policyType, item]) => (
            <button type="button" className={`type-policy-card ${type === policyType ? "active" : ""}`} key={policyType} onClick={() => setType(policyType)}>
              <span className="type-policy-check">{type === policyType ? "선택됨" : "선택"}</span>
              <strong>{item.label}</strong>
              <p>{item.summary}</p>
              <ul>{item.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
            </button>
          ))}
        </section>

        <form onSubmit={submit} className="content-grid" style={{ marginTop:28, alignItems:"start" }}>
          <div className="panel">
            <div className="selected-policy">
              <div><span className="eyebrow">Selected product type</span><h3>{policy.label}</h3><p>{policy.summary}</p></div>
              <span className="fixed-fee">예상 적용 수수료 <b>{commissionPercent}%</b></span>
            </div>
            <div className="form-grid">
              <div className="form-group full hold-notice">
                <b>등록 금지 품목 안내</b>
                <span>마약류, 주류, 담배, 청소년 유해제품, 불법 의약품, 무기류, 도난품, 위조품, 권리 침해 상품, 안전 기준 미충족 상품, 개인정보가 포함된 물품 및 그 밖에 법령·행정명령·플랫폼 정책상 거래나 무료 제공이 금지 또는 제한된 품목은 등록할 수 없습니다.</span>
              </div>
              <div className="form-group full"><label>상품명</label><input className="field" placeholder="상품명을 입력하세요" required/></div>
              <div className="form-group full"><label>상품 설명</label><textarea className="field" placeholder="상품과 공동구매를 소개해주세요."/></div>
              <div className="form-group"><label>상품 타입</label><input className="field readonly-field" value={policy.label} readOnly/></div>
              <div className="form-group"><label>판매자명</label><input className="field" defaultValue="DropDeal 파트너"/></div>
              {type === "CLEARANCE" && <>
                <div className="form-group"><label>재고떨이 사유</label><select className="field" required defaultValue=""><option value="" disabled>소진 사유를 선택하세요</option>{clearanceReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></div>
                <div className="form-group"><label>고지 대상 상태</label><input className="field" placeholder="예: 유통기한 2026.08.30까지" required/></div>
                <div className="form-group full policy-confirm"><label><input type="checkbox" required/> 재고 소진 사유와 상품 상태를 구매자에게 명확히 고지했음을 확인합니다.</label></div>
              </>}
              {type === "FREE_GIVEAWAY" && <>
                <div className="form-group"><label>무료나눔 사유</label><select className="field" required defaultValue=""><option value="" disabled>무료나눔 사유를 선택하세요</option>{giveawayReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></div>
                <div className="form-group"><label>홍보 목적 여부</label><select className="field" defaultValue="false"><option value="false">순수 무료 기부</option><option value="true">가게 홍보 및 방문 유도 포함</option></select></div>
                <div className="form-group full policy-confirm">
                  <label><input type="checkbox" checked={giveawayFulfillment.shipping} onChange={(event)=>setGiveawayFulfillment((current)=>({...current, shipping:event.target.checked}))}/> 택배 수령 허용</label>
                  <label><input type="checkbox" checked={giveawayFulfillment.pickup} onChange={(event)=>setGiveawayFulfillment((current)=>({...current, pickup:event.target.checked}))}/> 가게 직접 픽업 허용</label>
                  <small className="auto-policy-help">최소 한 가지 수령 방법을 선택해야 합니다.</small>
                </div>
                {giveawayFulfillment.shipping && <div className="form-group"><label>택배비</label><input className="field" type="number" min="0" defaultValue="3000" required/><small className="auto-policy-help">소비자는 상품 가격 없이 택배비만 결제합니다.</small></div>}
                {giveawayFulfillment.pickup && <>
                  <div className="form-group"><label>픽업 보증금</label><input className="field readonly-field" value={won(2000)} readOnly/><small className="auto-policy-help">수령 완료 확인 시 소비자에게 전액 반환됩니다.</small></div>
                  <div className="form-group"><label>가게명</label><input className="field" placeholder="픽업할 가게명" required/></div>
                  <div className="form-group"><label>가게 주소</label><input className="field" placeholder="픽업 주소" required/></div>
                  <div className="form-group full"><label>픽업 안내</label><textarea className="field" placeholder="운영 시간, 방문 방법, 수령 위치를 안내해주세요." required/></div>
                </>}
                <div className="form-group full policy-confirm"><label><input type="checkbox" required/> 완전무료! 상품에는 플랫폼 수수료가 없으며, 상품 대금을 받을 수 없음을 확인합니다.</label></div>
              </>}
              {type !== "FREE_GIVEAWAY" && <div className="form-group"><label>정가</label><input className="field" type="number" min={MIN_ORIGINAL_PRICE} value={values.original} onChange={number("original")} onBlur={normalizeNumber("original", MIN_ORIGINAL_PRICE)}/><small className="auto-policy-help">입력 중에는 자유롭게 수정할 수 있으며 최소 정가는 {won(MIN_ORIGINAL_PRICE)}입니다.</small></div>}
              {type !== "FREE_GIVEAWAY" && <div className="form-group"><label>택배비</label><input className="field" type="number" min="0" defaultValue="3000" required/><small className="auto-policy-help">결제 시 상품 가격에 합산됩니다.</small></div>}
              <div className="form-group"><label>총 재고 수량</label><input className="field" type="number" min={MIN_GROUP_BUY_STOCK} value={values.stock} onChange={number("stock")} onBlur={normalizeNumber("stock", MIN_GROUP_BUY_STOCK)}/><small className="auto-policy-help">공동구매 등록을 위한 최소 총 재고는 {MIN_GROUP_BUY_STOCK}개입니다.</small></div>
              <div className="form-group"><label>최소 참여 인원</label><input className="field readonly-field" value={`${pricing.minParticipants}명`} readOnly/><small className="auto-policy-help">총 재고와 상품 유형에 따라 자동 설정됩니다.</small></div>
              {type !== "FREE_GIVEAWAY" && <div className="form-group"><label>가격 할인 시작 인원</label><input className="field readonly-field" value={`${pricing.discountStartParticipants}명`} readOnly/><small className="auto-policy-help">해당 인원 달성 전에는 정가를 유지하고, 달성 시 공동구매 시작가를 적용합니다.</small></div>}
              <div className="form-group"><label>최대 참여 인원</label><input className="field readonly-field" value={`${pricing.maxParticipants}명`} readOnly/><small className="auto-policy-help">총 재고 수량과 동일하게 자동 설정됩니다.</small></div>
              {type !== "FREE_GIVEAWAY" && <>
                <div className="form-group"><label>{type === "CLEARANCE" ? "재고떨이 기본가" : "공동구매 시작가"}</label><input className="field readonly-field" value={won(pricing.startPrice)} readOnly/><small className="auto-policy-help">{type === "CLEARANCE" ? "주문 시작부터 정가의 50% 할인가가 적용됩니다." : "상품 유형과 정가를 기준으로 자동 산정됩니다."}</small></div>
                <div className="form-group"><label>최저 판매가</label><input className="field readonly-field" value={won(pricing.minPrice)} readOnly/><small className="auto-policy-help">최대 할인율 {pricing.maxDiscountRate}%를 반영합니다.</small></div>
              </>}
              {type === "NORMAL" && <>
                <div className="form-group"><label>몇 명마다 가격 하락</label><input className="field readonly-field" value={`${pricing.stepParticipants}명`} readOnly/><small className="auto-policy-help">총 재고에 맞춰 할인 단계를 분배합니다.</small></div>
                <div className="form-group"><label>단계당 할인 금액</label><input className="field readonly-field" value={won(pricing.stepAmount)} readOnly/><small className="auto-policy-help">가격 범위와 할인 단계 수로 자동 계산됩니다.</small></div>
              </>}
              <div className="form-group full auto-policy-summary"><strong>시스템 자동 가격 정책</strong><span>{type === "FREE_GIVEAWAY" ? "상품 가격 0원 · 플랫폼 수수료 0원 · 택배비 또는 환불형 픽업 보증금만 결제" : type === "CLEARANCE" ? `기본 50% 할인 · ${pricing.clearanceDeepDiscountParticipants}명 달성 시 70% 할인 · 최소 주문 인원 ${pricing.minParticipants}명` : `${policy.label} 기준 시작 할인 ${pricing.startDiscountRate}% · 최대 할인 ${pricing.maxDiscountRate}% · 총 ${pricing.stepCount}단계`}</span></div>
              <div className="form-group full pricing-basis">
                <span className="eyebrow">Seller only · 가격 단계 산정 근거</span>
                <strong>{type === "FREE_GIVEAWAY" ? "완전무료! 상품은 상품 대금과 플랫폼 수수료가 발생하지 않습니다." : type === "CLEARANCE" ? "재고떨이는 기본 50% 할인, 총 재고 70% 참여 시 70% 할인을 적용합니다." : `${pricing.stockRangeLabel} 기준으로 ${pricing.stepCount}단계를 적용했습니다.`}</strong>
                {type === "FREE_GIVEAWAY" ? (
                  <ul>
                    <li>상품 가격과 판매자 정산금 = 0원</li>
                    <li>플랫폼 중개수수료 = 0원</li>
                    <li>택배 선택 시 판매자가 등록한 택배비만 결제</li>
                    <li>매장 픽업 선택 시 2,000원 보증금 결제 후 수령 완료 시 전액 반환</li>
                    <li>픽업 예약 완료 후 교환 코드와 QR을 발급합니다.</li>
                  </ul>
                ) : type === "CLEARANCE" ? (
                  <ul>
                    <li>기본 주문 가격 = 정가의 50% {won(pricing.startPrice)}</li>
                    <li>최소 주문 인원 = 총 재고의 {Math.round(pricing.minimumParticipationRate * 100)}% → {pricing.minParticipants}명</li>
                    <li>70% 할인 조건 = 총 재고의 70% → {pricing.clearanceDeepDiscountParticipants}명 달성 시 {won(pricing.minPrice)}</li>
                    <li>마감 시 최소 주문 인원 미충족 시 공동구매 실패 및 전액 환불</li>
                    <li>중간 단계 할인과 쿠폰 중복 할인은 적용하지 않습니다.</li>
                  </ul>
                ) : (
                  <ul>
                    <li>가격 할인 시작 = 최소 참여 인원 {pricing.discountStartParticipants}명 달성 시 시작가 {won(pricing.startPrice)} 적용</li>
                    <li>단계당 참여 인원 = 할인 시작 후 남은 인원 ÷ {pricing.stepCount}단계 → 약 {pricing.stepParticipants}명</li>
                    <li>최소 참여 인원 = 총 재고의 {Math.round(pricing.minimumParticipationRate * 100)}% → {pricing.minParticipants}명</li>
                    <li>할인 가능 범위 = 시작가 {won(pricing.startPrice)} - 최저가 {won(pricing.minPrice)}</li>
                    <li>단계당 할인 금액 = 할인 가능 범위 ÷ {pricing.stepCount}단계 → {won(pricing.stepAmount)}</li>
                    <li>가격은 구매자가 이해하기 쉽도록 100원 단위로 반올림합니다.</li>
                  </ul>
                )}
              </div>
              <div className="form-group full"><label>적용 중개수수료율</label><div className="fixed-fee-field"><b>{commissionPercent}%</b><span>{type === "FREE_GIVEAWAY" ? "완전무료! 상품은 사이트 수수료를 받지 않습니다." : "예상 최종 판매금액이 높을수록 낮은 수수료 구간이 자동 적용됩니다."}</span></div></div>
              {type !== "FREE_GIVEAWAY" && <div className="form-group full commission-tier-guide">{[...commissionTiers].reverse().map((tier) => <span className={tier.rate === estimate.commissionRate ? "active" : ""} key={tier.rate}>{tier.label}<b>{tier.rate * 100}%</b></span>)}</div>}
              <div className="form-group full policy-confirm"><label><input type="checkbox" required/> 등록 상품이 법령·행정명령·플랫폼 정책상 금지 또는 제한 품목에 해당하지 않고, 본인에게 판매·기부 권한이 있으며, 타인의 지식재산권·개인정보·소유권을 침해하지 않음을 확인합니다.</label></div>
              <div className="form-group full coupon-policy-box">
                <div><span className="eyebrow">Coupon recommendation</span><strong>{couponRecommendation.rate ? `${couponRecommendation.rate}% 쿠폰 이벤트 추천` : "쿠폰 이벤트 미적용 권장"}</strong><p>{couponRecommendation.reason}</p></div>
                {recommendedCouponPolicy && <div className="coupon-policy-limit"><span>최대 할인</span><b>{won(recommendedCouponPolicy.maxDiscountAmount)}</b>{expectedCouponWinners && <small>예상 참여자의 5% · 약 {expectedCouponWinners}명 추첨</small>}</div>}
              </div>
              <div className="form-group full coupon-rate-guide">{(Object.entries(couponPolicies) as [string, (typeof couponPolicies)[keyof typeof couponPolicies]][]).map(([rate, item]) => <span className={Number(rate) === couponRecommendation.rate ? "active" : ""} key={rate}><b>{rate}%</b><small>{item.target}</small><em>최대 {won(item.maxDiscountAmount)}</em></span>)}</div>
            </div>
            <button className="btn btn-primary" style={{ marginTop:20, width:"100%" }} disabled={type === "FREE_GIVEAWAY" && !giveawayFulfillment.shipping && !giveawayFulfillment.pickup}>{saved ? "Mock 상품 등록 완료" : type === "FREE_GIVEAWAY" ? "완전무료! 상품 등록하기" : "공동구매 등록하기"}</button>
          </div>

          <aside className="policy-preview">
            <span className="eyebrow" style={{ color:"var(--lime)" }}>Price policy preview</span>
            <h3>{type === "FREE_GIVEAWAY" ? "무료나눔 정책 미리보기" : type === "CLEARANCE" ? "재고떨이 할인 미리보기" : "가격 단계 미리보기"}</h3>
            {steps.map((step) => <div className="policy-step" key={step.people}><span>{step.people}명 참여 · {step.label}</span><b>{won(step.price)}</b></div>)}
            <div className="policy-step"><span>{type === "FREE_GIVEAWAY" ? "상품 가격" : "최저 판매가"}</span><b style={{ color:"var(--lime)" }}>{won(pricing.minPrice)}</b></div>
            <div className="estimate-box">
              <span className="eyebrow" style={{ color:"var(--lime)" }}>Settlement preview</span>
              <h3>예상 정산금</h3>
              <div className="policy-step"><span>예상 참여 인원</span><b>{estimate.expectedParticipants}명 ({Math.round(estimate.expectedSellThroughRate * 100)}%)</b></div>
              <div className="policy-step"><span>{type === "FREE_GIVEAWAY" ? "플랫폼 수수료" : type === "CLEARANCE" ? "예상 적용 할인" : "예상 도달 가격 단계"}</span><b>{type === "FREE_GIVEAWAY" ? "0원" : type === "CLEARANCE" ? estimate.expectedFinalPrice === pricing.minPrice ? "70% 할인" : "50% 할인" : `${estimate.reachedSteps} / ${pricing.stepCount}단계`}</b></div>
              <div className="policy-step"><span>예상 최종 단가</span><b>{won(estimate.expectedFinalPrice)}</b></div>
              <div className="policy-step"><span>예상 최종 판매금액</span><b>{won(estimate.grossAmount)}</b></div>
              <div className="policy-step"><span>플랫폼 중개수수료 ({commissionPercent}%)</span><b>-{won(estimate.platformFee)}</b></div>
              <div className="policy-step"><span>예상 PG 수수료 (3%)</span><b>-{won(estimate.pgFee)}</b></div>
              <div className="policy-step estimate-total"><span>예상 판매자 정산금</span><b>{won(estimate.settlementAmount)}</b></div>
              <p>상품 유형, 정가대, 총 재고, 최소 참여 인원과 예상 도달 가격 단계를 반영한 예측값입니다. 실제 정산금은 최종 참여, 환불, 배송, 할인 분담금에 따라 달라질 수 있습니다.</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
