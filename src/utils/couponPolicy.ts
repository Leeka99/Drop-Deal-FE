import type { ProductType } from "@/types/product";

export type CouponRate = 3 | 5 | 10 | 15 | 30;

export const couponPolicies: Record<CouponRate, {
  target: string;
  maxDiscountAmount: number;
  winnerRate?: number;
}> = {
  3: { target: "전체 공동구매 · 신규 참여 유도", maxDiscountAmount: 3_000 },
  5: { target: "참여율 70% 이상 · 재구매 유도", maxDiscountAmount: 5_000 },
  10: { target: "참여율 40~70% · 마감 임박 상품", maxDiscountAmount: 10_000 },
  15: { target: "참여율 40% 미만 · 재고떨이 상품", maxDiscountAmount: 15_000 },
  30: { target: "승인된 특별 프로모션 상품", maxDiscountAmount: 10_000, winnerRate: 0.05 },
};

export const couponWinnerCount = (participants: number, winnerRate?: number) =>
  winnerRate ? Math.max(1, Math.floor(Math.max(0, participants) * winnerRate)) : null;

export const recommendCoupon = ({
  type,
  participationRate,
  maxDiscountReached = false,
  specialPromotion = false,
}: {
  type: ProductType;
  participationRate: number;
  maxDiscountReached?: boolean;
  specialPromotion?: boolean;
}) => {
  if (specialPromotion) return { rate: 30 as CouponRate, reason: "특별 프로모션 승인 대상" };
  if (maxDiscountReached) return { rate: null, reason: "최대 할인 상품은 쿠폰 중복 할인을 제한합니다." };
  if (type === "CLEARANCE" || participationRate < 0.4) return { rate: 15 as CouponRate, reason: "재고떨이 또는 참여율 40% 미만 상품" };
  if (participationRate < 0.7) return { rate: 10 as CouponRate, reason: "참여율 40~70% 상품" };
  if (participationRate < 0.9) return { rate: 5 as CouponRate, reason: "참여율 70% 이상 상품" };
  return { rate: 3 as CouponRate, reason: "전체 공동구매 참여 유도" };
};
