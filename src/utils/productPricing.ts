import type { ProductType } from "@/types/product";

export const MIN_GROUP_BUY_STOCK = 10;
export const MIN_ORIGINAL_PRICE = 100;

const roundToHundred = (value: number) => Math.max(100, Math.round(value / 100) * 100);

const discountPolicy: Record<ProductType, { startRate: number; maxRate: number }> = {
  NORMAL: { startRate: 0.05, maxRate: 0.25 },
  CLEARANCE: { startRate: 0.5, maxRate: 0.7 },
  FREE_GIVEAWAY: { startRate: 1, maxRate: 1 },
};

const priceStepPolicyByStock = (stock: number) => {
  if (stock <= 30) return { stepCount: 3, stockRangeLabel: "총 재고 30개 이하" };
  if (stock <= 60) return { stepCount: 5, stockRangeLabel: "총 재고 31~60개" };
  if (stock <= 100) return { stepCount: 7, stockRangeLabel: "총 재고 61~100개" };
  if (stock <= 200) return { stepCount: 9, stockRangeLabel: "총 재고 101~200개" };
  return { stepCount: 12, stockRangeLabel: "총 재고 201개 이상" };
};

const minimumParticipationRateByStock = (stock: number) => {
  if (stock <= 30) return 0.4;
  if (stock <= 60) return 0.3;
  if (stock <= 100) return 0.25;
  if (stock <= 200) return 0.2;
  return 0.15;
};

export const calculateProductPricing = (
  type: ProductType,
  originalPrice: number,
  stock: number,
) => {
  const safeOriginalPrice = Math.max(MIN_ORIGINAL_PRICE, originalPrice);
  const safeStock = Math.max(MIN_GROUP_BUY_STOCK, stock);
  const policy = discountPolicy[type];
  const stepPolicy = priceStepPolicyByStock(safeStock);
  const stepCount = type === "NORMAL" ? stepPolicy.stepCount : 0;
  const stockRangeLabel = type === "CLEARANCE"
    ? "재고떨이 50%·70% 할인"
    : type === "FREE_GIVEAWAY"
      ? "완전무료! 상품"
      : stepPolicy.stockRangeLabel;
  const baseMinimumParticipationRate = minimumParticipationRateByStock(safeStock);
  const minimumParticipationRate = Math.max(
    0.1,
    type === "FREE_GIVEAWAY" ? 0 : baseMinimumParticipationRate - (type === "CLEARANCE" ? 0.05 : 0),
  );
  const minParticipants = type === "FREE_GIVEAWAY" ? 1 : Math.ceil(safeStock * minimumParticipationRate);
  const clearanceDeepDiscountParticipants = Math.ceil(safeStock * 0.7);
  const stepParticipants = stepCount === 0
    ? clearanceDeepDiscountParticipants
    : Math.max(1, Math.ceil((safeStock - minParticipants) / stepCount));
  const startPrice = type === "FREE_GIVEAWAY" ? 0 : roundToHundred(safeOriginalPrice * (1 - policy.startRate));
  const minPrice = type === "FREE_GIVEAWAY" ? 0 : Math.min(startPrice, roundToHundred(safeOriginalPrice * (1 - policy.maxRate)));
  const stepAmount = stepCount === 0 ? 0 : roundToHundred((startPrice - minPrice) / stepCount);

  return {
    startPrice,
    minPrice,
    stepParticipants,
    stepAmount,
    maxParticipants: safeStock,
    stepCount,
    stockRangeLabel,
    minParticipants,
    discountStartParticipants: minParticipants,
    minimumParticipationRate,
    clearanceDeepDiscountParticipants,
    startDiscountRate: Math.round(policy.startRate * 100),
    maxDiscountRate: Math.round(policy.maxRate * 100),
  };
};

const baseSellThroughRate: Record<ProductType, number> = {
  NORMAL: 0.68,
  CLEARANCE: 0.82,
  FREE_GIVEAWAY: 0.95,
};

export const calculateSalesForecast = ({
  type,
  originalPrice,
  stock,
  minParticipants,
  pricing,
}: {
  type: ProductType;
  originalPrice: number;
  stock: number;
  minParticipants: number;
  pricing: ReturnType<typeof calculateProductPricing>;
}) => {
  const priceDemandAdjustment = originalPrice >= 100_000 ? -0.12 : originalPrice >= 50_000 ? -0.06 : originalPrice <= 20_000 ? 0.08 : 0;
  const stockAdjustment = stock >= 200 ? -0.08 : stock <= 30 ? 0.06 : 0;
  const minimumRatio = Math.min(1, minParticipants / Math.max(1, stock));
  const minimumAdjustment = minimumRatio <= 0.3 ? 0.04 : minimumRatio >= 0.7 ? -0.08 : 0;
  const expectedSellThroughRate = Math.min(
    0.95,
    Math.max(0.3, baseSellThroughRate[type] + priceDemandAdjustment + stockAdjustment + minimumAdjustment),
  );
  const expectedParticipants = Math.min(
    stock,
    Math.max(minParticipants, Math.round(stock * expectedSellThroughRate)),
  );
  const reachedSteps = pricing.stepCount === 0 || expectedParticipants < pricing.discountStartParticipants
    ? 0
    : Math.min(
      pricing.stepCount,
      Math.floor((expectedParticipants - pricing.discountStartParticipants) / pricing.stepParticipants),
    );
  const expectedFinalPrice = type === "FREE_GIVEAWAY"
    ? 0
    : type === "CLEARANCE"
    ? expectedParticipants >= pricing.clearanceDeepDiscountParticipants
      ? pricing.minPrice
      : pricing.startPrice
    : expectedParticipants < pricing.discountStartParticipants
    ? originalPrice
    : Math.max(pricing.minPrice, pricing.startPrice - reachedSteps * pricing.stepAmount);

  return {
    expectedParticipants,
    expectedSellThroughRate,
    expectedFinalPrice,
    expectedGrossAmount: expectedParticipants * expectedFinalPrice,
    reachedSteps,
  };
};
