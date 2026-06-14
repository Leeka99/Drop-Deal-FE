export type ProductStatus = "SCHEDULED" | "OPEN" | "SOLD_OUT" | "CLOSED" | "FAILED";
export type ProductType = "NORMAL" | "CLEARANCE";

export type Product = {
  id: number;
  name: string;
  sellerName: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  originalPrice: number;
  startPrice: number;
  currentPrice: number;
  minPrice: number;
  maxDiscountRate: number;
  discountStepParticipants: number;
  discountStepAmount: number;
  minParticipants: number;
  currentParticipants: number;
  maxParticipants: number;
  remainingStock: number;
  endAt: string;
  couponEvent: boolean;
  couponRate?: 3 | 5 | 10 | 15 | 30;
  visual: string;
  icon: string;
  rating: number;
  reviewCount: number;
};
