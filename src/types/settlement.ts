export type SettlementStatus =
  | "PENDING"
  | "CALCULATED"
  | "ON_HOLD"
  | "READY"
  | "REQUESTED"
  | "PAID"
  | "FAILED"
  | "CANCELED";

export type SettlementOrder = {
  id: string;
  productName: string;
  finalAmount: number;
  refundAmount: number;
  platformFee: number;
  pgFee: number;
  sellerDiscountShare: number;
  settlementAmount: number;
};

export type Settlement = {
  id: number;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  refundAmount: number;
  platformFee: number;
  pgFee: number;
  sellerDiscountShare: number;
  additionalFee: number;
  settlementAmount: number;
  status: SettlementStatus;
  scheduledAt?: string;
  paidAt?: string;
  holdReason?: string;
  orders: SettlementOrder[];
};
