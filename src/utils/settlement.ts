export const commissionTiers = [
  { minimumGrossAmount: 10_000_000, rate: 0.06, label: "1,000만원 이상" },
  { minimumGrossAmount: 3_000_000, rate: 0.08, label: "300만원 이상" },
  { minimumGrossAmount: 1_000_000, rate: 0.1, label: "100만원 이상" },
  { minimumGrossAmount: 0, rate: 0.12, label: "100만원 미만" },
] as const;

export const platformCommissionRate = (grossAmount: number) =>
  commissionTiers.find((tier) => grossAmount >= tier.minimumGrossAmount)?.rate ?? 0.12;

export const calculateSettlement = (
  grossAmount: number,
  commissionRate = platformCommissionRate(grossAmount),
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
