import { PLATFORM_COMMISSION_RATE } from "@/constants/productPolicy";

export const platformCommissionRate = () => PLATFORM_COMMISSION_RATE;

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
