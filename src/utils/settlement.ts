import { ProductType } from "@/types/product";

export const commissionRateByType = (type: ProductType) =>
  type === "CLEARANCE" ? 0.12 : 0.09;

export const calculateSettlement = (
  grossAmount: number,
  commissionRate: number,
  pgFeeRate = 0.03,
) => {
  const platformFee = Math.floor(grossAmount * commissionRate);
  const pgFee = Math.floor(grossAmount * pgFeeRate);

  return {
    platformFee,
    pgFee,
    settlementAmount: Math.max(0, grossAmount - platformFee - pgFee),
  };
};
