import type { ProductType } from "@/types/product";

const roundToHundred = (value: number) => Math.max(100, Math.round(value / 100) * 100);

const discountPolicy: Record<ProductType, { startRate: number; maxRate: number }> = {
  NORMAL: { startRate: 0.1, maxRate: 0.35 },
  CLEARANCE: { startRate: 0.2, maxRate: 0.55 },
};

const priceStepCountByStock = (stock: number) => {
  if (stock <= 30) return 3;
  if (stock <= 60) return 5;
  if (stock <= 100) return 7;
  if (stock <= 200) return 9;
  return 12;
};

export const calculateProductPricing = (
  type: ProductType,
  originalPrice: number,
  stock: number,
) => {
  const safeOriginalPrice = Math.max(100, originalPrice);
  const safeStock = Math.max(1, stock);
  const policy = discountPolicy[type];
  const stepCount = priceStepCountByStock(safeStock);
  const stepParticipants = Math.max(1, Math.ceil(safeStock / stepCount));
  const startPrice = roundToHundred(safeOriginalPrice * (1 - policy.startRate));
  const minPrice = Math.min(startPrice, roundToHundred(safeOriginalPrice * (1 - policy.maxRate)));
  const stepAmount = roundToHundred((startPrice - minPrice) / stepCount);

  return {
    startPrice,
    minPrice,
    stepParticipants,
    stepAmount,
    maxParticipants: safeStock,
    stepCount,
    startDiscountRate: Math.round(policy.startRate * 100),
    maxDiscountRate: Math.round(policy.maxRate * 100),
  };
};

const baseSellThroughRate: Record<ProductType, number> = {
  NORMAL: 0.68,
  CLEARANCE: 0.82,
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
  const reachedSteps = Math.min(
    pricing.stepCount,
    Math.floor(expectedParticipants / pricing.stepParticipants),
  );
  const expectedFinalPrice = Math.max(
    pricing.minPrice,
    pricing.startPrice - reachedSteps * pricing.stepAmount,
  );

  return {
    expectedParticipants,
    expectedSellThroughRate,
    expectedFinalPrice,
    expectedGrossAmount: expectedParticipants * expectedFinalPrice,
    reachedSteps,
  };
};
